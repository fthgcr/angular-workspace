import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PrimeNGConfig } from 'primeng/api';

export interface Language {
  code: string;
  name: string;
  flag: string;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  
  private readonly STORAGE_KEY = 'selected-language';
  private primeConfig?: PrimeNGConfig;

  public readonly languages: Language[] = [
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  private currentLanguageSubject = new BehaviorSubject<Language>(this.getDefaultLanguage());
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  constructor() {
    const savedLanguage = this.getSavedLanguage();
    if (savedLanguage) {
      this.currentLanguageSubject.next(savedLanguage);
    }
  }

  // PrimeNG config'i kaydet ve çevirileri uygula
  setPrimeNGConfig(primeConfig: PrimeNGConfig): void {
    this.primeConfig = primeConfig;
    this.updatePrimeNGTranslations();
  }

  getCurrentLanguage(): Language {
    return this.currentLanguageSubject.value;
  }

  setLanguage(language: Language): void {
    this.currentLanguageSubject.next(language);
    this.saveLanguage(language);
    // Dil değiştiğinde PrimeNG çevirilerini güncelle
    this.updatePrimeNGTranslations();
  }

  private getDefaultLanguage(): Language {
    return this.languages[0];
  }

  private saveLanguage(language: Language): void {
    // localStorage kontrolü (SSR için)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(language));
    }
  }

  private getSavedLanguage(): Language | null {
    try {
      // localStorage kontrolü (SSR için)
      if (typeof localStorage === 'undefined') {
        return null;
      }
      
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const found = this.languages.find(lang => lang.code === parsed.code);
        return found || null;
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
    }
    return null;
  }

  translate(key: string): string {
    const currentLang = this.getCurrentLanguage().code;
    const translation = this.translations[currentLang]?.[key];
    return translation || key;
  }

