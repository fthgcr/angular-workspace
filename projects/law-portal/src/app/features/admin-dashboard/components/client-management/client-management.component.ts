import { Component, OnInit, AfterViewInit, ElementRef, Renderer2, RendererStyleFlags2, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ClientService, Client } from '../../../../core/services/client.service';
import { EventService } from '../../../../core/services/event.service';
import { LanguageService } from '../../../../services/language.service';
import { AuthService } from 'shared-lib';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-client-management',
  templateUrl: './client-management.component.html',
  styleUrls: ['./client-management.component.scss']
})
export class ClientManagementComponent implements OnInit, AfterViewInit, OnDestroy {
  clients: Client[] = [];
  clientForm: FormGroup;
  showDialog = false;
  editingClient: Client | null = null;
  loading = false;

  // Password management
  isPasswordEditing = false;
  originalPasswordValue = '';

  // Language subscription
  private languageSubscription: Subscription = new Subscription();

  // Filter options
  statusOptions = [
    { label: 'Aktif', value: true },
    { label: 'Pasif', value: false }
  ];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private clientService: ClientService,
    private eventService: EventService,
    private languageService: LanguageService,
    private authService: AuthService
  ) {
    this.clientForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.email]], // Email zorunluluğu kaldırıldı, sadece format kontrolü
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      password: ['123456', [Validators.required, Validators.minLength(6)]],
      phoneNumber: [''],
      address: [''],
      notes: [''],
      enabled: [true], // hesap kullanılabilir mi
      active: [true] // is_active kolonu için - login kontrolü
    });

    // Watch for firstName and lastName changes to auto-generate username
    this.clientForm.get('firstName')?.valueChanges.subscribe(() => {
      this.generateUsername();
    });
    
    this.clientForm.get('lastName')?.valueChanges.subscribe(() => {
      this.generateUsername();
    });
  }

  ngOnInit(): void {
    this.loadClients();
    this.updateStatusOptions();
    
    // Subscribe to language changes
    this.languageSubscription.add(
      this.languageService.currentLanguage$.subscribe(() => {
        this.updateStatusOptions();
      })
    );
  }

  ngAfterViewInit(): void {
    // Force scrollbar visibility after view init
    setTimeout(() => {
      this.forceScrollbarVisibility();
    }, 100);
  }

  private forceScrollbarVisibility(): void {
    const tableWrappers = this.elementRef.nativeElement.querySelectorAll('.p-datatable-wrapper, .p-datatable-scrollable-wrapper, .p-datatable-scrollable-body');
    
    tableWrappers.forEach((wrapper: HTMLElement) => {
      // Force overflow styles
      this.renderer.setStyle(wrapper, 'overflow', 'auto', RendererStyleFlags2.Important);
      this.renderer.setStyle(wrapper, 'overflow-y', 'scroll', RendererStyleFlags2.Important);
      this.renderer.setStyle(wrapper, 'scrollbar-width', 'auto', RendererStyleFlags2.Important);
      this.renderer.setStyle(wrapper, '-ms-overflow-style', 'auto', RendererStyleFlags2.Important);
      
      // Force webkit scrollbar
      wrapper.style.setProperty('--webkit-scrollbar-display', 'block', 'important');
      wrapper.style.setProperty('--webkit-scrollbar-width', '15px', 'important');
      wrapper.style.setProperty('--webkit-scrollbar-height', '15px', 'important');
      
      // Add CSS class for forced scrollbar
      this.renderer.addClass(wrapper, 'force-scrollbar');
    });

    // Also try to set styles on the table section
    const tableSection = this.elementRef.nativeElement.querySelector('.table-section');
    if (tableSection) {
      this.renderer.setStyle(tableSection, 'overflow', 'visible', RendererStyleFlags2.Important);
    }
  }

  loadClients(): void {
    this.loading = true;
    this.clientService.getAllClients().subscribe({
      next: (clients) => {
        this.clients = clients;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Hata',
          detail: 'Müvekkiller yüklenirken bir hata oluştu'
        });
        this.loading = false;
        
        // Fallback to mock data for development
        this.clients = [
          {
            id: 1,
            username: 'ahmet.yilmaz',
            email: 'ahmet.yilmaz@email.com',
            firstName: 'Ahmet',
            lastName: 'Yılmaz',
            enabled: true,
            active: true,
            phoneNumber: '+90 555 123 4567',
            address: 'Beşiktaş, İstanbul',
            notes: 'İş hukuku uzmanı avukat',
            createdDate: new Date('2024-01-15')
          },
          {
            id: 2,
            username: 'zeynep.kaya',
            email: 'zeynep.kaya@email.com',
            firstName: 'Zeynep',
            lastName: 'Kaya',
            enabled: true,
            active: true,
            phoneNumber: '+90 555 987 6543',
            address: 'Çankaya, Ankara',
            notes: 'Aile hukuku davalarında müvekkil',
            createdDate: new Date('2024-02-10')
          },
          {
            id: 3,
            username: 'mehmet.celik',
            email: 'mehmet.celik@email.com',
            firstName: 'Mehmet',
            lastName: 'Çelik',
            enabled: true,
            active: true,
            phoneNumber: '+90 555 555 1234',
            address: 'Konak, İzmir',
            notes: 'Ticaret hukuku müvekkili',
            createdDate: new Date('2024-03-05')
          }
        ];
      }
    });
  }

  generateUsername(): void {
    const firstName = this.clientForm.get('firstName')?.value;
    const lastName = this.clientForm.get('lastName')?.value;
    
    if (firstName && lastName && firstName.trim() && lastName.trim()) {
      // Convert to lowercase and remove Turkish characters
      const normalizedFirstName = this.normalizeString(firstName.trim());
      const normalizedLastName = this.normalizeString(lastName.trim());
      
      const username = `${normalizedFirstName}.${normalizedLastName}`;
      this.clientForm.get('username')?.setValue(username);
    }
  }

  private normalizeString(str: string): string {
    // Convert Turkish characters to English equivalents and make lowercase
    return str
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, ''); // Remove any non-alphanumeric characters
  }

  openNewClientDialog(): void {
    this.editingClient = null;
    this.clientForm.reset({
      enabled: true,
      active: true,
      password: '123456'
    });
    // Yeni kullanıcı eklerken password alanını etkinleştir
    this.clientForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.clientForm.get('password')?.updateValueAndValidity();
    this.showDialog = true;
  }

  editClient(client: Client): void {
    this.editingClient = client;
    // Şifre hariç diğer alanları doldur
    this.clientForm.patchValue({
      ...client,
      password: '' // Şifre alanını boş bırak
    });
    // Düzenleme modunda password alanını devre dışı bırak
    this.clientForm.get('password')?.clearValidators();
    this.clientForm.get('password')?.updateValueAndValidity();
    // Reset password editing state
    this.isPasswordEditing = false;
    this.originalPasswordValue = '';
    this.showDialog = true;
  }

  deleteClient(client: Client): void {
    this.confirmationService.confirm({
      message: `${client.firstName} ${client.lastName} müvekkilini silmek istediğinizden emin misiniz?`,
      header: 'Silme Onayı',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.clientService.deleteClient(client.id!).subscribe({
          next: () => {
            this.clients = this.clients.filter(c => c.id !== client.id);
            this.messageService.add({
              severity: 'success',
              summary: 'Başarılı',
              detail: 'Müvekkil silindi'
            });
            this.eventService.clientDeleted(client.id);
          },
          error: (error) => {
            console.error('Error deleting client:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Hata',
              detail: 'Müvekkil silinirken bir hata oluştu'
            });
          }
        });
      }
    });
  }

  saveClient(): void {
    if (this.clientForm.valid) {
      const formData = this.clientForm.value;
      
      if (this.editingClient) {
        // Güncelleme
        this.clientService.updateClient(this.editingClient.id!, formData).subscribe({
          next: (updatedClient) => {
            const index = this.clients.findIndex(c => c.id === this.editingClient!.id);
            if (index !== -1) {
              this.clients[index] = updatedClient;
            }
            this.messageService.add({
              severity: 'success',
              summary: 'Başarılı',
              detail: 'Müvekkil bilgileri güncellendi'
            });
            this.showDialog = false;
            this.clientForm.reset();
            this.editingClient = null;
            this.eventService.clientUpdated(updatedClient);
          },
          error: (error) => {
            console.error('Error updating client:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Hata',
              detail: error.error?.error || 'Müvekkil güncellenirken bir hata oluştu'
            });
          }
        });
      } else {
        // Yeni ekleme
        this.clientService.createClient(formData).subscribe({
          next: (newClient) => {
            this.clients.push(newClient);
            this.messageService.add({
              severity: 'success',
              summary: 'Başarılı',
              detail: 'Yeni müvekkil eklendi'
            });
            this.showDialog = false;
            this.clientForm.reset();
            this.eventService.clientCreated(newClient);
          },
          error: (error) => {
            console.error('Error creating client:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Hata',
              detail: error.error?.error || 'Müvekkil oluşturulurken bir hata oluştu'
            });
          }
        });
      }
      
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Uyarı',
        detail: 'Lütfen gerekli alanları doldurun'
      });
    }
    
  }

  cancelDialog(): void {
    this.showDialog = false;
    this.clientForm.reset();
    this.editingClient = null;
    // Reset password editing state
    this.isPasswordEditing = false;
    this.originalPasswordValue = '';
  }

  getFieldError(fieldName: string): string {
    const field = this.clientForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        switch(fieldName) {
          case 'firstName': return 'Ad gereklidir';
          case 'lastName': return 'Soyad gereklidir';
          case 'username': return 'Kullanıcı adı gereklidir';
          case 'email': return 'Email gereklidir';
          case 'password': return 'Şifre gereklidir';
          default: return `${fieldName} gereklidir`;
        }
      }
      if (field.errors['email']) return 'Geçerli bir email adresi girin';
      if (field.errors['minlength']) {
        if (fieldName === 'password') return 'Şifre en az 6 karakter olmalıdır';
        return `En az ${field.errors['minlength'].requiredLength} karakter olmalıdır`;
      }
    }
    return '';
  }

  searchClients(searchTerm: string): void {
    if (!searchTerm || searchTerm.trim().length === 0) {
      this.loadClients();
      return;
    }

    if (searchTerm.trim().length < 2) {
      return; // Wait for at least 2 characters
    }

    this.loading = true;
    this.clientService.searchClients(searchTerm.trim()).subscribe({
      next: (clients) => {
        this.clients = clients;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error searching clients:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Hata',
          detail: 'Arama yapılırken bir hata oluştu'
        });
        this.loading = false;
      }
    });
  }

  viewClientDetails(client: Client): void {
    this.router.navigate(['/admin/client', client.id]);
  }

  // Password Management Methods
  togglePasswordEdit(): void {
    this.isPasswordEditing = true;
    this.originalPasswordValue = this.clientForm.get('password')?.value || '';
    this.clientForm.get('password')?.setValue('');
    this.clientForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.clientForm.get('password')?.updateValueAndValidity();
  }

  confirmPasswordEdit(): void {
    const newPassword = this.clientForm.get('password')?.value;
    
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
        this.updateClientPassword(newPassword);
      }
    });
  }

  cancelPasswordEdit(): void {
    this.isPasswordEditing = false;
    this.clientForm.get('password')?.setValue(this.originalPasswordValue);
    this.clientForm.get('password')?.clearValidators();
    this.clientForm.get('password')?.updateValueAndValidity();
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
        this.updateClientPassword('123456');
      }
    });
  }

  private updateClientPassword(newPassword: string): void {
    if (!this.editingClient) return;

    // Sadece gerekli alanları gönder
    const updateData = {
      id: this.editingClient.id,
      username: this.editingClient.username,
      email: this.editingClient.email,
      firstName: this.editingClient.firstName,
      lastName: this.editingClient.lastName,
      phoneNumber: this.editingClient.phoneNumber,
      address: this.editingClient.address,
      notes: this.editingClient.notes,
      enabled: this.editingClient.enabled,
      active: this.editingClient.active,
      password: newPassword // Yeni şifre
    };

    console.log('=== PASSWORD UPDATE DEBUG ===');
    console.log('Client ID:', this.editingClient.id);
    console.log('New Password:', newPassword);
    console.log('Update Data:', updateData);
    console.log('API URL will be:', `${environment.apiUrl}/clientsapi/${this.editingClient.id}`);

    this.clientService.updateClient(this.editingClient.id!, updateData).subscribe({
      next: (updatedClient) => {
        // Update local client data
        const index = this.clients.findIndex(c => c.id === this.editingClient!.id);
        if (index !== -1) {
          this.clients[index] = updatedClient;
        }

        // Reset password editing state
        this.isPasswordEditing = false;
        this.originalPasswordValue = '';
        this.clientForm.get('password')?.clearValidators();
        this.clientForm.get('password')?.updateValueAndValidity();

        this.messageService.add({
          severity: 'success',
          summary: 'Başarılı',
          detail: 'Şifre başarıyla güncellendi'
        });
        this.eventService.clientUpdated(updatedClient);
      },
      error: (error) => {
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

  ngOnDestroy(): void {
    this.languageSubscription.unsubscribe();
  }

  translate(key: string): string {
    return this.languageService.translate(key);
  }

  isAdmin(): boolean {
    return this.authService.getCurrentRole() === 'ADMIN';
  }

  private updateStatusOptions(): void {
    this.statusOptions = [
      { label: this.translate('active.status'), value: true },
      { label: this.translate('inactive.status'), value: false }
    ];
  }
} 