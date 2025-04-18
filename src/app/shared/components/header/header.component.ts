import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { Patient } from '../../../core/models/patient.model';
import { PatientService } from '../../../core/services/patient.service';
import { CommonModule, AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule, AsyncPipe]
})
export class HeaderComponent {
  @Input() doctorName: string = '';
  @Output() logoutRequested = new EventEmitter<void>();
  
  currentPatient$: Observable<Patient | null>;

  constructor(private patientService: PatientService) {
    this.currentPatient$ = this.patientService.getCurrentPatient();
  }

  changePatient(): void {
    // Implement patient change functionality
    console.log('Change patient clicked');
  }

  newSession(): void {
    // Implement new session functionality
    console.log('New session clicked');
  }
  
  logout(): void {
    this.logoutRequested.emit();
  }
  
  getInitials(name: string): string {
    if (!name) return '';
    
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  }
}
