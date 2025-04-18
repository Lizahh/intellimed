import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { PatientService } from '../../core/services/patient.service';
import { Patient } from '../../core/models/patient.model';
import { CommonModule, AsyncPipe } from '@angular/common';
import { SoapNotesComponent } from '../soap-notes/soap-notes.component';

@Component({
  selector: 'app-patient-details',
  templateUrl: './patient-details.component.html',
  styleUrls: ['./patient-details.component.scss'],
  standalone: true,
  imports: [CommonModule, AsyncPipe, SoapNotesComponent]
})
export class PatientDetailsComponent implements OnInit {
  currentPatient$: Observable<Patient | null>;

  constructor(
    private patientService: PatientService,
    private route: ActivatedRoute
  ) {
    this.currentPatient$ = this.patientService.getCurrentPatient();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.patientService.updateCurrentPatient(params['id']);
      }
    });
  }
}
