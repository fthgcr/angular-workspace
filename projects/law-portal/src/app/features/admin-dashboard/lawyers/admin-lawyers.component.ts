import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AdminService, User, Role } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-lawyers',
  templateUrl: './admin-lawyers.component.html',
  styleUrls: ['./admin-lawyers.component.scss']
})
export class AdminLawyersComponent implements OnInit {
  users: User[] = [];
  roles: Role[] = [];
  loading = false;
  showDialog = false;
  isEditMode = false;
  selectedUser: User | null = null;
  
  // Password management
  isPasswordEditing = false;
  originalPasswordValue = '';
  
  userForm: FormGroup;

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.email]], // Email zorunluluğu kaldırıldı, sadece format kontrolü
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: [''],
      address: [''],
      role: ['LAWYER', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers(): void {
    this.loading = true;
    console.log('Loading lawyers...');
    this.adminService.getAllLawyers().subscribe({
      next: (users: User[]) => {
        console.log('Received lawyers:', users);
        console.log('Number of lawyers:', users.length);
        this.users = users;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading lawyers:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Hata',
          detail: 'Avukatlar yüklenirken hata oluştu'
        });
        this.loading = false;
      }
    });
  }

  loadRoles(): void {
    this.adminService.getRoles().subscribe({
      next: (roles: Role[]) => {
        this.roles = roles;
      },
      error: (error: any) => {
        console.error('Error loading roles:', error);
      }
    });
  }

  openNewUserDialog(): void {
    this.isEditMode = false;
    this.selectedUser = null;
    this.userForm.reset();
    this.userForm.patchValue({ role: 'LAWYER' });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.showDialog = true;
  }

  editUser(user: User): void {
    this.isEditMode = true;
    this.selectedUser = user;
    this.userForm.patchValue({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      address: user.address,
      password: '', // Şifre alanını boş bırak
      role: 'LAWYER' // Always set to LAWYER for this page
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    // Reset password editing state
    this.isPasswordEditing = false;
    this.originalPasswordValue = '';
    this.showDialog = true;
  }

  saveUser(): void {
    if (this.userForm.valid) {
      const formData = this.userForm.value;
      
      if (this.isEditMode && this.selectedUser) {
        // Update user
        this.adminService.updateUser(this.selectedUser.id!, formData).subscribe({
          next: (response: any) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Başarılı',
              detail: 'Avukat başarıyla güncellendi'
            });
            this.loadUsers();
            this.hideDialog();
          },
          error: (error: any) => {
            console.error('Error updating user:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Hata',
              detail: error.error?.error || 'Avukat güncellenirken hata oluştu'
            });
          }
        });
      } else {
        // Create new user
        this.adminService.createUser(formData).subscribe({
          next: (response: any) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Başarılı',
              detail: 'Yeni avukat başarıyla eklendi'
            });
            this.loadUsers();
            this.hideDialog();
          },
          error: (error: any) => {
            console.error('Error creating user:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Hata',
              detail: error.error?.error || 'Avukat eklenirken hata oluştu'
            });
          }
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  deactivateUser(user: User): void {
    this.confirmationService.confirm({
      message: `"${user.username}" adlı avukatı devre dışı bırakmak istediğinizden emin misiniz? Bu işlem geri alınabilir.`,
      header: 'Avukatı Devre Dışı Bırak',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Evet, Devre Dışı Bırak',
      rejectLabel: 'İptal',
      accept: () => {
        this.adminService.deactivateUser(user.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Başarılı',
              detail: 'Avukat başarıyla devre dışı bırakıldı'
            });
            this.loadUsers();
          },
          error: (error: any) => {
            console.error('Error deactivating user:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Hata',
              detail: 'Avukat devre dışı bırakılırken hata oluştu'
            });
          }
        });
      }
    });
  }

  hideDialog(): void {
    this.showDialog = false;
    this.userForm.reset();
    this.selectedUser = null;
    // Reset password editing state
    this.isPasswordEditing = false;
    this.originalPasswordValue = '';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }

  getUserRoleDisplay(user: User): string {
    if (user.roles && user.roles.length > 0) {
      return user.roles.join(', ');
    }
    return 'Rol Yok';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} gereklidir`;
      if (field.errors['email']) return 'Geçerli bir email adresi giriniz';
      if (field.errors['minlength']) return `En az ${field.errors['minlength'].requiredLength} karakter olmalıdır`;
    }
    return '';
  }

  // Password Management Methods
  togglePasswordEdit(): void {
    this.isPasswordEditing = true;
    this.originalPasswordValue = this.userForm.get('password')?.value || '';
    this.userForm.get('password')?.setValue('');
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  confirmPasswordEdit(): void {
    const newPassword = this.userForm.get('password')?.value;
    
    if (!newPassword || newPassword.length < 6) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Uyarı',
        detail: 'Şifre en az 6 karakter olmalıdır'
      });
      return;
    }

    this.confirmationService.confirm({
      message: 'Şifreyi değiştirmek istediğinizden emin misiniz?',
      header: 'Şifre Değiştir',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Evet',
      rejectLabel: 'Hayır',
      accept: () => {
        this.updateUserPassword(newPassword);
      }
    });
  }

  cancelPasswordEdit(): void {
    this.isPasswordEditing = false;
    this.userForm.get('password')?.setValue(this.originalPasswordValue);
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.originalPasswordValue = '';
  }

  resetPassword(): void {
    this.confirmationService.confirm({
      message: 'Şifreyi varsayılan değere (123456) sıfırlamak istediğinizden emin misiniz?',
      header: 'Şifre Sıfırla',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Evet',
      rejectLabel: 'Hayır',
      accept: () => {
        this.updateUserPassword('123456');
      }
    });
  }

  private updateUserPassword(newPassword: string): void {
    if (!this.selectedUser) return;

    // Sadece gerekli alanları gönder
    const updateData = {
      id: this.selectedUser.id,
      username: this.selectedUser.username,
      email: this.selectedUser.email,
      firstName: this.selectedUser.firstName,
      lastName: this.selectedUser.lastName,
      phoneNumber: this.selectedUser.phoneNumber,
      address: this.selectedUser.address,
      password: newPassword // Yeni şifre
    };

    console.log('Updating user password with data:', updateData); // Debug için

    this.adminService.updateUser(this.selectedUser.id!, updateData).subscribe({
      next: (response: any) => {
        // Update local user data
        const index = this.users.findIndex(u => u.id === this.selectedUser!.id);
        if (index !== -1) {
          this.users[index] = response;
        }

        // Reset password editing state
        this.isPasswordEditing = false;
        this.originalPasswordValue = '';
        this.userForm.get('password')?.clearValidators();
        this.userForm.get('password')?.updateValueAndValidity();

        this.messageService.add({
          severity: 'success',
          summary: 'Başarılı',
          detail: 'Şifre başarıyla güncellendi'
        });
      },
      error: (error: any) => {
        console.error('Error updating password:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Hata',
          detail: error.error?.error || 'Şifre güncellenirken bir hata oluştu'
        });
        
        // Reset to original state on error
        this.cancelPasswordEdit();
      }
    });
  }
}
