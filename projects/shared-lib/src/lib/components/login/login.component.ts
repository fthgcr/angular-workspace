import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { LoginRequest } from '../../models/auth.model';

@Component({
  selector: 'lib-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Check if user is already authenticated
    if (this.authService.isAuthenticated()) {
      const currentUser = this.authService.getCurrentUser();
      this.messageService.add({
        severity: 'info',
        summary: 'Already Logged In',
        detail: `You are already logged in as ${currentUser?.firstName}. Redirecting to dashboard...`
      });
      
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 2000);
    }
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      const credentials: LoginRequest = this.loginForm.value;
      
      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Welcome back, ${response.user.firstName}! Redirecting to dashboard...`
          });
          
          // Navigate to dashboard after a short delay for user to see the message
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1500);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Login failed'
          });
          this.loading = false;
        },
        complete: () => {
          // Don't set loading to false here since we're navigating
        }
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please fill in all required fields'
      });
    }
  }
}
