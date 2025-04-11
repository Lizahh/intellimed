import { apiRequest } from "@/lib/queryClient";
import { SOAPNote } from "@/types";

/**
 * Generate SOAP notes from a transcript
 */
export async function generateSOAPNotes(
  transcript: string, 
  conversationId?: number,
  format: "paragraph" | "bullets" = "paragraph",
  detail: "detailed" | "concise" = "detailed"
): Promise<SOAPNote> {
  const response = await apiRequest("POST", "/api/generate-soap-notes", {
    transcript,
    conversationId,
    format,
    detail
  });
  
  const data = await response.json();
  return {
    id: data.id,
    subjective: data.subjective,
    objective: data.objective,
    assessment: data.assessment,
    plan: data.plan
  };
}

/**
 * Save SOAP notes to the database
 */
export async function saveSOAPNotes(noteId: number, notes: Partial<SOAPNote>): Promise<SOAPNote> {
  const response = await apiRequest("PUT", `/api/soap-notes/${noteId}`, notes);
  
  const data = await response.json();
  return data;
}

/**
 * Generate a chart summary from SOAP notes
 */
export async function generateChartSummary(soapNoteId: number, soapNote: SOAPNote): Promise<string> {
  const response = await apiRequest("POST", "/api/generate-chart-summary", {
    soapNoteId,
    ...soapNote
  });
  
  const data = await response.json();
  return data.content;
}

/**
 * Check SOAP notes against clinical guidelines
 */
export async function checkClinicalGuidelines(soapNoteId: number, soapNote: SOAPNote): Promise<string> {
  const response = await apiRequest("POST", "/api/check-clinical-guidelines", {
    soapNoteId,
    ...soapNote
  });
  
  const data = await response.json();
  return data.content;
}

/**
 * Generate CPT and ICD-10 codes from SOAP notes
 */
export async function generateMedicalCodes(soapNoteId: number, soapNote: SOAPNote): Promise<string> {
  const response = await apiRequest("POST", "/api/generate-medical-codes", {
    soapNoteId,
    ...soapNote
  });
  
  const data = await response.json();
  return data.content;
}
