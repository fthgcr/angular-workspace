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
        detail: `You are already logged in as ${currentUser?.username}. Redirecting...`
      });
      
      setTimeout(() => {
        this.redirectBasedOnRole();
      }, 2000);
    }
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  private redirectBasedOnRole(): void {
    const role = this.authService.getCurrentRole();
    
    switch (role) {
      case 'ADMIN':
        this.router.navigate(['/admin-dashboard']);
        break;
      case 'LAWYER':
        this.router.navigate(['/lawyer-dashboard']);
        break;
      case 'CLIENT':
        this.router.navigate(['/client-dashboard']);
        break;
      case 'USER':
      default:
        this.router.navigate(['/dashboard']);
        break;
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      const credentials: LoginRequest = this.loginForm.value;
      
      this.authService.login(credentials).subscribe({
        next: (response) => {
          const username = this.authService.getCurrentUser()?.username || 'User';
          const role = response.role;
          
          this.messageService.add({
            severity: 'success',
            summary: 'Login Successful',
            detail: `Welcome back, ${username}! Logged in as ${role}. Redirecting...`
          });
          
          // Navigate based on role after a short delay
          setTimeout(() => {
            this.redirectBasedOnRole();
          }, 1500);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Login Failed',
            detail: error.error?.message || 'Invalid username or password'
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
        summary: 'Validation Error',
        detail: 'Please fill in all required fields'
      });
    }
  }
}
