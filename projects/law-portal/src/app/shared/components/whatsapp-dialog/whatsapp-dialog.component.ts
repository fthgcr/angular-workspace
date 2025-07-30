import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-whatsapp-dialog',
  templateUrl: './whatsapp-dialog.component.html',
  styleUrls: ['./whatsapp-dialog.component.scss']
})
export class WhatsappDialogComponent {
  @Input() visible = false;
  @Input() title = 'Onay';
  @Input() message = 'Bu işlemi gerçekleştirmek istediğinizden emin misiniz?';
  @Input() pageName = 'NoPage';
  @Input() confirmButtonText = 'Evet';
  @Input() cancelButtonText = 'Hayır';
  @Input() phoneNumber = "";
  @Input() messageBodyObject: any = {};

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  whatsappUrlEmptySpace = '%20';
  whatsappUrlNewLine = '%0A';
  whatsappUrlComma = '%2C';
  whatsappUrlDot = '%2E';

  onDialogHide(): void {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }

  confirm(): void {
let url = "https://api.whatsapp.com/send?phone=90" + this.phoneNumberBuilder(this.phoneNumber) + "&text=" + this.createMessageBody(this.pageName);
    window.open(url, '_blank');
    this.onConfirm.emit();
    this.onDialogHide();
  }

  cancel(): void {
    this.onCancel.emit();
    this.onDialogHide();
  }

  createMessageBody(pageName: string): string {
    const baseUrl = `${this.whatsappUrlNewLine}${this.whatsappUrlNewLine}Portalımıza ulaşmak için: ${window.location.origin}${this.whatsappUrlNewLine}`;
    const client = `Sayın${this.whatsappUrlEmptySpace}Müvekkil${this.whatsappUrlComma}${this.whatsappUrlNewLine}${this.whatsappUrlNewLine}`;
    const regards = `${this.whatsappUrlNewLine}Saygılarımızla${this.whatsappUrlDot}`;


    if (pageName === 'client-management') {
      return `${client}Adınıza kayıt açılmıştır.${this.whatsappUrlEmptySpace}Giriş bilgileriniz aşağıdaki gibidir:${this.whatsappUrlNewLine}Kullanıcı Adı: ${this.messageBodyObject["username"]}${this.whatsappUrlNewLine}Şifre: ${this.messageBodyObject.password}${baseUrl}${regards}`;
    } else if (pageName === 'client-detail') {
      return `${client}Adınıza yeni dava kaydı açılmıştır.${this.whatsappUrlEmptySpace}Dava bilgileriniz aşağıdaki gibidir:${this.whatsappUrlNewLine}Dava Türü: ${this.messageBodyObject["caseType"]}${baseUrl}${regards}`;
    } else if (pageName === 'case-detail-document') {
      return `${client}${this.messageBodyObject["caseTitle"]} isimli davanıza yeni belge yüklenmiştir.${this.whatsappUrlNewLine}${this.whatsappUrlNewLine}Belge Türü: ${this.messageBodyObject["documentType"]}${baseUrl}${regards}`;
    }
    return '';
  }

  phoneNumberBuilder(phoneNumber: string): string {
    return phoneNumber.length >= 10 ? phoneNumber.slice(-10) : phoneNumber;
  }
} 