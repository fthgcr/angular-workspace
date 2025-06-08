import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'lib-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  currentStep = 1;
  formErrors: { [key: string]: string } = {};

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]],
      subscribeNewsletter: [false]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: AbstractControl) {
    return g.get('password')?.value === g.get('confirmPassword')?.value ? null : { passwordMismatch: true };
  }

  nextStep() {
    if (this.isCurrentStepValid() && this.currentStep < 3) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  isCurrentStepValid(): boolean {
    let fieldsToCheck: string[] = [];
    
    switch (this.currentStep) {
      case 1:
        fieldsToCheck = ['firstName', 'lastName', 'email', 'phoneNumber'];
        break;
      case 2:
        fieldsToCheck = ['username', 'password', 'confirmPassword'];
        break;
      case 3:
        fieldsToCheck = ['acceptTerms'];
        break;
    }

    const stepValid = fieldsToCheck.every(field => {
      const control = this.registerForm.get(field);
      return control && control.valid;
    });

    // For step 2, also check password match
    if (this.currentStep === 2) {
      return stepValid && !this.registerForm.errors?.['passwordMismatch'];
    }

    return stepValid;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      const formData = { ...this.registerForm.value };
      delete formData.confirmPassword; // Remove confirmPassword from submission
      
      this.authService.register(formData).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Account created successfully! Please check your email for verification.'
          });
          this.loading = false;
          this.navigateToLogin();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Registration failed'
          });
          this.loading = false;
        }
      });
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  private onFormValuesChanged(): void {
    if (!this.registerForm) { return; }

    // Clear previous errors
    Object.keys(this.formErrors).forEach(key => this.formErrors[key] = '');

    const validationMessages = {
      username: {
        required: 'Username is required',
        minlength: 'Username must be at least 4 characters long',
        pattern: 'Username can only contain letters, numbers, dots, underscores and hyphens'
      },
      password: {
        required: 'Password is required',
        minlength: 'Password must be at least 6 characters long'
      },
      email: {
        required: 'Email is required',
        email: 'Please enter a valid email address'
      },
      firstName: {
        required: 'First name is required',
        pattern: 'First name can only contain letters'
      },
      lastName: {
        required: 'Last name is required',
        pattern: 'Last name can only contain letters'
      },
      confirmPassword: {
        required: 'Please confirm your password',
        passwordMismatch: 'Passwords do not match'
      },
      termsAccepted: {
        required: 'You must accept the terms and conditions'
      }
    };

    Object.keys(this.registerForm.controls).forEach(key => {
      this.formErrors[key] = '';
      const control = this.registerForm.get(key);

      if (control && control.dirty && control.invalid) {
        const messages = validationMessages[key as keyof typeof validationMessages];
        Object.keys(control.errors || {}).forEach(errorKey => {
          this.formErrors[key] = messages[errorKey as keyof typeof messages] || '';
        });
      }
    });
  }
}
