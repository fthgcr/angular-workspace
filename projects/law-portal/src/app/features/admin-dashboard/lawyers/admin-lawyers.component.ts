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
      email: ['', [Validators.required, Validators.email]],
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
      role: 'LAWYER' // Always set to LAWYER for this page
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
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

  deleteUser(user: User): void {
    this.confirmationService.confirm({
      message: `"${user.username}" adlı avukatı silmek istediğinizden emin misiniz?`,
      header: 'Silme Onayı',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.adminService.deleteUser(user.id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Başarılı',
              detail: 'Avukat başarıyla silindi'
            });
            this.loadUsers();
          },
          error: (error: any) => {
            console.error('Error deleting user:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Hata',
              detail: 'Avukat silinirken hata oluştu'
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

  getRoleSeverity(role: string): "success" | "secondary" | "info" | "warning" | "danger" | "contrast" | undefined {
    switch (role) {
      case 'ADMIN':
        return 'danger';
      case 'LAWYER':
        return 'success';
      case 'USER':
        return 'info';
      default:
        return 'secondary';
    }
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
}
