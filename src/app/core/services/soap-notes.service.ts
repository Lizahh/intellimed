import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type NoteTemplate = 'bullet' | 'paragraph' | 'concise' | 'detailed';
export type VisitType = 'initial' | 'followup' | 'annual';

export interface SoapNoteSection {
  id: string;
  label: string;
  selected: boolean;
  template: NoteTemplate;
}

export interface SoapNoteSections {
  visitSummary: SoapNoteSection[];
  subjective: SoapNoteSection[];
  objective: SoapNoteSection[];
  assessmentPlan: SoapNoteSection[];
}

@Injectable({
  providedIn: 'root'
})
export class SoapNotesService {
  private contextInfoSubject = new BehaviorSubject<string>('');
  contextInfo$ = this.contextInfoSubject.asObservable();
  
  private soapNotesSubject = new BehaviorSubject<string>('');
  soapNotes$ = this.soapNotesSubject.asObservable();
  
  private activeTabSubject = new BehaviorSubject<string>('soap-notes');
  activeTab$ = this.activeTabSubject.asObservable();
  
  private selectedTemplateSubject = new BehaviorSubject<NoteTemplate>('bullet');
  selectedTemplate$ = this.selectedTemplateSubject.asObservable();
  
  private visitTypeSubject = new BehaviorSubject<VisitType>('annual');
  visitType$ = this.visitTypeSubject.asObservable();
  
  private physicalExamTextSubject = new BehaviorSubject<string>('');
  physicalExamText$ = this.physicalExamTextSubject.asObservable();
  
  // Track which template mode is being used (default or custom)
  private templateModeSubject = new BehaviorSubject<'default' | 'custom'>('default');
  templateMode$ = this.templateModeSubject.asObservable();
  
  private sectionsSubject = new BehaviorSubject<SoapNoteSections>({
    visitSummary: [
      { id: 'summary', label: 'Visit Summary', selected: true, template: 'bullet' }
    ],
    subjective: [
      { id: 'chiefComplaint', label: 'Chief Complaint', selected: true, template: 'bullet' },
      { id: 'presentIllness', label: 'History of Present Illness', selected: true, template: 'paragraph' },
      { id: 'medicalHistory', label: 'Past Medical History', selected: false, template: 'bullet' },
      { id: 'medications', label: 'Medications and Supplements', selected: true, template: 'bullet' },
      { id: 'familyHistory', label: 'Family History', selected: false, template: 'concise' },
      { id: 'socialHistory', label: 'Social History', selected: false, template: 'concise' },
      { id: 'reviewSystems', label: 'Review of Systems', selected: false, template: 'bullet' }
    ],
    objective: [
      { id: 'physicalExam', label: 'Physical Examination', selected: true, template: 'detailed' },
      { id: 'labResults', label: 'Laboratory, Imaging and Diagnostic Test Results', selected: false, template: 'bullet' }
    ],
    assessmentPlan: [
      { id: 'assessment', label: 'Assessment & Plan', selected: true, template: 'paragraph' },
      { id: 'patientInstructions', label: 'Patient Instructions', selected: false, template: 'bullet' }
    ]
  });
  sections$ = this.sectionsSubject.asObservable();

  constructor() {}

  updateContextInfo(info: string): void {
    this.contextInfoSubject.next(info);
  }
  
  updatePhysicalExamText(text: string): void {
    this.physicalExamTextSubject.next(text);
  }
  
  setTemplate(template: NoteTemplate): void {
    this.selectedTemplateSubject.next(template);
  }
  
