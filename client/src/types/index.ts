// SOAP Notes
export interface SOAPNote {
  id?: number;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

// Patient
export interface Patient {
  id?: number;
  patientId: string;
  name: string;
  dateOfBirth?: string;
  visitType?: string;
}

// User (Doctor)
export interface User {
  id: number;
  username: string;
  name: string;
  role: string;
}

// Conversation
export interface Conversation {
  id: number;
  patientId: number;
  userId: number;
  recordingUrl?: string;
  transcript?: string;
  recordedAt: Date;
}

// Transcript Segment
export interface TranscriptSegment {
  id: number;
  conversationId: number;
  speaker: "doctor" | "patient";
  content: string;
  startTime: number;
  endTime: number;
}

// Additional Note (for specialized agents)
export interface AdditionalNote {
  id: number;
  soapNoteId: number;
  type: "chart_summary" | "clinical_guidelines" | "cpt_icd";
  content: string;
  createdAt: Date;
}
