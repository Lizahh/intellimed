import {
  type User,
  type InsertUser,
  type Patient,
  type InsertPatient,
  type Conversation,
  type InsertConversation,
  type SoapNote,
  type InsertSoapNote,
  type AdditionalNote,
  type InsertAdditionalNote,
  type TranscriptSegment,
  type InsertTranscriptSegment
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Patient methods
  getPatient(id: number): Promise<Patient | undefined>;
  getPatientByPatientId(patientId: string): Promise<Patient | undefined>;
  getAllPatients(): Promise<Patient[]>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  
  // Conversation methods
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationsByPatient(patientId: number): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  
  // SOAP Note methods
  getSoapNote(id: number): Promise<SoapNote | undefined>;
  getSoapNoteByConversation(conversationId: number): Promise<SoapNote | undefined>;
  createSoapNote(soapNote: InsertSoapNote): Promise<SoapNote>;
  updateSoapNote(id: number, updates: Partial<SoapNote>): Promise<SoapNote | undefined>;
  
  // Additional Notes methods
  getAdditionalNote(id: number): Promise<AdditionalNote | undefined>;
  getAdditionalNotesBySoapNote(soapNoteId: number): Promise<AdditionalNote[]>;
  createAdditionalNote(additionalNote: InsertAdditionalNote): Promise<AdditionalNote>;
  
  // Transcript Segment methods
  getTranscriptSegment(id: number): Promise<TranscriptSegment | undefined>;
  getTranscriptSegmentsByConversation(conversationId: number): Promise<TranscriptSegment[]>;
  createTranscriptSegment(segment: InsertTranscriptSegment): Promise<TranscriptSegment>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private patients: Map<number, Patient>;
  private conversations: Map<number, Conversation>;
  private soapNotes: Map<number, SoapNote>;
  private additionalNotes: Map<number, AdditionalNote>;
  private transcriptSegments: Map<number, TranscriptSegment>;
  
  private currentUserId: number;
  private currentPatientId: number;
  private currentConversationId: number;
  private currentSoapNoteId: number;
  private currentAdditionalNoteId: number;
  private currentTranscriptSegmentId: number;

  constructor() {
    this.users = new Map();
    this.patients = new Map();
    this.conversations = new Map();
    this.soapNotes = new Map();
    this.additionalNotes = new Map();
    this.transcriptSegments = new Map();
    
    this.currentUserId = 1;
    this.currentPatientId = 1;
    this.currentConversationId = 1;
    this.currentSoapNoteId = 1;
    this.currentAdditionalNoteId = 1;
    this.currentTranscriptSegmentId = 1;
    
    // Add demo user
    this.users.set(1, {
      id: 1,
      username: "drsarah",
      password: "password123", // In a real app, this would be hashed
      name: "Dr. Sarah Chen",
      role: "doctor"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Patient methods
  async getPatient(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }
  
  async getPatientByPatientId(patientId: string): Promise<Patient | undefined> {
    return Array.from(this.patients.values()).find(
      (patient) => patient.patientId === patientId
    );
  }
  
  async getAllPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }
  
  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = this.currentPatientId++;
    const patient: Patient = { ...insertPatient, id };
    this.patients.set(id, patient);
    return patient;
  }
  
  // Conversation methods
  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }
  
  async getConversationsByPatient(patientId: number): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(
      (conversation) => conversation.patientId === patientId
    );
  }
  
  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = this.currentConversationId++;
    const conversation: Conversation = { ...insertConversation, id };
    this.conversations.set(id, conversation);
    return conversation;
  }
  
  // SOAP Note methods
  async getSoapNote(id: number): Promise<SoapNote | undefined> {
    return this.soapNotes.get(id);
  }
  
  async getSoapNoteByConversation(conversationId: number): Promise<SoapNote | undefined> {
    return Array.from(this.soapNotes.values()).find(
      (note) => note.conversationId === conversationId
    );
  }
  
  async createSoapNote(insertSoapNote: InsertSoapNote): Promise<SoapNote> {
    const id = this.currentSoapNoteId++;
    const soapNote: SoapNote = { ...insertSoapNote, id };
    this.soapNotes.set(id, soapNote);
    return soapNote;
  }
  
  async updateSoapNote(id: number, updates: Partial<SoapNote>): Promise<SoapNote | undefined> {
    const existingNote = this.soapNotes.get(id);
    if (!existingNote) {
      return undefined;
    }
    
    const updatedNote = { ...existingNote, ...updates };
    this.soapNotes.set(id, updatedNote);
    return updatedNote;
  }
  
  // Additional Notes methods
  async getAdditionalNote(id: number): Promise<AdditionalNote | undefined> {
    return this.additionalNotes.get(id);
  }
  
  async getAdditionalNotesBySoapNote(soapNoteId: number): Promise<AdditionalNote[]> {
    return Array.from(this.additionalNotes.values()).filter(
      (note) => note.soapNoteId === soapNoteId
    );
  }
  
  async createAdditionalNote(insertAdditionalNote: InsertAdditionalNote): Promise<AdditionalNote> {
    const id = this.currentAdditionalNoteId++;
    const additionalNote: AdditionalNote = { ...insertAdditionalNote, id };
    this.additionalNotes.set(id, additionalNote);
    return additionalNote;
  }
  
  // Transcript Segment methods
  async getTranscriptSegment(id: number): Promise<TranscriptSegment | undefined> {
    return this.transcriptSegments.get(id);
  }
  
  async getTranscriptSegmentsByConversation(conversationId: number): Promise<TranscriptSegment[]> {
    return Array.from(this.transcriptSegments.values())
      .filter((segment) => segment.conversationId === conversationId)
      .sort((a, b) => a.startTime - b.startTime);
  }
  
  async createTranscriptSegment(insertSegment: InsertTranscriptSegment): Promise<TranscriptSegment> {
    const id = this.currentTranscriptSegmentId++;
    const segment: TranscriptSegment = { ...insertSegment, id };
    this.transcriptSegments.set(id, segment);
    return segment;
  }
}

export const storage = new MemStorage();