  setVisitType(type: VisitType): void {
    this.visitTypeSubject.next(type);
    // Update sections based on visit type
    if (type === 'followup') {
      this.sectionsSubject.next({
        visitSummary: [
          { id: 'summary', label: 'Visit Summary', selected: true, template: 'bullet' }
        ],
        subjective: [
          { id: 'chiefComplaint', label: 'Chief Complaint', selected: true, template: 'bullet' },
          { id: 'presentIllness', label: 'History of Present Illness', selected: true, template: 'paragraph' },
          { id: 'medications', label: 'Medications and Supplements', selected: true, template: 'bullet' },
          { id: 'reviewSystems', label: 'Review of Systems', selected: true, template: 'concise' }
        ],
        objective: [
          { id: 'physicalExam', label: 'Physical Examination', selected: true, template: 'paragraph' },
          { id: 'labResults', label: 'Laboratory, Imaging and Diagnostic Test Results', selected: true, template: 'bullet' }
        ],
        assessmentPlan: [
          { id: 'assessment', label: 'Assessment & Plan', selected: true, template: 'paragraph' }
        ]
      });
    } else if (type === 'annual') {
      // Annual Physical specific sections
      this.sectionsSubject.next({
        visitSummary: [
          { id: 'summary', label: 'Visit Summary', selected: true, template: 'bullet' }
        ],
        subjective: [
          { id: 'chiefComplaint', label: 'Chief Complaint', selected: true, template: 'bullet' },
          { id: 'preventiveServices', label: 'Preventive Services', selected: true, template: 'bullet' },
          { id: 'medicalHistory', label: 'Past Medical History', selected: true, template: 'bullet' },
          { id: 'medications', label: 'Medications and Supplements', selected: true, template: 'bullet' },
          { id: 'familyHistory', label: 'Family History', selected: true, template: 'concise' },
          { id: 'socialHistory', label: 'Social History', selected: true, template: 'concise' },
          { id: 'reviewSystems', label: 'Complete Review of Systems', selected: true, template: 'detailed' }
        ],
        objective: [
          { id: 'physicalExam', label: 'Comprehensive Physical Examination', selected: true, template: 'detailed' },
          { id: 'labResults', label: 'Annual Screening Results', selected: true, template: 'detailed' },
          { id: 'vitalsTrends', label: 'Vitals & Trends', selected: true, template: 'bullet' }
        ],
        assessmentPlan: [
          { id: 'assessment', label: 'Assessment & Plan', selected: true, template: 'detailed' },
          { id: 'preventiveRecommendations', label: 'Preventive Recommendations', selected: true, template: 'bullet' },
          { id: 'screeningSchedule', label: 'Screening Schedule', selected: true, template: 'bullet' },
          { id: 'patientInstructions', label: 'Patient Instructions', selected: true, template: 'bullet' }
        ]
      });
    } else {
      // Reset to initial visit sections (New Consult)
      this.sectionsSubject.next({
        visitSummary: [
          { id: 'summary', label: 'Visit Summary', selected: true, template: 'bullet' }
        ],
        subjective: [
          { id: 'chiefComplaint', label: 'Chief Complaint', selected: true, template: 'bullet' },
          { id: 'presentIllness', label: 'History of Present Illness', selected: true, template: 'paragraph' },
          { id: 'medicalHistory', label: 'Past Medical History', selected: false, template: 'bullet' },
          { id: 'medications', label: 'Medications and Supplements', selected: true, template: 'bullet' },
          { id: 'familyHistory', label: 'Family History', selected: false, template: 'concise' },
          { id: 'socialHistory', label: 'Social History', selected: false, template: 'concise' },
          { id: 'reviewSystems', label: 'Review of Systems', selected: false, template: 'bullet' }
        ],
        objective: [
          { id: 'physicalExam', label: 'Physical Examination', selected: true, template: 'detailed' },
          { id: 'labResults', label: 'Laboratory, Imaging and Diagnostic Test Results', selected: false, template: 'bullet' }
        ],
        assessmentPlan: [
          { id: 'assessment', label: 'Assessment & Plan', selected: true, template: 'paragraph' },
          { id: 'patientInstructions', label: 'Patient Instructions', selected: false, template: 'bullet' }
        ]
      });
    }
  }
  
