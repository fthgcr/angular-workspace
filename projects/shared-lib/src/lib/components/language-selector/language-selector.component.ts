import { Component, OnInit } from '@angular/core';
import { I18nService, Language } from '../../services/i18n.service';

@Component({
  selector: 'lib-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss']
})
export class LanguageSelectorComponent implements OnInit {
  languages: Language[] = [];
  selectedLanguage!: Language;

  constructor(private i18nService: I18nService) {}

  ngOnInit(): void {
    this.languages = this.i18nService.getLanguages();
    const currentLang = this.i18nService.getCurrentLanguage();
    this.selectedLanguage = this.languages.find(lang => lang.code === currentLang) || this.languages[0];
  }

  onLanguageChange(language: Language): void {
    this.selectedLanguage = language;
    this.i18nService.setLanguage(language.code);
  }

  t(key: string): string {
    return this.i18nService.translate(key);
  }
} 