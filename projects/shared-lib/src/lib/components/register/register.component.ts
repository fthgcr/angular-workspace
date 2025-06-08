import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'lib-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;

  formErrors: { [key: string]: string } = {};

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]*$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]*$')]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [
        Validators.required,
        Validators.minLength(4),
        Validators.pattern('^[a-zA-Z0-9._-]*$')
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      confirmPassword: ['', [Validators.required]],
      termsAccepted: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });

    // Subscribe to form changes to show validation messages in real-time
    this.registerForm.valueChanges.subscribe(() => {
      this.onFormValuesChanged();
    });
  }

  private passwordMatchValidator(g: FormGroup) {
    const password = g.get('password');
    const confirmPassword = g.get('confirmPassword');
    if (!password || !confirmPassword) return null;
    
    return password.value === confirmPassword.value
      ? null
      : { passwordMismatch: true };
  }

  ngOnInit(): void {
    this.onFormValuesChanged();
  }

  onSubmit(): void {
    const formValue = { ...this.registerForm.value };
    delete formValue.confirmPassword;
    delete formValue.termsAccepted;

    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please check the form for errors'
      });
      return;
    }

    this.loading = true;
    this.authService.register(this.registerForm.value)
      .subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Registration Successful',
            detail: 'Please login with your credentials'
          });
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Registration Failed',
            detail: error.error?.message || 'An error occurred during registration'
          });
          this.loading = false;
        }
      });
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
