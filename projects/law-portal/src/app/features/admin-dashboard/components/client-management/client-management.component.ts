import { Component, OnInit, AfterViewInit, ElementRef, Renderer2, RendererStyleFlags2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { ClientService, Client } from '../../../../core/services/client.service';

@Component({
  selector: 'app-client-management',
  templateUrl: './client-management.component.html',
  styleUrls: ['./client-management.component.scss']
})
export class ClientManagementComponent implements OnInit, AfterViewInit {
  clients: Client[] = [];
  clientForm: FormGroup;
  showDialog = false;
  editingClient: Client | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private clientService: ClientService
  ) {
    this.clientForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phoneNumber: [''],
      address: [''],
      notes: [''],
      enabled: [true]
    });
  }

  ngOnInit(): void {
    this.loadClients();
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

  openNewClientDialog(): void {
    this.editingClient = null;
    this.clientForm.reset({
      enabled: true
    });
    // Yeni kullanıcı eklerken password alanını etkinleştir
    this.clientForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.clientForm.get('password')?.updateValueAndValidity();
    this.showDialog = true;
  }

  editClient(client: Client): void {
    this.editingClient = client;
    this.clientForm.patchValue(client);
    // Düzenleme modunda password alanını devre dışı bırak
    this.clientForm.get('password')?.clearValidators();
    this.clientForm.get('password')?.updateValueAndValidity();
    this.showDialog = true;
  }

  deleteClient(client: Client): void {
    this.confirmationService.confirm({
      message: `${client.firstName} ${client.lastName} isimli müvekkili silmek istediğinizden emin misiniz?`,
      header: 'Müvekkil Sil',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Evet',
      rejectLabel: 'Hayır',
      accept: () => {
        this.clientService.deleteClient(client.id!).subscribe({
          next: () => {
            this.clients = this.clients.filter(c => c.id !== client.id);
            this.messageService.add({
              severity: 'success',
              summary: 'Başarılı',
              detail: 'Müvekkil başarıyla silindi'
            });
          },
          error: (error) => {
            console.error('Error deleting client:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Hata',
              detail: error.error?.error || 'Müvekkil silinirken bir hata oluştu'
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
} 