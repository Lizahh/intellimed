import { Patient } from './patient.model';

export interface Appointment {
  id: string;
  patient: Patient;
  time: string;
  date: Date;
  type: string;
  followUp: boolean;
}
