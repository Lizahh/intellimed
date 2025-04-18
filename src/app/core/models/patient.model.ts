export interface Patient {
  id?: string;
  name: string;
  dob?: string; // Date of birth
  mrn?: string; // Medical Record Number
  appointmentTime?: string;
  status?: 'new-patient' | 'follow-up' | 'annual-physical';
  visitType?: 'New Consult' | 'Follow Up' | 'Annual Physical';
}

export interface NewPatientFormData {
  name: string;
  dob: string;
  mrn: string;
  status: 'new-patient' | 'follow-up' | 'annual-physical';
}