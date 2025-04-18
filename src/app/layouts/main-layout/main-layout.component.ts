import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { AddPatientComponent } from '../../features/add-patient/add-patient.component';
import { ChartSummaryComponent } from '../../features/chart-summary/chart-summary.component';
import { CodingComponent } from '../../features/coding/coding.component';
import { AgentService, AgentType } from '../../core/services/agent.service';
import { Patient } from '../../core/models/patient.model';
import { PatientService } from '../../core/services/patient.service';
import { AuthService, User } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    AddPatientComponent,
    ChartSummaryComponent,
    CodingComponent
  ]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  title = 'Intellimed AI';
  usagePercentage = 75;
  currentDoctor = 'Dr. Sarah Chen';
  showAddPatientModal = false;
  
  // Component visibility properties
  currentPatient: Patient | null = null;
  activeAgent: AgentType = 'penny';
  showChartSummary = false;
  showCodingComponent = false;
  
  // Authentication properties
  currentUser: User | null = null;
  
  private subscriptions: Subscription = new Subscription();

  constructor(
    private patientService: PatientService,
    private agentService: AgentService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get current user info
    this.subscriptions.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.currentDoctor = `Dr. ${user.firstName} ${user.lastName}`;
        }
      })
    );
    
    // Get currently selected patient
    this.subscriptions.add(
      this.patientService.currentPatient$.subscribe(patient => {
        this.currentPatient = patient;
      })
    );
    
    // Listen for agent changes
    this.subscriptions.add(
      this.agentService.activeAgent$.subscribe(agent => {
        this.activeAgent = agent;
        // Show chart summary only when Summer agent is active
        this.showChartSummary = agent === 'summer';
        // Show coding component only when Bill agent is active
        this.showCodingComponent = agent === 'bill';
      })
    );
  }
  
  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.unsubscribe();
  }
  
  openAddPatientModal(): void {
    this.showAddPatientModal = true;
  }
  
  closeAddPatientModal(): void {
    this.showAddPatientModal = false;
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}