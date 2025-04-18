import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Patient, NewPatientFormData } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private currentPatientSubject = new BehaviorSubject<Patient | null>(null);
  currentPatient$ = this.currentPatientSubject.asObservable();

  private patientsSubject = new BehaviorSubject<Patient[]>([
    {
      id: '#453238',
      name: 'John Doe',
      status: 'new-patient',
      appointmentTime: '9:00 AM'
    },
    {
      id: '#341760',
      name: 'Emma Wilson',
      status: 'follow-up',
      appointmentTime: '10:30 AM'
    },
    {
      id: '#732415',
      name: 'Robert Johnson',
      status: 'follow-up',
      appointmentTime: '1:15 PM'
    },
    {
      id: '#842559',
      name: 'Maria Garcia',
      status: 'new-patient',
      appointmentTime: '2:45 PM'
    }
  ]);
  patients$ = this.patientsSubject.asObservable();

  private selectedPatientIdSubject = new BehaviorSubject<string>('#453238');
  selectedPatientId$ = this.selectedPatientIdSubject.asObservable();

  constructor() {
    // Initialize with first patient
    this.updateCurrentPatient('#453238');
  }

  getPatients(): Observable<Patient[]> {
    return this.patients$;
  }

  getCurrentPatient(): Observable<Patient | null> {
    return this.currentPatient$;
  }

  updateCurrentPatient(patientId: string): void {
    const patients = this.patientsSubject.getValue();
    const patient = patients.find(p => p.id === patientId) || null;
    this.currentPatientSubject.next(patient);
    this.selectedPatientIdSubject.next(patientId);
  }
  
  /**
   * Add a new patient to the list
   * @param patientData The form data for the new patient
   * @returns The newly created patient
   */
  addPatient(patientData: NewPatientFormData): Patient {
    const patients = this.patientsSubject.getValue();
    
    // Generate a unique ID for the new patient
    const newId = this.generatePatientId();
    
    // Create default appointment time based on status
    const defaultTime = new Date();
    defaultTime.setHours(defaultTime.getHours() + 1); // Set to 1 hour from now
    const formattedTime = defaultTime.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'});
    
    const newPatient: Patient = {
      id: newId,
      name: patientData.name,
      status: patientData.status,
      appointmentTime: formattedTime,
      dob: patientData.dob,
      mrn: patientData.mrn
    };
    
    // Add to the beginning of the list so it appears at the top
    const updatedPatients = [newPatient, ...patients];
    this.patientsSubject.next(updatedPatients);
    
    // Automatically select the new patient
    this.updateCurrentPatient(newId);
    
    return newPatient;
  }
  
  /**
   * Generate a unique patient ID
   * Format: #XXXXXX where X is a random digit
   */
  private generatePatientId(): string {
    // Generate a random 6-digit number
    const randomId = Math.floor(100000 + Math.random() * 900000);
    return `#${randomId}`;
  }
}
