import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Patient } from '../../core/models/patient.model';

@Component({
  selector: 'app-chart-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chart-summary.component.html',
  styleUrl: './chart-summary.component.scss'
})
export class ChartSummaryComponent {
  @Input() visible: boolean = false;
  @Input() currentPatient: Patient | null = null;
  
  // Sample chart summary data
  chartSummary = {
    patientHistory: 'Patient has a history of hypertension and Type 2 diabetes, diagnosed 5 years ago. ' +
      'Currently on metformin 500mg twice daily and lisinopril 10mg once daily. Previous A1C levels ' +
      'have been between 6.8-7.2%. Last cardiac workup was 8 months ago, with normal findings.',
      
    recentVisits: [
      {
        date: '2024-12-15',
        reason: 'Quarterly diabetes follow-up',
        provider: 'Dr. Sarah Chen',
        notes: 'Blood pressure was 138/85. A1C was 7.1%. Patient reported consistent medication adherence. ' +
          'Encouraged increased physical activity and continued dietary management.'
      },
      {
        date: '2024-09-02',
        reason: 'Annual physical',
        provider: 'Dr. Sarah Chen',
        notes: 'Complete physical examination revealed no significant changes. Continued current treatment regimen. ' +
          'Recommended flu vaccine, which was administered during visit.'
      }
    ],
    
    labResults: [
      {
        date: '2024-12-15',
        test: 'A1C',
        result: '7.1%',
        refRange: '4.0-5.6%',
        status: 'High'
      },
      {
        date: '2024-12-15',
        test: 'Fasting Blood Glucose',
        result: '138 mg/dL',
        refRange: '70-99 mg/dL',
        status: 'High'
      },
      {
        date: '2024-12-15',
        test: 'Total Cholesterol',
        result: '195 mg/dL',
        refRange: '<200 mg/dL',
        status: 'Normal'
      },
      {
        date: '2024-12-15',
        test: 'LDL',
        result: '112 mg/dL',
        refRange: '<100 mg/dL',
        status: 'High'
      },
      {
        date: '2024-12-15',
        test: 'HDL',
        result: '48 mg/dL',
        refRange: '>40 mg/dL',
        status: 'Normal'
      }
    ],
    
    medications: [
      {
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        startDate: '2019-05-14'
      },
      {
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        startDate: '2019-05-14'
      }
    ]
  };
}
