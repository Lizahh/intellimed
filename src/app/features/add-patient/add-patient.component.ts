import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatientService } from '../../core/services/patient.service';
import { NewPatientFormData } from '../../core/models/patient.model';

@Component({
  selector: 'app-add-patient',
  templateUrl: './add-patient.component.html',
  styleUrls: ['./add-patient.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class AddPatientComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();
  patientForm!: FormGroup;
  isSubmitting = false;
  formError = '';

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.patientForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      dob: ['', [Validators.required]],
      mrn: ['', [Validators.required]],
      status: ['new-patient', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.patientForm.invalid) {
      this.formError = 'Please fill out all required fields correctly.';
      return;
    }

    this.isSubmitting = true;
    this.formError = '';
    
    try {
      const formData: NewPatientFormData = this.patientForm.value;
      this.patientService.addPatient(formData);
      
      // Reset form and close modal
      this.patientForm.reset({
        status: 'new-patient'
      });
      this.closeModal.emit();
    } catch (error) {
      console.error('Error adding patient:', error);
      this.formError = 'There was an error adding the patient. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }

  cancel(): void {
    this.closeModal.emit();
  }
}