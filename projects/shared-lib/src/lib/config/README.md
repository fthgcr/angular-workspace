# 🚨 Production Deployment Config Checklist

Bu doküman, shared-lib'i kullanarak yeni bir production deployment yaparken **mutlaka değiştirilmesi gereken** config alanlarını listeler.

## 🔴 CRITICAL - Mutlaka Değiştirilmesi Gerekenler

Bu alanlar **her production deployment'ta farklı olmalıdır**:

### App Identity
```typescript
{
  "APP_TITLE": "Your App Name",           // 🔴 Şirket/Proje adı
  "APP_DESC": "Your App Description",     // 🔴 Proje açıklaması  
  "PAGE_TITLE": "Your App - Description", // 🔴 Browser tab title
  "COMPANY_NAME": "Your Company Ltd"      // 🔴 Yasal şirket adı
}
```

### Contact Information
```typescript
{
  "CONTACT_EMAIL": "info@yourcompany.com",    // 🔴 Gerçek müşteri destek emaili
  "CONTACT_PHONE": "+90 (212) 555 12 34",    // 🔴 Gerçek müşteri destek telefonu
  "SUPPORT_EMAIL": "support@yourcompany.com"  // 🔴 Gerçek teknik destek emaili
}
```

### Legal Pages
```typescript
{
  "FOOTER": {
    "links": [
      {
        "label": "Privacy Policy",
        "url": "/privacy-policy",     // 🔴 Gerçek gizlilik politikası URL'i
        "external": false
      },
      {
        "label": "Terms of Service", 
        "url": "/terms-of-service",  // 🔴 Gerçek kullanım şartları URL'i
        "external": false
      }
    ]
  }
}
```

## 🟡 SHOULD CHANGE - Değiştirilmesi Önerilen

### Business Logic
```typescript
{
  "CAN_SIGN_UP": true/false,      // İş mantığına göre
  "FORGOT_PASSWORD": true/false,  // İş mantığına göre
}
```

### Branding
```typescript
{
  "LOGO_ICON": "pi pi-balance-scale",  // Sektöre uygun icon
  "THEME": {
    "primary_color": "#your-brand-color",
    "secondary_color": "#your-secondary-color"
  }
}
```

## 🟢 OPTIONAL - İsteğe Bağlı

```typescript
{
  "VERSION": "1.0.0",              // CI/CD ile yönetilebilir
  "COPYRIGHT": "© ...",            // COMPANY_NAME'den otomatik
  "FOOTER": {
    "show_footer": true,           // Genelde true
    "show_version": true,          // İsteğe bağlı
    "show_powered_by": false       // Genelde false
  }
}
```

## 🛠️ Implementation

### Method 1: Runtime Configuration (Önerilen)
```typescript
// app.component.ts
ngOnInit() {
  this.appConfigService.setConfig({
    APP_TITLE: 'My Company Portal',
    COMPANY_NAME: 'My Company Ltd',
    CONTACT_EMAIL: 'info@mycompany.com',
    CONTACT_PHONE: '+90 (212) 555 12 34',
    SUPPORT_EMAIL: 'support@mycompany.com',
    CAN_SIGN_UP: false,
    FORGOT_PASSWORD: false,
    THEME: {
      primary_color: '#1a365d',
      secondary_color: '#2c5282',
      gradient: {
        direction: '135deg',
        start_color: '#1a365d',
        end_color: '#2c5282',
        css_value: 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)'
      }
    },
    FOOTER: {
      show_footer: true,
      copyright_text: '© {CURRENT_YEAR} {COMPANY_NAME}. Tüm hakları saklıdır.',
      links: [
        {
          label: 'Gizlilik Politikası',
          url: 'https://mycompany.com/privacy',
          external: true
        },
        {
          label: 'Kullanım Şartları', 
          url: 'https://mycompany.com/terms',
          external: true
        }
      ],
      show_version: true,
      show_powered_by: false
    }
  });
}
```

### Method 2: Environment-based Configuration
```typescript
// environments/environment.prod.ts
export const environment = {
  production: true,
  appConfig: {
    APP_TITLE: 'Production App',
    COMPANY_NAME: 'Production Company',
    // ... other config
  }
};

// app.component.ts
ngOnInit() {
  this.appConfigService.setConfig(environment.appConfig);
}
```

## 🔍 Validation

AppConfigService otomatik olarak production hazırlığını kontrol eder:

```typescript
// Console'da otomatik çalışır
// ✅ Production config validation passed!
// veya
// 🚨 CRITICAL PRODUCTION CONFIG ISSUES
// 🔴 CRITICAL: CONTACT_EMAIL is using default value...

// Programatik kontrol
const readiness = this.appConfigService.getProductionReadiness();
if (!readiness.ready) {
  console.error('Production deployment not ready:', readiness.criticalIssues);
}
```

## 📋 Deployment Checklist

- [ ] APP_TITLE değiştirildi
- [ ] APP_DESC değiştirildi  
- [ ] PAGE_TITLE değiştirildi
- [ ] COMPANY_NAME değiştirildi
- [ ] CONTACT_EMAIL gerçek email ile değiştirildi
- [ ] CONTACT_PHONE gerçek telefon ile değiştirildi
- [ ] SUPPORT_EMAIL gerçek email ile değiştirildi
- [ ] Privacy Policy URL'i gerçek sayfa ile değiştirildi
- [ ] Terms of Service URL'i gerçek sayfa ile değiştirildi
- [ ] LOGO_ICON sektöre uygun icon ile değiştirildi
- [ ] THEME renkleri şirket brandingine uygun ayarlandı
- [ ] CAN_SIGN_UP business logic'e uygun ayarlandı
- [ ] FORGOT_PASSWORD business logic'e uygun ayarlandı
- [ ] Console'da validation error'ları kontrol edildi

## ⚠️ Yasal Uyarı

**CONTACT_EMAIL**, **CONTACT_PHONE**, **SUPPORT_EMAIL** ve yasal sayfa linkleri gerçek ve çalışır durumda olmalıdır. Bu bilgiler:

- KVKK/GDPR compliance için gereklidir
- Müşteri destek süreçleri için kritiktir  
- Yasal yükümlülükler için zorunludur

Default değerler ile production'a çıkmak **yasal sorunlara** yol açabilir! 