import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { Patient } from '../../../core/models/patient.model';
import { PatientService } from '../../../core/services/patient.service';
import { CommonModule, DatePipe, AsyncPipe } from '@angular/common';
import { AgentService, AgentType } from '../../../core/services/agent.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, DatePipe, AsyncPipe]
})
export class SidebarComponent implements OnInit {
  @Output() addPatientClicked = new EventEmitter<void>();
  
  patients$: Observable<Patient[]>;
  selectedPatientId$: Observable<string>;
  currentDate: Date = new Date();
  usagePercentage: number = 75;
  showAddPatientModal = false;
  
  // For agent selection
  activeAgent: AgentType = 'penny';

  constructor(
    private patientService: PatientService,
    private agentService: AgentService
  ) {
    this.patients$ = this.patientService.getPatients();
    this.selectedPatientId$ = this.patientService.selectedPatientId$;
  }

  ngOnInit(): void {
    // Get current active agent
    this.agentService.activeAgent$.subscribe(agent => {
      this.activeAgent = agent;
    });
  }

  selectPatient(patientId: string): void {
    if (patientId) {
      this.patientService.updateCurrentPatient(patientId);
    }
  }
  
  /**
   * Select an agent to activate
   */
  selectAgent(agent: AgentType): void {
    this.agentService.setActiveAgent(agent);
  }

  openSettings(): void {
    // Implement settings functionality
    console.log('Opening settings');
  }
  
  openAddPatientModal(): void {
    // Emit event to parent component to show the modal
    this.addPatientClicked.emit();
  }
}
