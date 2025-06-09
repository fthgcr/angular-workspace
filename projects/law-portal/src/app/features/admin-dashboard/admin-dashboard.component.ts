import { Component, OnInit } from '@angular/core';
import { AuthService } from 'shared-lib';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  currentUser: any;
  activeTab = 'overview';
  menuItems: MenuItem[] = [];
  activeMenuItem: MenuItem = {};
  
  // Statistics
  totalClients = 3;
  totalCases = 2;
  totalDocuments = 3;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.initializeMenu();
  }

  initializeMenu(): void {
    this.menuItems = [
      {
        label: 'Genel Bakış',
        icon: 'pi pi-home',
        id: 'overview'
      },
      {
        label: 'Müvekkil Yönetimi',
        icon: 'pi pi-users',
        id: 'clients'
      },
      {
        label: 'Dava Yönetimi',
        icon: 'pi pi-briefcase',
        id: 'cases'
      },
      {
        label: 'Doküman Yönetimi',
        icon: 'pi pi-file',
        id: 'documents'
      }
    ];
    
    this.activeMenuItem = this.menuItems[0];
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
    const menuItem = this.menuItems.find(item => item.id === tab);
    if (menuItem) {
      this.activeMenuItem = menuItem;
    }
  }

  logout(): void {
    this.authService.logout();
  }
} 