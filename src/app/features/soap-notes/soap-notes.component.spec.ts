import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SoapNotesComponent } from './soap-notes.component';
import { PatientService } from '../../core/services/patient.service';
import { SoapNotesService } from '../../core/services/soap-notes.service';
import { AudioService } from '../../core/services/audio.service';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AudioRecorderComponent } from '../audio-recorder/audio-recorder.component';
import { SoapNotesDisplayComponent } from '../soap-notes-display/soap-notes-display.component';
import { PatientInfoComponent } from '../patient-info/patient-info.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('SoapNotesComponent', () => {
  let component: SoapNotesComponent;
  let fixture: ComponentFixture<SoapNotesComponent>;
  let mockPatientService: jasmine.SpyObj<PatientService>;
  let mockSoapNotesService: jasmine.SpyObj<SoapNotesService>;
  let mockAudioService: jasmine.SpyObj<AudioService>;

  const mockPatient = { id: '123', name: 'Test Patient' };
  const mockSections = {
    subjective: [{ id: 'id1', text: 'Item 1', selected: true, template: 'bullet' }],
    objective: [{ id: 'id2', text: 'Item 2', selected: false, template: 'paragraph' }],
    assessment: [{ id: 'id3', text: 'Item 3', selected: true, template: 'concise' }],
    plan: [{ id: 'id4', text: 'Item 4', selected: false, template: 'detailed' }]
  };

  beforeEach(async () => {
    mockPatientService = jasmine.createSpyObj('PatientService', ['getCurrentPatient']);
    mockSoapNotesService = jasmine.createSpyObj('SoapNotesService', [
      'setActiveTab',
      'updateContextInfo',
      'updatePhysicalExamText',
      'setTemplate',
      'setVisitType',
      'toggleSection',
      'generateSoapNotes',
      'setSectionTemplate',
      'setTemplateMode'
    ]);
    mockAudioService = jasmine.createSpyObj('AudioService', [], { transcript$: of('test transcript') });

    // Set up observable properties
    mockPatientService.getCurrentPatient.and.returnValue(of(mockPatient));
    mockSoapNotesService.activeTab$ = of('soap-notes');
    mockSoapNotesService.contextInfo$ = of('test context');
    mockSoapNotesService.soapNotes$ = of('test soap notes');
    mockSoapNotesService.selectedTemplate$ = of('bullet');
    mockSoapNotesService.visitType$ = of('annual');
    mockSoapNotesService.sections$ = of(mockSections);
    mockSoapNotesService.physicalExamText$ = of('test physical exam');
    mockSoapNotesService.templateMode$ = of('default');

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        SoapNotesComponent
      ],
      providers: [
        { provide: PatientService, useValue: mockPatientService },
        { provide: SoapNotesService, useValue: mockSoapNotesService },
        { provide: AudioService, useValue: mockAudioService }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Ignore unknown elements for child components
    }).compileComponents();

    fixture = TestBed.createComponent(SoapNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set up observables in constructor', () => {
    expect(component.currentPatient$).toBeDefined();
    expect(component.activeTab$).toBe(mockSoapNotesService.activeTab$);
    expect(component.contextInfo$).toBe(mockSoapNotesService.contextInfo$);
    expect(component.soapNotes$).toBe(mockSoapNotesService.soapNotes$);
    expect(component.selectedTemplate$).toBe(mockSoapNotesService.selectedTemplate$);
    expect(component.visitType$).toBe(mockSoapNotesService.visitType$);
    expect(component.sections$).toBe(mockSoapNotesService.sections$);
    expect(component.physicalExamText$).toBe(mockSoapNotesService.physicalExamText$);
    expect(component.templateMode$).toBe(mockSoapNotesService.templateMode$);
  });

  it('should call setActiveTab on service when setActiveTab is called', () => {
    component.setActiveTab('test-tab');
    expect(mockSoapNotesService.setActiveTab).toHaveBeenCalledWith('test-tab');
  });

  it('should call updateContextInfo on service when updateContextInfo is called', () => {
    const mockEvent = { target: { value: 'updated context' } } as unknown as Event;
    component.updateContextInfo(mockEvent);
    expect(mockSoapNotesService.updateContextInfo).toHaveBeenCalledWith('updated context');
  });

  it('should call updatePhysicalExamText on service when updatePhysicalExamText is called', () => {
    const mockEvent = { target: { value: 'updated exam text' } } as unknown as Event;
    component.updatePhysicalExamText(mockEvent);
    expect(mockSoapNotesService.updatePhysicalExamText).toHaveBeenCalledWith('updated exam text');
  });

  it('should call setTemplate on service when setTemplate is called', () => {
    component.setTemplate('paragraph');
    expect(mockSoapNotesService.setTemplate).toHaveBeenCalledWith('paragraph');
  });

  it('should call setVisitType on service when setVisitType is called', () => {
    component.setVisitType('followup');
    expect(mockSoapNotesService.setVisitType).toHaveBeenCalledWith('followup');
  });

  it('should call toggleSection on service when toggleSection is called', () => {
    component.toggleSection('subjective', 'test-section');
    expect(mockSoapNotesService.toggleSection).toHaveBeenCalledWith('subjective', 'test-section');
  });

  it('should call setSectionTemplate on service when setSectionTemplate is called', () => {
    component.setSectionTemplate('objective', 'test-section', 'concise');
    expect(mockSoapNotesService.setSectionTemplate).toHaveBeenCalledWith('objective', 'test-section', 'concise');
  });

  it('should call setTemplateMode on service when setTemplateMode is called', () => {
    component.setTemplateMode('custom');
    expect(mockSoapNotesService.setTemplateMode).toHaveBeenCalledWith('custom');
  });

  it('should generate SOAP notes when generateSoapNotes is called', () => {
    component.generateSoapNotes();
    expect(mockSoapNotesService.generateSoapNotes).toHaveBeenCalledWith(
      mockPatient.id,
      'test transcript',
      'test context'
    );
  });

  it('should have the correct tabs defined', () => {
    expect(component.tabs.length).toBe(4);
    expect(component.tabs[0].id).toBe('chart-summary');
    expect(component.tabs[1].id).toBe('soap-notes');
    expect(component.tabs[2].id).toBe('guidelines');
    expect(component.tabs[3].id).toBe('coding');
  });

  it('should properly handle visit type changes', () => {
    const spy = spyOn(console, 'log');
    component.handleVisitTypeChange('followup');
    expect(spy).toHaveBeenCalledWith('Visit type changed:', 'followup');
  });
});