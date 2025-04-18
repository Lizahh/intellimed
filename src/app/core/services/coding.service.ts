import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CodeResult {
  cptCode: string;
  cptDescription: string;
  icdCode: string;
  icdDescription: string;
  fee: number;
  visitComplexity?: VisitComplexity;
  timeSpent?: TimeSpent;
  notes?: string;
}

export type InsuranceType = 'medicare' | 'medicaid' | 'private' | 'self-pay';
export type VisitComplexity = 'low' | 'moderate' | 'high';
export type TimeSpent = 'less-than-15' | '15-30' | '30-45' | 'more-than-45';

@Injectable({
  providedIn: 'root'
})
export class CodingService {
  private codingResultSubject = new BehaviorSubject<CodeResult | null>(null);
  codingResult$ = this.codingResultSubject.asObservable();

  private insuranceTypeSubject = new BehaviorSubject<InsuranceType>('private');
  insuranceType$ = this.insuranceTypeSubject.asObservable();

  // We're removing user selection of these parameters and determining them automatically
  private visitComplexitySubject = new BehaviorSubject<VisitComplexity>('moderate');
  visitComplexity$ = this.visitComplexitySubject.asObservable();

  private timeSpentSubject = new BehaviorSubject<TimeSpent>('15-30');
  timeSpent$ = this.timeSpentSubject.asObservable();

  private diagnosisSubject = new BehaviorSubject<string>('');
  diagnosis$ = this.diagnosisSubject.asObservable();

  constructor() {}

  setInsuranceType(type: InsuranceType): void {
    this.insuranceTypeSubject.next(type);
  }

  setVisitComplexity(complexity: VisitComplexity): void {
    this.visitComplexitySubject.next(complexity);
  }

  setTimeSpent(time: TimeSpent): void {
    this.timeSpentSubject.next(time);
  }

  setDiagnosis(diagnosis: string): void {
    this.diagnosisSubject.next(diagnosis);
  }

