import { Component, OnInit, OnDestroy } from '@angular/core';
import { PatientService } from '../../core/services/patient.service';
import { SoapNotesService, NoteTemplate, VisitType, SoapNoteSections } from '../../core/services/soap-notes.service';
import { AudioService } from '../../core/services/audio.service';
import { AgentService, AgentType } from '../../core/services/agent.service';
import { Patient } from '../../core/models/patient.model';
import { Observable, combineLatest, Subject, Subscription } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AudioRecorderComponent } from '../audio-recorder/audio-recorder.component';
import { SoapNotesDisplayComponent } from '../soap-notes-display/soap-notes-display.component';
import { PatientInfoComponent } from '../patient-info/patient-info.component';

@Component({
  selector: 'app-soap-notes',
  templateUrl: './soap-notes.component.html',
  styleUrls: ['./soap-notes.component.scss'],
  standalone: true,
  imports: [CommonModule, AsyncPipe, FormsModule, AudioRecorderComponent, SoapNotesDisplayComponent, PatientInfoComponent]
})
export class SoapNotesComponent implements OnInit, OnDestroy {
  // Subject for unsubscribing from observables
  private destroy$ = new Subject<void>();
  private subscriptions = new Subscription();
  currentPatient$: Observable<Patient | null>;
  activeTab$: Observable<string>;
  contextInfo$: Observable<string>;
  soapNotes$: Observable<string>;
  selectedTemplate$: Observable<NoteTemplate>;
  visitType$: Observable<VisitType>;
  sections$: Observable<SoapNoteSections>;
  physicalExamText$!: Observable<string>;
  templateMode$!: Observable<'default' | 'custom'>;
  
  tabs = [
    { id: 'chart-summary', label: 'Chart Summary', icon: 'document-text', agentName: 'Summer' },
    { id: 'soap-notes', label: 'SOAP Notes', icon: 'clipboard-check', agentName: 'Penny' },
    { id: 'guidelines', label: 'Guidelines', icon: 'book-open', agentName: 'Clara' },
    { id: 'coding', label: 'Coding', icon: 'code', agentName: 'Bill' }
  ];
  
  templateOptions = [
    { id: 'bullet' as NoteTemplate, label: 'Bullet', icon: '•' },
    { id: 'paragraph' as NoteTemplate, label: 'Paragraph', icon: '¶' },
    { id: 'concise' as NoteTemplate, label: 'Concise', icon: '⚡' },
    { id: 'detailed' as NoteTemplate, label: 'Detailed', icon: '📄' }
  ];
  
  visitTypeOptions = [
    { id: 'initial' as VisitType, label: 'New Consult' },
    { id: 'followup' as VisitType, label: 'Follow Up' }
  ];

  constructor(
    private patientService: PatientService,
    private soapNotesService: SoapNotesService,
    private agentService: AgentService,
    public audioService: AudioService
  ) {
    this.currentPatient$ = this.patientService.getCurrentPatient();
    this.activeTab$ = this.soapNotesService.activeTab$;
    this.contextInfo$ = this.soapNotesService.contextInfo$;
    this.soapNotes$ = this.soapNotesService.soapNotes$;
    this.selectedTemplate$ = this.soapNotesService.selectedTemplate$;
    this.visitType$ = this.soapNotesService.visitType$;
    this.sections$ = this.soapNotesService.sections$;
    this.physicalExamText$ = this.soapNotesService.physicalExamText$;
    this.templateMode$ = this.soapNotesService.templateMode$;
  }

  ngOnInit(): void {
    // Listen for changes in the active agent and update the active tab accordingly
    this.subscriptions.add(
      this.agentService.activeAgent$.pipe(
        takeUntil(this.destroy$)
      ).subscribe(agent => {
        // Set the appropriate active tab based on the agent
        switch(agent) {
          case 'summer':
            this.soapNotesService.setActiveTab('chart-summary');
            break;
          case 'penny':
            this.soapNotesService.setActiveTab('soap-notes');
            break;
          case 'clara':
            this.soapNotesService.setActiveTab('guidelines');
            break;
          case 'bill':
            this.soapNotesService.setActiveTab('coding');
            break;
        }
      })
    );
  }

  ngOnDestroy(): void {
    // Clean up subscriptions when component is destroyed
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.unsubscribe();
  }

  setActiveTab(tabId: string): void {
    this.soapNotesService.setActiveTab(tabId);
    
    // Also update the AgentService based on the tab selected
    // This synchronizes the sidebar agent selection with the tabs
    switch(tabId) {
      case 'chart-summary':
        this.agentService.setActiveAgent('summer');
        break;
      case 'soap-notes':
        this.agentService.setActiveAgent('penny');
        break;
      case 'guidelines':
        this.agentService.setActiveAgent('clara');
        break;
      case 'coding':
        this.agentService.setActiveAgent('bill');
        break;
    }
  }

  updateContextInfo(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.soapNotesService.updateContextInfo(target.value);
  }
  
  updatePhysicalExamText(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.soapNotesService.updatePhysicalExamText(target.value);
  }
  
  setTemplate(template: NoteTemplate): void {
    this.soapNotesService.setTemplate(template);
  }
  
  setVisitType(type: VisitType): void {
    this.soapNotesService.setVisitType(type);
  }
  
  toggleSection(category: keyof SoapNoteSections, sectionId: string): void {
    this.soapNotesService.toggleSection(category, sectionId);
  }

  generateSoapNotes(): void {
    combineLatest([
      this.currentPatient$,
      this.audioService.transcript$,
      this.soapNotesService.contextInfo$
    ]).pipe(
      takeUntil(this.destroy$),
      map(([patient, transcript, contextInfo]) => {
        if (patient && patient.id) {
          this.soapNotesService.generateSoapNotes(patient.id, transcript, contextInfo);
        } else {
          console.warn('Cannot generate SOAP notes: No patient selected or patient ID is missing');
        }
      })
    ).subscribe({
      error: (err) => {
        console.error('Error generating SOAP notes:', err);
      }
    });
  }
  
  isTemplateSelected(template: NoteTemplate): boolean {
    // Placeholder - will be handled in the template with async pipe
    return false;
  }
  
  setSectionTemplate(category: keyof SoapNoteSections, sectionId: string, template: NoteTemplate): void {
    this.soapNotesService.setSectionTemplate(category, sectionId, template);
  }
  
  setTemplateMode(mode: 'default' | 'custom'): void {
    this.soapNotesService.setTemplateMode(mode);
  }
  
  handleVisitTypeChange(visitType: VisitType): void {
    // The PatientInfoComponent already updates the service directly,
    // but we can perform additional actions here if needed
    console.log('Visit type changed:', visitType);
  }
}
