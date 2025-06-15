import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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
  
  public readonly languages: Language[] = [
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  private currentLanguageSubject = new BehaviorSubject<Language>(this.getDefaultLanguage());
  public currentLanguage$ = this.currentLanguageSubject.asObservable();

  constructor() {
    // Load saved language from localStorage
    const savedLanguage = this.getSavedLanguage();
    if (savedLanguage) {
      this.currentLanguageSubject.next(savedLanguage);
    }
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): Language {
    return this.currentLanguageSubject.value;
  }

  /**
   * Set current language
   */
  setLanguage(language: Language): void {
    this.currentLanguageSubject.next(language);
    this.saveLanguage(language);
    
    // Reload page to apply new language
    window.location.reload();
  }

  /**
   * Get default language (Turkish)
   */
  private getDefaultLanguage(): Language {
    return this.languages.find(lang => lang.code === 'tr') || this.languages[0];
  }

  /**
   * Save language to localStorage
   */
  private saveLanguage(language: Language): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(language));
  }

  /**
   * Get saved language from localStorage
   */
  private getSavedLanguage(): Language | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return this.languages.find(lang => lang.code === parsed.code) || null;
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
    }
    return null;
  }

  /**
   * Get translation for a key (simple implementation)
   */
  translate(key: string): string {
    const currentLang = this.getCurrentLanguage().code;
    return this.translations[currentLang]?.[key] || key;
  }

  /**
   * Simple translations object (we'll expand this)
   */
  private translations: { [lang: string]: { [key: string]: string } } = {
    tr: {
      // Topbar
      'panel': 'Panel',
      'lawyers': 'Avukatlar',
      'profile': 'Profil',
      'logout': 'Çıkış',
      'logout.successful': 'Çıkış Başarılı',
      'goodbye': 'Hoşçakalın',
      'logout.message': 'Başarıyla çıkış yaptınız.',
      'change.language': 'Dil Değiştir',
      
      // Admin Dashboard
      'lawyer.panel': 'Avukat Paneli',
      'admin.panel': 'Yönetici Paneli',
      'client.count': 'Müvekkil',
      'case.count': 'Dava',
      'document.count': 'Doküman',
      'loading.data': 'Veriler yükleniyor...',
      'total.clients': 'Toplam Müvekkil',
      'active.clients': 'Aktif müvekkiller',
      'no.clients': 'Henüz müvekkil eklenmemiş',
      'monthly.new.clients': 'Bu Ay Yeni Müvekkil',
      'growth.vs.last.month': 'geçen aya göre',
      'no.new.clients': 'Bu ay yeni müvekkil eklenmemiş',
      'active.cases': 'Aktif Dava',
      'ongoing.cases': 'Devam eden davalar',
      'no.active.cases': 'Henüz aktif dava bulunmuyor',
      'total.documents': 'Toplam Doküman',
      'system.documents': 'Sistemdeki dokümanlar',
      'admin.no.documents': 'Henüz doküman yüklenmemiş',
      
      // Tabs
      'overview': 'Genel Bakış',
      'client.management': 'Müvekkil Yönetimi',
      'case.management': 'Dava Yönetimi',
      'document.management': 'Doküman Yönetimi',
      
      // Activities
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
      
      // Header
      'client.panel': 'Müvekkil Paneli',
      'welcome.message': 'Hoş geldiniz! Dava süreçlerinizi buradan takip edebilirsiniz.',
      'cases.description': 'Davalarınızı seçerek detay bilgilerini ve dosyalarını görüntüleyebilirsiniz.',
      'refresh': 'Yenile',
      'refresh.tooltip': 'Verileri yenile',
      
      // Client Stats
      'client.total.cases': 'Toplam Dava',
      'client.active.cases': 'Aktif Dava',
      'client.total.documents': 'Toplam Dosya',
      
      // Cases section
      'my.cases': 'Davalarım',
      'case.details': 'Dava Detayları',
      'clear.selection': 'Seçimi Temizle',
      'select.case': 'Dava Seçiniz',
      'select.case.description': 'Detay bilgilerini ve dosyalarını görüntülemek için yukarıdaki tablodan bir dava seçiniz.',
      
      // Table headers
      'case.number': 'Dava No',
      'title': 'Başlık',
      'status': 'Durum',
      'type': 'Tür',
      'start.date': 'Başlangıç Tarihi',
      'lawyer': 'Avukat',
      'actions': 'İşlemler',
      
      // Case details
      'case.number.label': 'Dava Numarası:',
      'case.type.label': 'Dava Türü:',
      'start.date.label': 'Başlangıç Tarihi:',
      'responsible.lawyer': 'Sorumlu Avukat:',
      'description': 'Açıklama:',
      'show.more': 'Daha Fazla',
      'show.less': 'Daha Az',
      
      // Documents
      'case.documents': 'Dava Dosyaları',
      'file.name': 'Dosya Adı',
      'file.title': 'Başlık',
      'upload.date': 'Yükleme Tarihi',
      'file.size': 'Boyut',
      'download': 'İndir',
      'download.tooltip': 'Dosyayı İndir',
      
      // Status labels
      'status.open': 'Açık',
      'status.in_progress': 'Devam Ediyor',
      'status.pending': 'Beklemede',
      'status.closed': 'Kapalı',
      
      // Case types
      'type.car_depreciation': 'Araç Değer Kaybı',
      'type.civil': 'Hukuk',
      'type.criminal': 'Ceza',
      'type.family': 'Aile',
      'type.corporate': 'Şirket',
      'type.real_estate': 'Gayrimenkul',
      'type.intellectual_property': 'Fikri Mülkiyet',
      'type.other': 'Diğer',
      
      // Messages
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
      'error.loading.cases': 'Davalar yüklenirken bir hata oluştu',
      'error.loading.documents': 'Dava dosyaları yüklenirken bir hata oluştu',
      'error.downloading': 'Dosya indirilirken bir hata oluştu',
      
      // Common
      'unassigned': 'Atanmamış',
      'cases.count': 'Dava',
      'documents.count': 'Dosya'
    },
    en: {
      // Topbar
      'panel': 'Panel',
      'lawyers': 'Lawyers',
      'profile': 'Profile',
      'logout': 'Logout',
      'logout.successful': 'Logout Successful',
      'goodbye': 'Goodbye',
      'logout.message': 'You have been successfully logged out.',
      'change.language': 'Change Language',
      
      // Admin Dashboard
      'lawyer.panel': 'Lawyer Panel',
      'admin.panel': 'Admin Panel',
      'client.count': 'Client',
      'case.count': 'Case',
      'document.count': 'Document',
      'loading.data': 'Loading data...',
      'total.clients': 'Total Clients',
      'active.clients': 'Active clients',
      'no.clients': 'No clients added yet',
      'monthly.new.clients': 'New Clients This Month',
      'growth.vs.last.month': 'vs last month',
      'no.new.clients': 'No new clients added this month',
      'active.cases': 'Active Cases',
      'ongoing.cases': 'Ongoing cases',
      'no.active.cases': 'No active cases yet',
      'total.documents': 'Total Documents',
      'system.documents': 'Documents in system',
      'admin.no.documents': 'No documents uploaded yet',
      
      // Tabs
      'overview': 'Overview',
      'client.management': 'Client Management',
      'case.management': 'Case Management',
      'document.management': 'Document Management',
      
      // Activities
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
      
      // Header
      'client.panel': 'Client Panel',
      'welcome.message': 'Welcome! You can track your legal processes from here.',
      'cases.description': 'Select your cases to view detailed information and documents.',
      'refresh': 'Refresh',
      'refresh.tooltip': 'Refresh data',
      
      // Client Stats
      'client.total.cases': 'Total Cases',
      'client.active.cases': 'Active Cases',
      'client.total.documents': 'Total Documents',
      
      // Cases section
      'my.cases': 'My Cases',
      'case.details': 'Case Details',
      'clear.selection': 'Clear Selection',
      'select.case': 'Select a Case',
      'select.case.description': 'Select a case from the table above to view detailed information and documents.',
      
      // Table headers
      'case.number': 'Case No',
      'title': 'Title',
      'status': 'Status',
      'type': 'Type',
      'start.date': 'Start Date',
      'lawyer': 'Lawyer',
      'actions': 'Actions',
      
      // Case details
      'case.number.label': 'Case Number:',
      'case.type.label': 'Case Type:',
      'start.date.label': 'Start Date:',
      'responsible.lawyer': 'Responsible Lawyer:',
      'description': 'Description:',
      'show.more': 'Show More',
      'show.less': 'Show Less',
      
      // Documents
      'case.documents': 'Case Documents',
      'file.name': 'File Name',
      'file.title': 'Title',
      'upload.date': 'Upload Date',
      'file.size': 'Size',
      'download': 'Download',
      'download.tooltip': 'Download File',
      
      // Status labels
      'status.open': 'Open',
      'status.in_progress': 'In Progress',
      'status.pending': 'Pending',
      'status.closed': 'Closed',
      
      // Case types
      'type.car_depreciation': 'Car Depreciation',
      'type.civil': 'Civil',
      'type.criminal': 'Criminal',
      'type.family': 'Family',
      'type.corporate': 'Corporate',
      'type.real_estate': 'Real Estate',
      'type.intellectual_property': 'Intellectual Property',
      'type.other': 'Other',
      
      // Messages
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
      'error.loading.cases': 'An error occurred while loading cases',
      'error.loading.documents': 'An error occurred while loading case documents',
      'error.downloading': 'An error occurred while downloading file',
      
      // Common
      'unassigned': 'Unassigned',
      'cases.count': 'Cases',
      'documents.count': 'Documents'
    }
  };
} 