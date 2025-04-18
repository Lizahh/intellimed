import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PatientInfoComponent } from './patient-info.component';
import { SoapNotesService } from '../../core/services/soap-notes.service';
import { of } from 'rxjs';

describe('PatientInfoComponent', () => {
  let component: PatientInfoComponent;
  let fixture: ComponentFixture<PatientInfoComponent>;
  let mockSoapNotesService: jasmine.SpyObj<SoapNotesService>;

  beforeEach(async () => {
    mockSoapNotesService = jasmine.createSpyObj('SoapNotesService', ['setVisitType']);
    mockSoapNotesService.visitType$ = of('annual');

    await TestBed.configureTestingModule({
      imports: [PatientInfoComponent],
      providers: [
        { provide: SoapNotesService, useValue: mockSoapNotesService }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PatientInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the patient name and ID correctly', () => {
    component.patientName = 'John Doe';
    component.patientId = '123456';
    fixture.detectChanges();
    
    const patientNameElement = fixture.debugElement.query(By.css('.patient-name')).nativeElement;
    const patientIdElement = fixture.debugElement.query(By.css('.patient-id')).nativeElement;
    
    expect(patientNameElement.textContent).toContain('John Doe');
    expect(patientIdElement.textContent).toContain('ID: 123456');
  });

  it('should initialize with the correct visit type from service', () => {
    expect(component.selectedVisitType).toBe('annual');
  });

  it('should call service and emit event when visit type changes', () => {
    const visitTypeChangedSpy = spyOn(component.visitTypeChanged, 'emit');
    component.onVisitTypeChange('followup');
    
    expect(mockSoapNotesService.setVisitType).toHaveBeenCalledWith('followup');
    expect(visitTypeChangedSpy).toHaveBeenCalledWith('followup');
    expect(component.selectedVisitType).toBe('followup');
  });

  it('should render all visit type options', () => {
    fixture.detectChanges();
    const selectOptions = fixture.debugElement.queryAll(By.css('option'));
    
    expect(selectOptions.length).toBe(3); // Annual, New Consult, Follow Up
    expect(selectOptions[0].nativeElement.textContent.trim()).toBe('Annual Physical');
    expect(selectOptions[1].nativeElement.textContent.trim()).toBe('New Consult');
    expect(selectOptions[2].nativeElement.textContent.trim()).toBe('Follow Up');
  });
});