  toggleSection(category: keyof SoapNoteSections, sectionId: string): void {
    const currentSections = this.sectionsSubject.getValue();
    const updatedSections = { ...currentSections };
    
    const sectionIndex = updatedSections[category].findIndex(s => s.id === sectionId);
    if (sectionIndex >= 0) {
      updatedSections[category] = [...updatedSections[category]];
      updatedSections[category][sectionIndex] = {
        ...updatedSections[category][sectionIndex],
        selected: !updatedSections[category][sectionIndex].selected
      };
      this.sectionsSubject.next(updatedSections);
    }
  }
  
  setSectionTemplate(category: keyof SoapNoteSections, sectionId: string, template: NoteTemplate): void {
    const currentSections = this.sectionsSubject.getValue();
    const updatedSections = { ...currentSections };
    
    const sectionIndex = updatedSections[category].findIndex(s => s.id === sectionId);
    if (sectionIndex >= 0) {
      updatedSections[category] = [...updatedSections[category]];
      updatedSections[category][sectionIndex] = {
        ...updatedSections[category][sectionIndex],
        template
      };
      this.sectionsSubject.next(updatedSections);
    }
  }

  generateSoapNotes(patientId: string, audioTranscript: string, contextInfo: string): Promise<string> {
    return new Promise((resolve) => {
      // In a production environment, this would call an API to process the data
      // Here we'll just simulate a response with different section templates
      setTimeout(() => {
        const exampleTemplate = this.selectedTemplateSubject.getValue();
        const sections = this.sectionsSubject.getValue();
        const visitType = this.visitTypeSubject.getValue();
        
        // Start with visit type header
        let visitTypeHeader = '';
        if (visitType === 'initial') {
          visitTypeHeader = 'NEW CONSULT';
        } else if (visitType === 'followup') {
          visitTypeHeader = 'FOLLOW UP';
        } else if (visitType === 'annual') {
          visitTypeHeader = 'ANNUAL PHYSICAL';
        }
        
        let notes = `${visitTypeHeader} NOTES\n`;
        notes += `Patient ID: ${patientId}\n\n`;
        
        // Visit Summary section
        if (sections.visitSummary.some(s => s.selected)) {
          notes += `VISIT SUMMARY:\n`;
          notes += `Date: ${new Date().toLocaleDateString()}\n`;
          notes += `Provider: Dr. Sarah Chen\n\n`;
        }
        
        // Subjective section
        if (sections.subjective.some(s => s.selected)) {
          notes += `SUBJECTIVE:\n`;
          
          // Format based on section's template
          let subjectiveContent = audioTranscript;
          
          sections.subjective.forEach(section => {
            if (section.selected) {
              notes += `${section.label}:\n`;
              
              switch(section.template) {
                case 'bullet':
                  notes += `• ${subjectiveContent.split('. ').join('\n• ')}\n`;
                  break;
                case 'paragraph':
                  notes += `${subjectiveContent}\n`;
                  break;
                case 'concise':
                  notes += `${subjectiveContent.substring(0, 100)}${subjectiveContent.length > 100 ? '...' : ''}\n`;
                  break;
                case 'detailed':
                  notes += `${subjectiveContent}\nAdditional context: ${contextInfo || 'None'}\n`;
                  break;
                default:
                  notes += `${subjectiveContent}\n`;
              }
              
              notes += `\n`;
            }
          });
        }
        
        // Objective section
        if (sections.objective.some(s => s.selected)) {
          notes += `OBJECTIVE:\n`;
          
          sections.objective.forEach(section => {
            if (section.selected) {
              notes += `${section.label}:\n`;
              
              if (section.id === 'physicalExam') {
                const customExamText = this.physicalExamTextSubject.getValue();
                
                if (customExamText) {
                  // Use custom physical examination text if provided
                  switch(section.template) {
                    case 'bullet':
                      // Format each line as a bullet point
                      notes += customExamText.split('\n').map(line => `• ${line}`).join('\n');
                      notes += '\n';
                      break;
                    case 'paragraph':
                      // Use as a paragraph
                      notes += `${customExamText}\n`;
                      break;
                    case 'concise':
                      // Use first 100 characters
                      notes += `${customExamText.substring(0, 100)}${customExamText.length > 100 ? '...' : ''}\n`;
                      break;
                    case 'detailed':
                      // Use full text
                      notes += `${customExamText}\n`;
                      break;
                    default:
                      notes += `${customExamText}\n`;
                  }
                } else {
                  // Use default templates if no custom text provided
                  switch(section.template) {
                    case 'bullet':
                      notes += `• Vital signs stable\n• General appearance: well\n`;
                      break;
                    case 'paragraph':
                      notes += `Vital signs stable. General appearance is well. No acute distress noted.\n`;
                      break;
                    case 'concise':
                      notes += `VS stable, NAD\n`;
                      break;
                    case 'detailed':
                      notes += `Vital Signs: Within normal limits\nTemperature: 98.6°F\nBlood Pressure: 120/80 mmHg\nHeart Rate: 72 bpm\nRespiratory Rate: 16/min\n`;
                      break;
                    default:
                      notes += `Vital signs stable.\n`;
                  }
                }
              } else if (section.id === 'labResults') {
                switch(section.template) {
                  case 'bullet':
                    notes += `• No significant abnormalities\n`;
                    break;
                  case 'paragraph':
                    notes += `Laboratory results reviewed and no significant abnormalities noted.\n`;
                    break;
                  case 'concise':
                    notes += `Labs WNL\n`;
                    break;
                  case 'detailed':
                    notes += `Complete blood count, comprehensive metabolic panel, and urinalysis all within normal limits.\n`;
                    break;
                  default:
                    notes += `All test results normal.\n`;
                }
              }
              
              notes += `\n`;
            }
          });
        }
        
        // Assessment & Plan section
        if (sections.assessmentPlan.some(s => s.selected)) {
          notes += `ASSESSMENT & PLAN:\n`;
          
          sections.assessmentPlan.forEach(section => {
            if (section.selected) {
              notes += `${section.label}:\n`;
              
              if (section.id === 'assessment') {
                switch(section.template) {
                  case 'bullet':
                    notes += `• Based on the patient's symptoms and examination\n• Likely diagnosis: Under evaluation\n`;
                    break;
                  case 'paragraph':
                    notes += `Based on the patient's symptoms and examination, the assessment indicates further evaluation needed.\n`;
                    break;
                  case 'concise':
                    notes += `Assessment pending further evaluation\n`;
                    break;
                  case 'detailed':
                    notes += `Comprehensive evaluation based on the patient's reported symptoms and physical examination indicates the need for additional testing to confirm diagnosis.\n`;
                    break;
                  default:
                    notes += `Assessment is in progress.\n`;
                }
              } else if (section.id === 'patientInstructions') {
                switch(section.template) {
                  case 'bullet':
                    notes += `• Follow-up in 2 weeks\n• Continue current medications\n`;
                    break;
                  case 'paragraph':
                    notes += `Patient advised to follow up in 2 weeks and continue current medication regimen.\n`;
                    break;
                  case 'concise':
                    notes += `F/U 2 weeks, continue meds\n`;
                    break;
                  case 'detailed':
                    notes += `1. Follow-up appointment scheduled in 2 weeks\n2. Continue all current medications as prescribed\n3. Contact office if symptoms worsen\n4. Patient educated about condition management and warning signs\n`;
                    break;
                  default:
                    notes += `Follow-up in 2 weeks.\n`;
                }
              }
              
              notes += `\n`;
            }
          });
        }
        
        this.soapNotesSubject.next(notes);
        resolve(notes);
      }, 1500);
    });
  }

  setActiveTab(tabId: string): void {
    this.activeTabSubject.next(tabId);
  }
  
  setTemplateMode(mode: 'default' | 'custom'): void {
    this.templateModeSubject.next(mode);
  }
}
