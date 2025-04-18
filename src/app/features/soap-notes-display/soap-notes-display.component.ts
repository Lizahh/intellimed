import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, Subject, takeUntil, catchError, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SoapNotesService } from '../../core/services/soap-notes.service';
import { jsPDF } from 'jspdf';

interface SoapNoteSection {
  title: string;
  content: string;
}

@Component({
  selector: 'app-soap-notes-display',
  templateUrl: './soap-notes-display.component.html',
  styleUrls: ['./soap-notes-display.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SoapNotesDisplayComponent implements OnInit, OnDestroy {
  // Used to clean up subscriptions when component is destroyed
  private destroy$ = new Subject<void>();
  soapNotes$: Observable<string>;
  
  // Track which template view is active
  private templateModeSubject = new BehaviorSubject<'default' | 'custom'>('default');
  templateMode$ = this.templateModeSubject.asObservable();
  
  // Track visit type for custom template
  visitType: 'initial' | 'followup' = 'initial';
  
  // Physical exam input for custom template
  physicalExamInput: string = '';
  
  // Parsed SOAP note sections
  visitSummary: string = '';
  subjective: string = '';
  objective: string = '';
  assessmentPlan: string = '';
  
  constructor(private soapNotesService: SoapNotesService) {
    this.soapNotes$ = this.soapNotesService.soapNotes$;
    
    // Ensure we have sample content loaded initially
    this.loadSampleContent();
  }

  ngOnInit(): void {
    // Subscribe to SOAP notes changes to parse the sections
    this.soapNotes$
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          console.error('Error in SOAP notes subscription:', err);
          return of(''); // Return empty string on error to avoid breaking the UI
        })
      )
      .subscribe(notes => {
        if (notes && notes.trim()) {
          this.parseSoapNotes(notes);
        } else {
          // If no SOAP notes available yet, show sample content
          this.loadSampleContent();
        }
      });
    
    // Subscribe to template mode changes from the service
    this.soapNotesService.templateMode$
      .pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          console.error('Error in template mode subscription:', err);
          return of('default' as 'default' | 'custom'); // Default on error
        })
      )
      .subscribe(mode => {
        // Update the local BehaviorSubject to match the service state
        this.templateModeSubject.next(mode);
      });
  }
  
  ngOnDestroy(): void {
    // Clean up all subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  /**
   * Load sample SOAP note content for display
   */
  loadSampleContent(): void {
    this.visitSummary = 'Date: ' + new Date().toLocaleDateString() + '\n' +
      'Provider: Dr. Sarah Chen\n' +
      'Patient: John Doe\n' +
      'DOB: 01/15/1975\n' +
      'Visit Type: New Consult';
      
    this.subjective = 'Chief Complaint:\n' +
      '• Patient presents with persistent headaches for the past 2 weeks\n' +
      '• Reports difficulty sleeping\n\n' +
      'History of Present Illness:\n' +
      'Patient reports onset of headaches approximately 2 weeks ago. Describes pain as "throbbing" and primarily in the frontal region. Rates pain as 6/10 at worst, typically 4/10. Headaches occur daily, typically in the afternoon and evening. Aggravated by bright lights and noise. Partially relieved by over-the-counter pain medications but returns within 3-4 hours. No prior history of similar headaches. Denies trauma. Reports increased stress at work over the past month.';
      
    this.objective = 'Vital Signs:\n' +
      '• BP: 128/82 mmHg\n' +
      '• HR: 74 bpm\n' +
      '• RR: 16/min\n' +
      '• Temp: 98.6°F\n' +
      '• O2 Sat: 99% on room air\n\n' +
      'Physical Examination:\n' +
      'General: Alert and oriented x3, in no acute distress\n' +
      'HEENT: Normocephalic, atraumatic. PERRL. Extraocular movements intact. Mild tenderness to palpation of frontal sinuses bilaterally. No nuchal rigidity.\n' +
      'CV: RRR, no murmurs, gallops, or rubs\n' +
      'Resp: Clear to auscultation bilaterally, no wheezes or crackles\n' +
      'Neuro: CN II-XII intact. Sensation intact to light touch in all extremities. Muscle strength 5/5 throughout. Gait normal. Negative Romberg.';
      
    this.assessmentPlan = 'Assessment:\n' +
      '1. Tension headache - likely related to increased stress and possible sleep disturbance\n' +
      '2. Rule out migraine variant\n' +
      '3. Rule out sinusitis - mild tenderness on exam\n\n' +
      'Plan:\n' +
      '1. Trial of naproxen sodium 220mg PO BID PRN for headache\n' +
      '2. Headache diary to track frequency, intensity, and potential triggers\n' +
      '3. Sleep hygiene counseling provided\n' +
      '4. Lifestyle modifications discussed, including stress management techniques\n' +
      '5. Follow up in 3 weeks, sooner if symptoms worsen\n' +
      '6. Call if headaches become severe, sudden in onset, or associated with focal neurological symptoms';
  }
  
  /**
   * Parse the SOAP notes text into separate sections
   */
  parseSoapNotes(notes: string): void {
    if (!notes) {
      this.resetSections();
      return;
    }
    
    const sections = notes.split(/VISIT SUMMARY:|SUBJECTIVE:|OBJECTIVE:|ASSESSMENT & PLAN:/i);
    
    // Clear any empty sections first
    this.resetSections();
    
    // First section is the header with patient info - skip it
    let sectionIndex = 1;
    
    if (sections.length > sectionIndex) {
      this.visitSummary = this.cleanSectionContent(sections[sectionIndex]);
      sectionIndex++;
    }
    
    if (sections.length > sectionIndex) {
      this.subjective = this.cleanSectionContent(sections[sectionIndex]);
      sectionIndex++;
    }
    
    if (sections.length > sectionIndex) {
      this.objective = this.cleanSectionContent(sections[sectionIndex]);
      sectionIndex++;
    }
    
    if (sections.length > sectionIndex) {
      this.assessmentPlan = this.cleanSectionContent(sections[sectionIndex]);
    }
  }
  
  /**
   * Clean up section content by removing extra whitespace
   */
  cleanSectionContent(content: string): string {
    if (!content) return '';
    return content.trim();
  }
  
  /**
   * Reset all section content
   */
  resetSections(): void {
    this.visitSummary = '';
    this.subjective = '';
    this.objective = '';
    this.assessmentPlan = '';
  }
  
  /**
   * Switch between default and custom template views
   */
  setTemplateMode(mode: 'default' | 'custom'): void {
    // Update both the local state and the service state
    this.templateModeSubject.next(mode);
    this.soapNotesService.setTemplateMode(mode);
  }
  
  /**
   * Check if a specific template mode is active
   */
  isTemplateModeActive(mode: 'default' | 'custom'): boolean {
    return this.templateModeSubject.getValue() === mode;
  }
  
  /**
   * Set the visit type (initial or followup)
   */
  setVisitType(type: 'initial' | 'followup'): void {
    this.visitType = type;
    
    // Update sample content based on visit type if needed
    if (type === 'followup') {
      this.visitSummary = this.visitSummary.replace('New Consult', 'Follow Up');
    } else {
      this.visitSummary = this.visitSummary.replace('Follow Up', 'New Consult');
    }
    
    // Optional: Update the service with the new visit type
    this.soapNotesService.setVisitType(type);
  }
  
  /**
   * Copy SOAP notes to clipboard
   */
  copyToClipboard(): void {
    try {
      // We need to use the current value from our local variable
      // since soapNotes$ is an Observable, not a BehaviorSubject
      const soapText = this.formatSoapText();
      
      if (soapText.trim()) {
        navigator.clipboard.writeText(soapText)
          .then(() => {
            alert('SOAP Notes copied to clipboard!');
          })
          .catch(err => {
            console.error('Could not copy text: ', err);
            alert('Failed to copy to clipboard. Please try again.');
          });
      } else {
        // Get the latest value from the observable
        this.soapNotes$
          .pipe(
            takeUntil(this.destroy$),
            catchError(err => {
              console.error('Error getting SOAP notes for clipboard:', err);
              return of('');
            })
          )
          .subscribe(soap => {
            if (soap) {
              navigator.clipboard.writeText(soap)
                .then(() => {
                  alert('SOAP Notes copied to clipboard!');
                })
                .catch(err => {
                  console.error('Could not copy text: ', err);
                  alert('Failed to copy to clipboard. Please try again.');
                });
            } else {
              alert('No content available to copy.');
            }
          });
      }
    } catch (error) {
      console.error('Error in copyToClipboard:', error);
      alert('An error occurred while trying to copy to clipboard.');
    }
  }
  
  /**
   * Format SOAP notes text for clipboard or export
   */
  private formatSoapText(): string {
    const formattedText = [
      'VISIT SUMMARY:',
      this.visitSummary,
      '\n\nSUBJECTIVE:',
      this.subjective,
      '\n\nOBJECTIVE:',
      this.objective,
      '\n\nASSESSMENT & PLAN:',
      this.assessmentPlan
    ].join('\n');
    
    return formattedText;
  }
  
  /**
   * Export SOAP notes as PDF
   */
  exportAsPdf(): void {
    try {
      // Get formatted content
      const soapText = this.formatSoapText();
      
      if (!soapText.trim()) {
        alert('No content available to export.');
        return;
      }
      
      // Create PDF document
      const doc = new jsPDF();
      
      // Set title
      doc.setFontSize(16);
      doc.text('Medical SOAP Notes', 105, 15, { align: 'center' });
      doc.setFontSize(12);
      
      // Split text into lines that fit the page width
      const textLines = doc.splitTextToSize(soapText, 180);
      
      // Add content to PDF
      doc.text(textLines, 15, 25);
      
      // Get today's date for the filename
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Generate filename based on patient info and date
      let patientName = 'Patient';
      // Extract patient name from visit summary if available
      const nameMatch = this.visitSummary.match(/Patient:\s*([^\n]+)/);
      if (nameMatch && nameMatch[1]) {
        patientName = nameMatch[1].trim().replace(/\s+/g, '_');
      }
      
      // Save the PDF
      doc.save(`SOAP_Notes_${patientName}_${dateStr}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('An error occurred while trying to export the PDF. Please try again.');
    }
  }
}