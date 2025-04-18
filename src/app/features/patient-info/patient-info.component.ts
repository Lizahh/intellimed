import { Component, EventEmitter, Input, OnInit, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SoapNotesService, VisitType } from '../../core/services/soap-notes.service';
import { Subject, takeUntil } from 'rxjs';

interface VisitTypeOption {
  label: string;
  value: VisitType;
}

@Component({
  selector: 'app-patient-info',
  imports: [CommonModule],
  templateUrl: './patient-info.component.html',
  styleUrl: './patient-info.component.scss',
  standalone: true
})
export class PatientInfoComponent implements OnInit, OnDestroy {
  @Input() patientName: string = 'John Doe';
  @Input() patientId: string = '843288';
  
  @Output() visitTypeChanged = new EventEmitter<VisitType>();
  
  selectedVisitType: VisitType = 'annual';
  
  visitTypes: VisitTypeOption[] = [
    { label: 'Annual Physical', value: 'annual' },
    { label: 'New Consult', value: 'initial' },
    { label: 'Follow Up', value: 'followup' }
  ];

  // Subject for unsubscribing from observables when component is destroyed
  private destroy$ = new Subject<void>();

  constructor(private soapNotesService: SoapNotesService) {}

  ngOnInit(): void {
    // Subscribe to the current visit type from the service
    // Use takeUntil to automatically unsubscribe when component is destroyed
    this.soapNotesService.visitType$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (type) => {
          this.selectedVisitType = type;
        },
        error: (err) => {
          console.error('Error from visit type subscription:', err);
          // Fall back to default if there's an error
          this.selectedVisitType = 'annual';
        }
      });
  }

  ngOnDestroy(): void {
    // Emit completion to unsubscribe from all subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Updates the visit type in the service and emits the change event
   * @param value The new visit type
   */
  onVisitTypeChange(value: VisitType): void {
    if (!value || !this.isValidVisitType(value)) {
      console.warn('Invalid visit type provided:', value);
      return;
    }
    
    this.selectedVisitType = value;
    this.soapNotesService.setVisitType(value);
    this.visitTypeChanged.emit(value);
  }

  /**
   * Validates that the value is one of the defined visit types
   * @param value The visit type to validate
   * @returns Whether the value is a valid visit type
   */
  private isValidVisitType(value: string): boolean {
    return this.visitTypes.some(type => type.value === value);
  }
}
