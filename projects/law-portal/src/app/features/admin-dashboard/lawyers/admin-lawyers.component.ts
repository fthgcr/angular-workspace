import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AdminService, User, Role } from '../../../core/services/admin.service';
import { AuthService } from 'shared-lib';

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

  // Role options for dropdown
  roleOptions = [
    { label: 'Avukat', value: 'LAWYER' },
    { label: 'Katip', value: 'CLERK' }
  ];

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private authService: AuthService
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
    this.adminService.getAllLegalStaff().subscribe({
      next: (users: User[]) => {
this.users = users;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading legal staff:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Hata',
          detail: 'Hukuk personeli yüklenirken hata oluştu'
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

    // Get the user's current role (prioritize LAWYER if they have multiple roles)
    let currentRole = 'LAWYER';
    if (user.roles && user.roles.length > 0) {
      if (user.roles.includes('CLERK') && !user.roles.includes('LAWYER')) {
        currentRole = 'CLERK';
      }
    }

    this.userForm.patchValue({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      address: user.address,
      password: '', // Şifre alanını boş bırak
      role: currentRole
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
      const roleLabel = this.getRoleLabel(formData.role);

      if (this.isEditMode && this.selectedUser) {
        // Update user
        this.adminService.updateUser(this.selectedUser.id!, formData).subscribe({
          next: (response: any) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Başarılı',
              detail: `${roleLabel} başarıyla güncellendi`
            });
            this.loadUsers();
            this.hideDialog();
          },
          error: (error: any) => {
            console.error('Error updating user:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Hata',
              detail: error.error?.error || `${roleLabel} güncellenirken hata oluştu`
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
              detail: `Yeni ${roleLabel.toLowerCase()} başarıyla eklendi`
            });
            this.loadUsers();
            this.hideDialog();
          },
          error: (error: any) => {
            console.error('Error creating user:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Hata',
              detail: error.error?.error || `${roleLabel} eklenirken hata oluştu`
            });
          }
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  deactivateUser(user: User): void {
    const userRole = this.getUserRoleDisplay(user);
    const roleForMessage = user.roles?.includes('LAWYER') ? 'Avukat' :
      user.roles?.includes('CLERK') ? 'Katip' : 'Kullanıcı';

    this.confirmationService.confirm({
      message: `"${user.username}" adlı ${roleForMessage.toLowerCase()}yı devre dışı bırakmak istediğinizden emin misiniz? Bu işlem geri alınabilir.`,
      header: `${roleForMessage}yı Devre Dışı Bırak`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Evet, Devre Dışı Bırak',
      rejectLabel: 'İptal',
      accept: () => {
        this.adminService.deactivateUser(user.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Başarılı',
              detail: `${roleForMessage} başarıyla devre dışı bırakıldı`
            });
            this.loadUsers();
          },
          error: (error: any) => {
            console.error('Error deactivating user:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Hata',
              detail: `${roleForMessage} devre dışı bırakılırken hata oluştu`
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
      return user.roles.map(role => this.getRoleLabel(role)).join(', ');
    }
    return 'Rol Yok';
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'LAWYER':
        return 'Avukat';
      case 'CLERK':
        return 'Katip';
      case 'ADMIN':
        return 'Admin';
      case 'USER':
        return 'Kullanıcı';
      default:
        return role;
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isAdmin(): boolean {
    return this.authService.getCurrentRole() === 'ADMIN';
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
    // Debug için

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
