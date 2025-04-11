import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { 
  transcribeAudio, 
  generateSOAPNotes,
  generateChartSummary,
  checkClinicalGuidelines,
  generateMedicalCodes
} from "./openai";
import { z } from "zod";
import { 
  insertPatientSchema, 
  insertConversationSchema, 
  insertSoapNoteSchema,
  insertAdditionalNoteSchema,
  insertTranscriptSegmentSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up multer for file uploads
  const memStorage = multer.memoryStorage();
  const upload = multer({ 
    storage: memStorage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
  });

  // API routes for Intellimed AI
  // 1. Patient routes
  app.post("/api/patients", async (req, res) => {
    try {
      const validatedData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(validatedData);
      res.status(201).json(patient);
    } catch (error) {
      res.status(400).json({ error: `Invalid patient data: ${error}` });
    }
  });

  app.get("/api/patients", async (req, res) => {
    try {
      const patients = await storage.getAllPatients();
      res.status(200).json(patients);
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch patients: ${error}` });
    }
  });

  app.get("/api/patients/:id", async (req, res) => {
    try {
      const patientId = parseInt(req.params.id);
      const patient = await storage.getPatient(patientId);
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }
      res.status(200).json(patient);
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch patient: ${error}` });
    }
  });

  // 2. Audio/transcription routes
  app.post("/api/upload-audio", upload.single("audioFile"), async (req, res) => {
    try {
      // Use Express.Multer.File type
      const file = req.file as Express.Multer.File;
      
      if (!file) {
        return res.status(400).json({ error: "No audio file uploaded" });
      }

      // Transcribe the audio file
      const transcriptionResult = await transcribeAudio(file.buffer);
      
      // Return the transcription
      res.status(200).json({ transcript: transcriptionResult.text });
    } catch (error) {
      console.error("Audio upload error:", error);
      res.status(500).json({ error: "Failed to process audio" });
    }
  });

  // 3. Transcript segment routes
  app.post("/api/transcript-segments", async (req, res) => {
    try {
      const validatedData = insertTranscriptSegmentSchema.parse(req.body);
      const segment = await storage.createTranscriptSegment(validatedData);
      res.status(201).json(segment);
    } catch (error) {
      res.status(400).json({ error: `Invalid transcript segment data: ${error}` });
    }
  });

  app.get("/api/conversations/:id/transcript-segments", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const segments = await storage.getTranscriptSegmentsByConversation(conversationId);
      res.status(200).json(segments);
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch transcript segments: ${error}` });
    }
  });

  // 4. Conversation routes
  app.post("/api/conversations", async (req, res) => {
    try {
      const validatedData = insertConversationSchema.parse({
        ...req.body,
        recordedAt: new Date()
      });
      const conversation = await storage.createConversation(validatedData);
      res.status(201).json(conversation);
    } catch (error) {
      res.status(400).json({ error: `Invalid conversation data: ${error}` });
    }
  });

  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.status(200).json(conversation);
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch conversation: ${error}` });
    }
  });

  // 5. SOAP notes generation
  app.post("/api/generate-soap-notes", async (req, res) => {
    try {
      const schema = z.object({
        transcript: z.string(),
        conversationId: z.number().optional(),
        format: z.enum(["paragraph", "bullets"]).optional().default("paragraph"),
        detail: z.enum(["detailed", "concise"]).optional().default("detailed"),
      });
      const { transcript, conversationId, format, detail } = schema.parse(req.body);

      // Generate SOAP notes from transcript
      const soapNotes = await generateSOAPNotes(transcript, format, detail);
      
      // Save the SOAP notes if conversationId is provided
      if (conversationId) {
        const now = new Date();
        const savedSoapNote = await storage.createSoapNote({
          conversationId,
          subjective: soapNotes.subjective,
          objective: soapNotes.objective,
          assessment: soapNotes.assessment,
          plan: soapNotes.plan,
          createdAt: now,
          updatedAt: now,
        });
        
        return res.status(201).json({
          ...soapNotes,
          id: savedSoapNote.id,
        });
      }
      
      // Return the generated SOAP notes without saving
      res.status(200).json(soapNotes);
    } catch (error) {
      res.status(500).json({ error: `Failed to generate SOAP notes: ${error}` });
    }
  });

  // 6. SOAP notes routes
  app.get("/api/soap-notes/:id", async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      const soapNote = await storage.getSoapNote(noteId);
      if (!soapNote) {
        return res.status(404).json({ error: "SOAP note not found" });
      }
      res.status(200).json(soapNote);
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch SOAP note: ${error}` });
    }
  });

  app.put("/api/soap-notes/:id", async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      const updateSchema = z.object({
        subjective: z.string().optional(),
        objective: z.string().optional(),
        assessment: z.string().optional(),
        plan: z.string().optional(),
      });
      
      const validatedData = updateSchema.parse(req.body);
      const updatedNote = await storage.updateSoapNote(noteId, {
        ...validatedData,
        updatedAt: new Date(),
      });
      
      if (!updatedNote) {
        return res.status(404).json({ error: "SOAP note not found" });
      }
      
      res.status(200).json(updatedNote);
    } catch (error) {
      res.status(400).json({ error: `Failed to update SOAP note: ${error}` });
    }
  });

  // 7. Additional agent routes
  app.post("/api/generate-chart-summary", async (req, res) => {
    try {
      const schema = z.object({
        soapNoteId: z.number(),
        subjective: z.string(),
        objective: z.string(),
        assessment: z.string(),
        plan: z.string(),
      });
      const { soapNoteId, subjective, objective, assessment, plan } = schema.parse(req.body);
      
      const summary = await generateChartSummary({ subjective, objective, assessment, plan });
      
      // Save the chart summary
      const additionalNote = await storage.createAdditionalNote({
        soapNoteId,
        type: "chart_summary",
        content: summary,
        createdAt: new Date(),
      });
      
      res.status(201).json({
        id: additionalNote.id,
        content: summary,
        type: "chart_summary",
      });
    } catch (error) {
      res.status(500).json({ error: `Failed to generate chart summary: ${error}` });
    }
  });

  app.post("/api/check-clinical-guidelines", async (req, res) => {
    try {
      const schema = z.object({
        soapNoteId: z.number(),
        subjective: z.string(),
        objective: z.string(),
        assessment: z.string(),
        plan: z.string(),
      });
      const { soapNoteId, subjective, objective, assessment, plan } = schema.parse(req.body);
      
      const guidelines = await checkClinicalGuidelines({ subjective, objective, assessment, plan });
      
      // Save the clinical guidelines check
      const additionalNote = await storage.createAdditionalNote({
        soapNoteId,
        type: "clinical_guidelines",
        content: guidelines,
        createdAt: new Date(),
      });
      
      res.status(201).json({
        id: additionalNote.id,
        content: guidelines,
        type: "clinical_guidelines",
      });
    } catch (error) {
      res.status(500).json({ error: `Failed to check clinical guidelines: ${error}` });
    }
  });

  app.post("/api/generate-medical-codes", async (req, res) => {
    try {
      const schema = z.object({
        soapNoteId: z.number(),
        subjective: z.string(),
        objective: z.string(),
        assessment: z.string(),
        plan: z.string(),
      });
      const { soapNoteId, subjective, objective, assessment, plan } = schema.parse(req.body);
      
      const codes = await generateMedicalCodes({ subjective, objective, assessment, plan });
      
      // Save the medical codes
      const additionalNote = await storage.createAdditionalNote({
        soapNoteId,
        type: "cpt_icd",
        content: codes,
        createdAt: new Date(),
      });
      
      res.status(201).json({
        id: additionalNote.id,
        content: codes,
        type: "cpt_icd",
      });
    } catch (error) {
      res.status(500).json({ error: `Failed to generate medical codes: ${error}` });
    }
  });

  app.get("/api/additional-notes/:soapNoteId", async (req, res) => {
    try {
      const soapNoteId = parseInt(req.params.soapNoteId);
      const additionalNotes = await storage.getAdditionalNotesBySoapNote(soapNoteId);
      res.status(200).json(additionalNotes);
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch additional notes: ${error}` });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