  private translations: { [lang: string]: { [key: string]: string } } = {
    tr: {
      'panel': 'Panel',
      'lawyers': 'Avukatlar',
      'profile': 'Profil',
      'logout': 'Çıkış Yap',
      'logout.successful': 'Çıkış Başarılı',
      'goodbye': 'Güle güle',
      'logout.message': 'Başarıyla çıkış yaptınız.',
      'change.language': 'Dil Değiştir',
      'lawyer.panel': 'Avukat Paneli',
      'admin.panel': 'Admin Paneli',
      'app.name': 'LexOfis',
      'app.description': 'Hukuk Yönetim Sistemi',
      'app.full.title': 'LexOfis - Hukuk Yönetim Sistemi',
      'copyright.text': 'Tüm hakları saklıdır',
      'client.count': 'Müvekkil',
      'case.count': 'Dava',
      'document.count': 'Dosya',
      'loading.data': 'Veriler yükleniyor...',
      'total.clients': 'Aktif Müvekiller',
      'active.clients': 'aktif müvekkil',
      'no.clients': 'Henüz müvekkil eklenmemiş',
      'monthly.new.clients': 'Son 30 Gün Yeni',
      'growth.vs.last.month': 'önceki 30 güne göre',
      'no.new.clients': 'Son 30 günde yeni müvekkil yok',
      'active.cases': 'Aktif Davalar',
      'ongoing.cases': 'Devam eden dava',
      'no.active.cases': 'Henüz aktif dava yok',
      'total.documents': 'Toplam Dosya',
      'system.documents': 'Sistemdeki dosya',
      'admin.no.documents': 'Henüz dosya yüklenmemiş',
      'overview': 'Genel Bakış',
      'client.management': 'Müvekkil Yönetimi',
      'case.management': 'Dava Yönetimi',
      'document.management': 'Dosya Yönetimi',
      'recent.activities': 'Son Aktiviteler',
      'no.activities': 'Henüz aktivite bulunmuyor',
      'client.status.summary': 'Müvekkil Durumu Özeti',
      'active': 'Aktif',
      'inactive': 'Pasif',
      'total': 'Toplam',
      'no.client.data': 'Henüz müvekkil verisi bulunmuyor',
      'case.status.distribution': 'Dava Durumu Dağılımı',
      'no.case.status.data': 'Henüz dava verisi bulunmuyor',
      'case.types.distribution': 'Dava Türleri Dağılımı',
      'no.case.type.data': 'Henüz dava türü verisi bulunmuyor',
      'activity.client.created': 'tarafından müvekkil eklendi',
      'activity.client.updated': 'tarafından müvekkil güncellendi',
      'activity.case.created': 'tarafından dava eklendi',
      'activity.case.created.with.client': 'tarafından davası müvekkiline eklendi',
      'activity.case.updated': 'tarafından dava güncellendi',
      'activity.case.assigned': 'davası tarafından müvekkiline atandı',
      'activity.case.assigned.simple': 'davası tarafından atandı',
      'activity.document.created': 'tarafından müvekkiline dosyası eklendi',
      'activity.document.created.simple': 'tarafından dosyası eklendi',
      'activity.document.updated': 'tarafından dosyası güncellendi',
      'activity.user.created': 'tarafından kullanıcısı oluşturuldu',
      'activity.user.updated': 'tarafından kullanıcısı güncellendi',
      'client.panel': 'Müvekkil Paneli',
      'welcome.message': 'Hoş geldiniz! Dava süreçlerinizi buradan takip edebilirsiniz.',
      'cases.description': 'Davalarınızı seçerek detay bilgilerini ve dosyalarını görüntüleyebilirsiniz.',
      'refresh': 'Yenile',
      'refresh.tooltip': 'Verileri yenile',
      'client.total.cases': 'Toplam Dava',
      'client.active.cases': 'Aktif Dava',
      'client.total.documents': 'Toplam Dosya',
      'my.cases': 'Davalarım',
      'case.details': 'Dava Detayları',
      'clear.selection': 'Seçimi Temizle',
      'select.case': 'Dava Seçiniz',
      'select.case.description': 'Detay bilgilerini ve dosyalarını görüntülemek için yukarıdaki tablodan bir dava seçiniz.',
      'case.number': 'Dava No',
      'title': 'Başlık',
      'status': 'Durum',
      'type': 'Tür',
      'start.date': 'Başlangıç Tarihi',
      'lawyer': 'Avukat',
      'actions': 'İşlemler',
      'case.number.label': 'Dava Numarası:',
      'case.type.label': 'Dava Türü:',
      'start.date.label': 'Başlangıç Tarihi:',
      'responsible.lawyer': 'Sorumlu Avukat:',
      'description': 'Açıklama:',
      'show.more': 'Daha Fazla',
      'show.less': 'Daha Az',
      'case.documents': 'Dava Dosyaları',
      'file.name': 'Dosya Adı',
      'file.title': 'Başlık',
      'upload.date': 'Yükleme Tarihi',
      'file.size': 'Boyut',
      'download': 'İndir',
      'download.tooltip': 'Dosyayı İndir',
      'status.open': 'Açık',
      'status.in.progress': 'Devam Ediyor',
      'status.pending': 'Beklemede',
      'status.closed': 'Kapalı',
      'case.type.car.depreciation': 'Araç Değer Kaybı',
      'case.type.civil': 'Hukuk',
      'case.type.criminal': 'Ceza',
      'case.type.family': 'Aile',
      'case.type.corporate': 'Şirket',
      'case.type.real.estate': 'Gayrimenkul',
      'case.type.intellectual.property': 'Fikri Mülkiyet',
      'case.type.other': 'Diğer',
      'loading': 'Yükleniyor...',
      'loading.cases': 'Davalar yükleniyor...',
      'loading.documents': 'Dosyalar yükleniyor...',
      'no.cases': 'Henüz dava bulunmamaktadır',
      'no.cases.description': 'Size atanmış herhangi bir dava bulunmamaktadır.',
      'no.documents': 'Bu davaya ait dosya bulunmamaktadır.',
      'data.refreshed': 'Veriler yenilendi',
      'file.downloaded': 'Dosya indirildi',
      'error': 'Hata',
      'success': 'Başarılı',
      'warning': 'Uyarı',
      'yes': 'Evet',
      'no': 'Hayır',
      'back': 'Geri',
      'clients': 'Müvekkiller',
      'assigned.lawyer': 'Atanan Avukat',
      'cases': 'Davalar',
      'case': 'Dava',
      'email': 'Email',
      'unassigned': 'Atanmamış',
      'cases.count': 'Dava',
      'documents.count': 'Dosya',
      'client.information': 'Müvekkil Bilgileri',
      'full.name': 'Ad Soyad',
      'phone': 'Telefon',
      'address': 'Adres',
      'notes': 'Notlar',
      'new.case': 'Yeni Dava',
      'search.case.number': 'Dava no arayın',
      'search.title': 'Başlık arayın',
      'select.type': 'Tür seçin',
      'select.status': 'Durum seçin',
      'select.date': 'Tarih seçin',
      'pagination.template': 'Toplam {totalRecords} kayıttan {first} - {last} arası gösteriliyor',
      'filing.date': 'Açılış Tarihi',
      'created.date': 'Oluşturulma Tarihi',
      'document.type.complaint': 'Şikayet/Dava Dilekçesi',
      'document.type.answer': 'Cevap Dilekçesi',
      'document.type.motion': 'Dilekçe/Talep',
      'document.type.exhibit': 'Delil/Belge',
      'document.type.contract': 'Sözleşme',
      'document.type.correspondence': 'Yazışma',
      'document.type.other': 'Diğer',
      'error.loading.cases': 'Davalar yüklenirken bir hata oluştu',
      'error.loading.documents': 'Dava dosyaları yüklenirken bir hata oluştu',
      'error.downloading': 'Dosya indirilirken bir hata oluştu',
      'error.loading.case': 'Dava bilgileri yüklenirken hata oluştu',
      'warning.fill.required.fields': 'Lütfen gerekli alanları doldurun ve en az bir dosya seçin',
      'success.files.uploaded': '{count} dosya başarıyla yüklendi',
      'error.uploading.file': 'Dosya yüklenirken hata oluştu: {filename}',
      'error.downloading.file': 'Dosya indirilirken hata oluştu',
      'success.file.downloaded': 'Dosya başarıyla indirildi',
      'confirm.delete.document': '{filename} dosyasını silmek istediğinizden emin misiniz?',
      'delete.document': 'Dosya Sil',
      'error.deleting.file': 'Dosya silinirken hata oluştu',
      'success.file.deleted': 'Dosya başarıyla silindi',
      'error.title.required': 'Başlık gereklidir',
      'error.document.type.required': 'Doküman türü gereklidir',
      'error.field.required': '{field} gereklidir',
      
      // Dialog translations
      'view.case.details': 'Dava Detaylarını Görüntüle',
      'edit.case': 'Davayı Düzenle',
      'delete.case': 'Davayı Sil',
      'no.cases.for.client': 'Bu müvekkile ait dava bulunamadı',
      'add.first.case.instruction': 'İlk davayı eklemek için "Yeni Dava" butonuna tıklayın',
      'add.new.case': 'Yeni Dava Ekle',
      'case.information': 'Dava Bilgileri',
      'enter.case.number': 'Dava numarasını girin',
      'generate.new.number': 'Yeni numara oluştur',
      'case.title': 'Dava Başlığı',
      'enter.case.title': 'Dava başlığını girin',
      'enter.case.description': 'Dava açıklamasını girin',
      'case.properties': 'Dava Özellikleri',
      'case.type': 'Dava Türü',
      'select.case.type': 'Dava türünü seçin',
      'case.status': 'Dava Durumu',
      'select.case.status': 'Dava durumunu seçin',
      'cancel': 'İptal',
      'update': 'Güncelle',
      'add': 'Ekle',
      'confirm.delete.case': '{caseNumber} numaralı davayı silmek istediğinizden emin misiniz?',
      'case.deleted.successfully': 'Dava başarıyla silindi',
      'error.deleting.case': 'Dava silinirken bir hata oluştu',
      'case.updated.successfully': 'Dava bilgileri güncellendi',
      'error.updating.case': 'Dava güncellenirken bir hata oluştu',
      'case.added.successfully': 'Yeni dava eklendi',
      'error.creating.case': 'Dava oluşturulurken bir hata oluştu',
      'please.fill.required.fields': 'Lütfen gerekli alanları doldurun',
      'case.number.required': 'Dava numarası gereklidir',
      'case.title.required': 'Dava başlığı gereklidir',
      'case.status.required': 'Dava durumu gereklidir',
      'case.type.required': 'Dava türü gereklidir',
      'filing.date.required': 'Açılış tarihi gereklidir',
      'field.required': '{field} gereklidir',
      
      // Case Detail Document translations
      'case.documents.section': 'Dava Dokümanları',
      'documents.file.count': '{count} dosya',
      'upload.file.button': 'Dosya Yükle',
      'search.in.documents': 'Dosyalarda ara...',
      'table.refresh': 'Yenile',
      'table.title': 'Başlık',
      'table.file.name': 'Dosya Adı',
      'table.document.type': 'Tür',
      'table.file.size': 'Boyut',
      'table.upload.date': 'Yüklenme Tarihi',
      'table.actions': 'İşlemler',
      'button.download': 'İndir',
      'button.delete': 'Sil',
      'no.documents.message': 'Bu davaya ait doküman bulunmuyor',
      'upload.first.file.link': 'İlk dosyayı yüklemek için tıklayın',
      'table.pagination.template': 'Gösterilen: {first} - {last} / Toplam: {totalRecords}',
      
      // Upload Dialog translations
      'dialog.upload.title': 'Dosya Yükle',
      'form.select.file': 'Dosya Seç',
      'form.select.file.required': 'Dosya Seç *',
      'form.choose.file': 'Dosya Seç',
      'form.upload.button': 'Yükle',
      'form.cancel.button': 'İptal',
      'form.allowed.formats': 'İzin verilen formatlar: PDF, Word, Excel, Resim dosyaları (Maks. 10MB)',
      'form.title.label': 'Başlık *',
      'form.title.placeholder': 'Doküman başlığı',
      'form.type.label': 'Doküman Türü *',
      'form.type.placeholder': 'Tür seçin',
      'form.description.label': 'Açıklama',
      'form.description.placeholder': 'Doküman açıklaması (isteğe bağlı)',
      
      // Client Management translations
      'client.management.title': 'Müvekkil Yönetimi',
      'client.management.subtitle': 'Müvekkillerinizi buradan yönetebilirsiniz',
      'new.client': 'Yeni Müvekkil',
      'username': 'Kullanıcı Adı',
      'contact': 'İletişim',
      'registration.date': 'Kayıt Tarihi',
      'search.name': 'Ad veya soyadı arayın',
      'search.email': 'Email arayın',
      'search.username': 'Kullanıcı adı arayın',
      'search.contact': 'Telefon veya adres arayın',
      'active.status': 'Aktif',
      'inactive.status': 'Pasif',
      'operations': 'İşlemler',
      
      // Case Management translations
      'case.management.title': 'Dava Yönetimi',
      'case.management.subtitle': 'Tüm davaları buradan yönetebilirsiniz',
      'search.case.title': 'Başlık arayın',
      'search.client.name': 'Müvekkil adı arayın',
      
      // Document Management translations  
      'min.file.size': 'Min boyut (KB)',
      'no.documents.yet': 'Henüz doküman eklenmemiş',
      'add.first.document': 'İlk dokümanınızı eklemek için "Yeni Doküman" butonuna tıklayın',
      'date': 'Tarih'
    },
    en: {
      'panel': 'Panel',
      'lawyers': 'Lawyers',
      'profile': 'Profile',
      'logout': 'Logout',
      'logout.successful': 'Logout Successful',
      'goodbye': 'Goodbye',
      'logout.message': 'You have been successfully logged out.',
      'change.language': 'Change Language',
      'lawyer.panel': 'Lawyer Panel',
      'admin.panel': 'Admin Panel',
      'app.name': 'LexOfis',
      'app.description': 'Legal Management System',
      'app.full.title': 'LexOfis - Legal Management System',
      'copyright.text': 'All rights reserved',
      'client.count': 'Client',
      'case.count': 'Case',
      'document.count': 'Document',
      'loading.data': 'Loading data...',
      'total.clients': 'Active Clients',
      'active.clients': 'active clients',
      'no.clients': 'No clients added yet',
      'monthly.new.clients': 'New Last 30 Days',
      'growth.vs.last.month': 'vs previous 30 days',
      'no.new.clients': 'No new clients in last 30 days',
      'active.cases': 'Active Cases',
      'ongoing.cases': 'Ongoing cases',
      'no.active.cases': 'No active cases yet',
      'total.documents': 'Total Documents',
      'system.documents': 'Documents in system',
      'admin.no.documents': 'No documents uploaded yet',
      'overview': 'Overview',
      'client.management': 'Client Management',
      'case.management': 'Case Management',
      'document.management': 'Document Management',
      'recent.activities': 'Recent Activities',
      'no.activities': 'No activities yet',
      'client.status.summary': 'Client Status Summary',
      'active': 'Active',
      'inactive': 'Inactive',
      'total': 'Total',
      'no.client.data': 'No client data available',
      'case.status.distribution': 'Case Status Distribution',
      'no.case.status.data': 'No case data available',
      'case.types.distribution': 'Case Types Distribution',
      'no.case.type.data': 'No case type data available',
      'activity.client.created': 'created client',
      'activity.client.updated': 'updated client',
      'activity.case.created': 'created case',
      'activity.case.created.with.client': 'created case for client',
      'activity.case.updated': 'updated case',
      'activity.case.assigned': 'assigned case to client',
      'activity.case.assigned.simple': 'assigned case',
      'activity.document.created': 'created document for client',
      'activity.document.created.simple': 'created document',
      'activity.document.updated': 'updated document',
      'activity.user.created': 'created user',
      'activity.user.updated': 'updated user',
      'client.panel': 'Client Panel',
      'welcome.message': 'Welcome! You can track your case processes here.',
      'cases.description': 'You can view detailed information and files by selecting your cases.',
      'refresh': 'Refresh',
      'refresh.tooltip': 'Refresh data',
      'client.total.cases': 'Total Cases',
      'client.active.cases': 'Active Cases',
      'client.total.documents': 'Total Documents',
      'my.cases': 'My Cases',
      'case.details': 'Case Details',
      'clear.selection': 'Clear Selection',
      'select.case': 'Select Case',
      'select.case.description': 'Select a case from the table above to view detailed information and files.',
      'case.number': 'Case No',
      'title': 'Title',
      'status': 'Status',
      'type': 'Type',
      'start.date': 'Start Date',
      'lawyer': 'Lawyer',
      'actions': 'Actions',
      'case.number.label': 'Case Number:',
      'case.type.label': 'Case Type:',
      'start.date.label': 'Start Date:',
      'responsible.lawyer': 'Responsible Lawyer:',
      'description': 'Description:',
      'show.more': 'Show More',
      'show.less': 'Show Less',
      'case.documents': 'Case Documents',
      'file.name': 'File Name',
      'file.title': 'Title',
      'upload.date': 'Upload Date',
      'file.size': 'Size',
      'download': 'Download',
      'download.tooltip': 'Download File',
      'status.open': 'Open',
      'status.in.progress': 'In Progress',
      'status.pending': 'Pending',
      'status.closed': 'Closed',
      'case.type.car.depreciation': 'Car Depreciation',
      'case.type.civil': 'Civil',
      'case.type.criminal': 'Criminal',
      'case.type.family': 'Family',
      'case.type.corporate': 'Corporate',
      'case.type.real.estate': 'Real Estate',
      'case.type.intellectual.property': 'Intellectual Property',
      'case.type.other': 'Other',
      'loading': 'Loading...',
      'loading.cases': 'Loading cases...',
      'loading.documents': 'Loading documents...',
      'no.cases': 'No cases found',
      'no.cases.description': 'You have no assigned cases.',
      'no.documents': 'No documents found for this case.',
      'data.refreshed': 'Data refreshed',
      'file.downloaded': 'File downloaded',
      'error': 'Error',
      'success': 'Success',
      'warning': 'Warning',
      'yes': 'Yes',
      'no': 'No',
      'back': 'Back',
      'clients': 'Clients',
      'assigned.lawyer': 'Assigned Lawyer',
      'cases': 'Cases',
      'case': 'Case',
      'email': 'Email',
      'unassigned': 'Unassigned',
      'cases.count': 'Cases',
      'documents.count': 'Documents',
      'client.information': 'Client Information',
      'full.name': 'Full Name',
      'phone': 'Phone',
      'address': 'Address',
      'notes': 'Notes',
      'new.case': 'New Case',
      'search.case.number': 'Search case number',
      'search.title': 'Search title',
      'select.type': 'Select type',
      'select.status': 'Select status',
      'select.date': 'Select date',
      'pagination.template': 'Showing {first} - {last} of {totalRecords} records',
      'filing.date': 'Filing Date',
      'created.date': 'Created Date',
      'document.type.complaint': 'Complaint',
      'document.type.answer': 'Answer',
      'document.type.motion': 'Motion',
      'document.type.exhibit': 'Exhibit',
      'document.type.contract': 'Contract',
      'document.type.correspondence': 'Correspondence',
      'document.type.other': 'Other',
      'error.loading.cases': 'An error occurred while loading cases',
      'error.loading.documents': 'An error occurred while loading case documents',
      'error.downloading': 'An error occurred while downloading file',
      'error.loading.case': 'An error occurred while loading case',
      'warning.fill.required.fields': 'Please fill in all required fields and select at least one file',
      'success.files.uploaded': '{count} files uploaded successfully',
      'error.uploading.file': 'An error occurred while uploading file: {filename}',
      'error.downloading.file': 'An error occurred while downloading file',
      'success.file.downloaded': 'File downloaded successfully',
      'confirm.delete.document': 'Are you sure you want to delete {filename}?',
      'delete.document': 'Delete Document',
      'error.deleting.file': 'An error occurred while deleting file',
      'success.file.deleted': 'File deleted successfully',
      'error.title.required': 'Title is required',
      'error.document.type.required': 'Document type is required',
      'error.field.required': '{field} is required',
      
      // Dialog translations
      'view.case.details': 'View Case Details',
      'edit.case': 'Edit Case',
      'delete.case': 'Delete Case',
      'no.cases.for.client': 'No case found for this client',
      'add.first.case.instruction': 'Click the "New Case" button to add your first case',
      'add.new.case': 'Add New Case',
      'case.information': 'Case Information',
      'enter.case.number': 'Enter case number',
      'generate.new.number': 'Generate new number',
      'case.title': 'Case Title',
      'enter.case.title': 'Enter case title',
      'enter.case.description': 'Enter case description',
      'case.properties': 'Case Properties',
      'case.type': 'Case Type',
      'select.case.type': 'Select case type',
      'case.status': 'Case Status',
      'select.case.status': 'Select case status',
      'cancel': 'Cancel',
      'update': 'Update',
      'add': 'Add',
      'confirm.delete.case': 'Are you sure you want to delete {caseNumber}?',
      'case.deleted.successfully': 'Case deleted successfully',
      'error.deleting.case': 'An error occurred while deleting case',
      'case.updated.successfully': 'Case updated successfully',
      'error.updating.case': 'An error occurred while updating case',
      'case.added.successfully': 'Case added successfully',
      'error.creating.case': 'An error occurred while creating case',
      'please.fill.required.fields': 'Please fill in all required fields',
      'case.number.required': 'Case number is required',
      'case.title.required': 'Case title is required',
      'case.status.required': 'Case status is required',
      'case.type.required': 'Case type is required',
      'filing.date.required': 'Filing date is required',
      'field.required': '{field} is required',
      
      // Case Detail Document translations
      'case.documents.section': 'Case Documents',
      'documents.file.count': '{count} files',
      'upload.file.button': 'Upload File',
      'search.in.documents': 'Search in documents...',
      'table.refresh': 'Refresh',
      'table.title': 'Title',
      'table.file.name': 'File Name',
      'table.document.type': 'Type',
      'table.file.size': 'Size',
      'table.upload.date': 'Upload Date',
      'table.actions': 'Actions',
      'button.download': 'Download',
      'button.delete': 'Delete',
      'no.documents.message': 'No documents found for this case',
      'upload.first.file.link': 'Click to upload your first file',
      'table.pagination.template': 'Showing {first} - {last} of {totalRecords}',
      
      // Upload Dialog translations
      'dialog.upload.title': 'Upload File',
      'form.select.file': 'Select File',
      'form.select.file.required': 'Select File *',
      'form.choose.file': 'Choose File',
      'form.upload.button': 'Upload',
      'form.cancel.button': 'Cancel',
      'form.allowed.formats': 'Allowed formats: PDF, Word, Excel, Image files (Max. 10MB)',
      'form.title.label': 'Title *',
      'form.title.placeholder': 'Document title',
      'form.type.label': 'Document Type *',
      'form.type.placeholder': 'Select type',
      'form.description.label': 'Description',
      'form.description.placeholder': 'Document description (optional)',
      
      // Client Management translations
      'client.management.title': 'Client Management',
      'client.management.subtitle': 'Manage your clients from here',
      'new.client': 'New Client',
      'username': 'Username',
      'contact': 'Contact',
      'registration.date': 'Registration Date',
      'search.name': 'Search name or surname',
      'search.email': 'Search email',
      'search.username': 'Search username',
      'search.contact': 'Search phone or address',
      'active.status': 'Active',
      'inactive.status': 'Inactive',
      'operations': 'Operations',
      
      // Case Management translations
      'case.management.title': 'Case Management',
      'case.management.subtitle': 'Manage all cases from here',
      'search.case.title': 'Search title',
      'search.client.name': 'Search client name',
      
      // Document Management translations
      'min.file.size': 'Min size (KB)',
      'no.documents.yet': 'No documents added yet',
      'add.first.document': 'Click "New Document" button to add your first document',
      'date': 'Date'
    }
  };

