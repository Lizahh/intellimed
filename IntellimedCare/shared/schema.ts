import { pgTable, text, serial, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (doctors, etc.)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true,
});

// Patient schema
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull().unique(),
  name: text("name").notNull(),
  dateOfBirth: text("date_of_birth"),
  visitType: text("visit_type"), // In database, we keep as text
  appointmentTime: timestamp("appointment_time"),
});

export const insertPatientSchema = createInsertSchema(patients).pick({
  patientId: true,
  name: true,
  dateOfBirth: true,
  visitType: true,
  appointmentTime: true,
}).extend({
  // Override with zod validation to ensure only valid visit types
  visitType: z.enum(["New patient", "Follow up"]),
});

// Conversation schema
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  userId: integer("user_id").notNull(),
  recordingUrl: text("recording_url"),
  transcript: text("transcript"),
  recordedAt: timestamp("recorded_at").notNull(),
});

export const insertConversationSchema = createInsertSchema(conversations).pick({
  patientId: true,
  userId: true,
  recordingUrl: true,
  transcript: true,
  recordedAt: true,
});

// SOAP Note schema
export const soapNotes = pgTable("soap_notes", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  subjective: text("subjective"),
  objective: text("objective"),
  assessment: text("assessment"),
  plan: text("plan"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const insertSoapNoteSchema = createInsertSchema(soapNotes).pick({
  conversationId: true,
  subjective: true,
  objective: true,
  assessment: true,
  plan: true,
  createdAt: true,
  updatedAt: true,
});

// Additional agents schema
export const additionalNotes = pgTable("additional_notes", {
  id: serial("id").primaryKey(),
  soapNoteId: integer("soap_note_id").notNull(),
  type: text("type").notNull(), // "chart_summary", "clinical_guidelines", "cpt_icd"
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const insertAdditionalNoteSchema = createInsertSchema(additionalNotes).pick({
  soapNoteId: true,
  type: true,
  content: true,
  createdAt: true,
});

// Transcript segment schema for managing the transcript timestamps
export const transcriptSegments = pgTable("transcript_segments", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  speaker: text("speaker").notNull(), // "doctor" or "patient"
  content: text("content").notNull(),
  startTime: integer("start_time").notNull(),
  endTime: integer("end_time").notNull(),
});

export const insertTranscriptSegmentSchema = createInsertSchema(transcriptSegments).pick({
  conversationId: true,
  speaker: true,
  content: true,
  startTime: true,
  endTime: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export type SoapNote = typeof soapNotes.$inferSelect;
export type InsertSoapNote = z.infer<typeof insertSoapNoteSchema>;

export type AdditionalNote = typeof additionalNotes.$inferSelect;
export type InsertAdditionalNote = z.infer<typeof insertAdditionalNoteSchema>;

export type TranscriptSegment = typeof transcriptSegments.$inferSelect;
export type InsertTranscriptSegment = z.infer<typeof insertTranscriptSegmentSchema>;
