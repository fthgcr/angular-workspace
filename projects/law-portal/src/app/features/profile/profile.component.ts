import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AuthService, UserProfileService, UserProfile } from 'shared-lib';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  profileForm!: FormGroup;
  userProfile: UserProfile | null = null;
  loading = false;
  editMode = false;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userProfileService: UserProfileService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.maxLength(20)]],
      address: ['', [Validators.maxLength(200)]]
    });
  }

  private loadUserProfile(): void {
    this.loading = true;
    this.subscriptions.add(
      this.authService.currentUserProfile$.subscribe({
        next: (profile) => {
          if (profile) {
            this.userProfile = profile;
            this.populateForm(profile);
          }
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error loading profile:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load profile information'
          });
          this.loading = false;
        }
      })
    );
  }

  private populateForm(profile: UserProfile): void {
    this.profileForm.patchValue({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phoneNumber: profile.phoneNumber || '',
      address: profile.address || ''
    });
  }

  onEdit(): void {
    this.editMode = true;
  }

  onCancel(): void {
    this.editMode = false;
    if (this.userProfile) {
      this.populateForm(this.userProfile);
    }
  }

  onSave(): void {
    if (this.profileForm.valid) {
      this.loading = true;
      const updatedProfile = { ...this.profileForm.value };
      
      this.subscriptions.add(
        this.userProfileService.updateUserProfile(updatedProfile).subscribe({
          next: (profile: UserProfile) => {
            this.userProfile = profile;
            this.editMode = false;
            this.loading = false;
            this.authService.refreshUserProfile();
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Profile updated successfully'
            });
          },
          error: (error: any) => {
            console.error('Error updating profile:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update profile'
            });
            this.loading = false;
          }
        })
      );
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields correctly'
      });
    }
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'badge-admin';
      case 'LAWYER':
        return 'badge-lawyer';
      case 'USER':
        return 'badge-user';
      default:
        return 'badge-default';
    }
  }

  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
} 