  // PrimeNG çevirilerini güncelle
  private updatePrimeNGTranslations(): void {
    if (!this.primeConfig) return;

    const currentLang = this.getCurrentLanguage().code;
    
    if (currentLang === 'tr') {
      this.primeConfig.setTranslation({
        apply: 'Uygula',
        cancel: 'İptal',
        clear: 'Temizle',
        accept: 'Evet',
        reject: 'Hayır',
        choose: 'Seç',
        upload: 'Yükle',
        addRule: 'Kural Ekle',
        removeRule: 'Kuralı Kaldır',
        noFilter: 'Filtre Yok',
        lt: 'Küçüktür',
        lte: 'Küçük Eşittir',
        gt: 'Büyüktür',
        gte: 'Büyük Eşittir',
        equals: 'Eşittir',
        notEquals: 'Eşit Değildir',
        contains: 'İçerir',
        notContains: 'İçermez',
        startsWith: 'İle Başlar',
        endsWith: 'İle Biter',
        matchAll: 'Tümü Eşleşsin',
        matchAny: 'Herhangi Biri Eşleşsin',
        dateIs: 'Tarih Eşittir',
        dateIsNot: 'Tarih Eşit Değildir',
        dateBefore: 'Tarih Öncesi',
        dateAfter: 'Tarih Sonrası',
        monthNames: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
        monthNamesShort: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
        dayNames: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
        dayNamesShort: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
        dayNamesMin: ['Pa', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'],
        today: 'Bugün',
        weekHeader: 'Hf'
      });
    } else {
      this.primeConfig.setTranslation({
        apply: 'Apply',
        cancel: 'Cancel',
        clear: 'Clear',
        accept: 'Yes',
        reject: 'No',
        choose: 'Choose',
        upload: 'Upload',
        addRule: 'Add Rule',
        removeRule: 'Remove Rule',
        noFilter: 'No Filter',
        lt: 'Less than',
        lte: 'Less than or equal to',
        gt: 'Greater than',
        gte: 'Greater than or equal to',
        equals: 'Equals',
        notEquals: 'Not equals',
        contains: 'Contains',
        notContains: 'Not contains',
        startsWith: 'Starts with',
        endsWith: 'Ends with',
        matchAll: 'Match All',
        matchAny: 'Match Any',
        dateIs: 'Date is',
        dateIsNot: 'Date is not',
        dateBefore: 'Date is before',
        dateAfter: 'Date is after',
        monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
        today: 'Today',
        weekHeader: 'Wk'
      });
    }
  }
}