  generateCoding(
    patientId: string,
    visitType: string,
    transcript: string
  ): Promise<CodeResult> {
    // Get current values
    const insuranceType = this.insuranceTypeSubject.getValue();
    const diagnosisInput = this.diagnosisSubject.getValue();
    
    // Automatically determine visit complexity and time spent based on transcript
    // In a real system, this would use AI to analyze the transcript
    const transcriptLength = transcript?.length || 0;
    
    // Determine visit complexity based on transcript length and keywords
    let visitComplexity: VisitComplexity;
    if (transcriptLength > 1000 || 
        transcript?.toLowerCase().includes('severe') || 
        transcript?.toLowerCase().includes('complex')) {
      visitComplexity = 'high';
    } else if (transcriptLength > 500 || 
              transcript?.toLowerCase().includes('moderate') ||
              transcript?.toLowerCase().includes('multiple')) {
      visitComplexity = 'moderate';
    } else {
      visitComplexity = 'low';
    }
    
    // Determine time spent based on transcript length
    let timeSpent: TimeSpent;
    if (transcriptLength > 1500) {
      timeSpent = 'more-than-45';
    } else if (transcriptLength > 1000) {
      timeSpent = '30-45';
    } else if (transcriptLength > 500) {
      timeSpent = '15-30';
    } else {
      timeSpent = 'less-than-15';
    }
    
    // Update the subjects (for display purposes)
    this.visitComplexitySubject.next(visitComplexity);
    this.timeSpentSubject.next(timeSpent);

    return new Promise((resolve) => {
      // In a real-world scenario, this would call an API with 
      // ML processing to determine accurate codes
      setTimeout(() => {
        let result: CodeResult;

        // Example logic to determine CPT code based on visit complexity and time
        let cptCode = '';
        let cptDescription = '';
        let fee = 0;

        // New patient vs established patient
        const isNewPatient = visitType === 'initial';
        
        // Determine CPT code based on complexity and time
        if (isNewPatient) {
          if (visitComplexity === 'low') {
            if (timeSpent === 'less-than-15') {
              cptCode = '99201';
              cptDescription = 'New patient office visit, level 1';
              fee = 45;
            } else if (timeSpent === '15-30') {
              cptCode = '99202';
              cptDescription = 'New patient office visit, level 2';
              fee = 75;
            } else if (timeSpent === '30-45') {
              cptCode = '99203';
              cptDescription = 'New patient office visit, level 3';
              fee = 110;
            } else {
              cptCode = '99204';
              cptDescription = 'New patient office visit, level 4';
              fee = 170;
            }
          } else if (visitComplexity === 'moderate') {
            if (timeSpent === 'less-than-15' || timeSpent === '15-30') {
              cptCode = '99203';
              cptDescription = 'New patient office visit, level 3';
              fee = 110;
            } else {
              cptCode = '99204';
              cptDescription = 'New patient office visit, level 4';
              fee = 170;
            }
          } else { // high complexity
            if (timeSpent === 'less-than-15' || timeSpent === '15-30') {
              cptCode = '99204';
              cptDescription = 'New patient office visit, level 4';
              fee = 170;
            } else {
              cptCode = '99205';
              cptDescription = 'New patient office visit, level 5';
              fee = 220;
            }
          }
        } else { // established patient
          if (visitComplexity === 'low') {
            if (timeSpent === 'less-than-15') {
              cptCode = '99211';
              cptDescription = 'Established patient office visit, level 1';
              fee = 25;
            } else if (timeSpent === '15-30') {
              cptCode = '99212';
              cptDescription = 'Established patient office visit, level 2';
              fee = 45;
            } else {
              cptCode = '99213';
              cptDescription = 'Established patient office visit, level 3';
              fee = 75;
            }
          } else if (visitComplexity === 'moderate') {
            if (timeSpent === 'less-than-15' || timeSpent === '15-30') {
              cptCode = '99213';
              cptDescription = 'Established patient office visit, level 3';
              fee = 75;
            } else {
              cptCode = '99214';
              cptDescription = 'Established patient office visit, level 4';
              fee = 110;
            }
          } else { // high complexity
            if (timeSpent === 'less-than-15' || timeSpent === '15-30') {
              cptCode = '99214';
              cptDescription = 'Established patient office visit, level 4';
              fee = 110;
            } else {
              cptCode = '99215';
              cptDescription = 'Established patient office visit, level 5';
              fee = 160;
            }
          }
        }

        // Apply insurance adjustments
        if (insuranceType === 'medicare') {
          fee = Math.round(fee * 0.8); // 80% of standard fee
        } else if (insuranceType === 'medicaid') {
          fee = Math.round(fee * 0.6); // 60% of standard fee
        }

        // Example ICD-10 code (in a real system, this would be based on the transcript analysis)
        // Here we're just using the diagnosis input for demonstration
        let icdCode = 'R53.83';
        let icdDescription = 'Other fatigue';

        if (diagnosisInput.toLowerCase().includes('hypertension')) {
          icdCode = 'I10';
          icdDescription = 'Essential (primary) hypertension';
        } else if (diagnosisInput.toLowerCase().includes('diabetes')) {
          icdCode = 'E11.9';
          icdDescription = 'Type 2 diabetes mellitus without complications';
        } else if (diagnosisInput.toLowerCase().includes('anxiety')) {
          icdCode = 'F41.9';
          icdDescription = 'Anxiety disorder, unspecified';
        } else if (diagnosisInput.toLowerCase().includes('depression')) {
          icdCode = 'F32.9';
          icdDescription = 'Major depressive disorder, single episode, unspecified';
        } else if (diagnosisInput.toLowerCase().includes('pain')) {
          icdCode = 'R52';
          icdDescription = 'Pain, unspecified';
        }

        result = {
          cptCode,
          cptDescription,
          icdCode,
          icdDescription,
          fee,
          visitComplexity,
          timeSpent,
          notes: 'AI-generated coding suggestion based on automatically determined visit parameters. Verify before submission.'
        };

        this.codingResultSubject.next(result);
        resolve(result);
      }, 500);
    });
  }

  clearResults(): void {
    this.codingResultSubject.next(null);
  }
}