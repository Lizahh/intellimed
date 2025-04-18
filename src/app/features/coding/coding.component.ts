import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { CodingService, CodeResult, InsuranceType, VisitComplexity, TimeSpent } from '../../core/services/coding.service';
import { PatientService } from '../../core/services/patient.service';
import { AudioService } from '../../core/services/audio.service';
import { SoapNotesService } from '../../core/services/soap-notes.service';
import { Patient } from '../../core/models/patient.model';
import { PatientInfoComponent } from '../patient-info/patient-info.component';

@Component({
  selector: 'app-coding',
  templateUrl: './coding.component.html',
  styleUrls: ['./coding.component.scss'],
  standalone: true,
  imports: [CommonModule, AsyncPipe, FormsModule, PatientInfoComponent]
})
export class CodingComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private subscriptions = new Subject<void>();
  
  currentPatient$: Observable<Patient | null>;
  codingResult$: Observable<CodeResult | null>;
  insuranceType$: Observable<InsuranceType>;
  visitComplexity$: Observable<VisitComplexity>;
  timeSpent$: Observable<TimeSpent>;
  diagnosis$: Observable<string>;
  visitType$: Observable<string>;
  
  insuranceOptions = [
    { id: 'medicare' as InsuranceType, label: 'Medicare' },
    { id: 'medicaid' as InsuranceType, label: 'Medicaid' },
    { id: 'private' as InsuranceType, label: 'Private Insurance' },
    { id: 'self-pay' as InsuranceType, label: 'Self-Pay' }
  ];
  
  complexityOptions = [
    { id: 'low' as VisitComplexity, label: 'Low Complexity' },
    { id: 'moderate' as VisitComplexity, label: 'Moderate Complexity' },
    { id: 'high' as VisitComplexity, label: 'High Complexity' }
  ];
  
  timeOptions = [
    { id: 'less-than-15' as TimeSpent, label: 'Less than 15 minutes' },
    { id: '15-30' as TimeSpent, label: '15-30 minutes' },
    { id: '30-45' as TimeSpent, label: '30-45 minutes' },
    { id: 'more-than-45' as TimeSpent, label: 'More than 45 minutes' }
  ];
  
  constructor(
    private codingService: CodingService,
    private patientService: PatientService,
    private audioService: AudioService,
    private soapNotesService: SoapNotesService
  ) {
    this.currentPatient$ = this.patientService.getCurrentPatient();
    this.codingResult$ = this.codingService.codingResult$;
    this.insuranceType$ = this.codingService.insuranceType$;
    this.visitComplexity$ = this.codingService.visitComplexity$;
    this.timeSpent$ = this.codingService.timeSpent$;
    this.diagnosis$ = this.codingService.diagnosis$;
    this.visitType$ = this.soapNotesService.visitType$.pipe(
      map(visitType => {
        if (visitType === 'initial') return 'initial';
        else if (visitType === 'annual') return 'annual';
        else return 'followup';
      })
    );
  }

  ngOnInit(): void {
    // Initialize any required state
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.complete();
  }

  setInsuranceType(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.codingService.setInsuranceType(select.value as InsuranceType);
  }

  setVisitComplexity(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.codingService.setVisitComplexity(select.value as VisitComplexity);
  }

  setTimeSpent(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.codingService.setTimeSpent(select.value as TimeSpent);
  }

  updateDiagnosis(event: Event): void {
    const input = event.target as HTMLTextAreaElement;
    this.codingService.setDiagnosis(input.value);
  }

  generateCoding(): void {
    combineLatest([
      this.currentPatient$,
      this.visitType$,
      this.audioService.transcript$
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(([patient, visitType, transcript]) => {
      if (patient && patient.id) {
        this.codingService.generateCoding(patient.id, visitType, transcript);
      } else {
        console.warn('Cannot generate coding: No patient selected or patient ID is missing');
      }
    });
  }
}