import { Component, OnInit } from '@angular/core';
import { AuthService } from 'shared-lib';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';

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
  loading = false;
  
  // Statistics
  totalClients = 0;
  totalCases = 0;
  totalDocuments = 0;
  monthlyNewClients = 0;
  clientGrowthPercentage = 0;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private dashboardService: DashboardService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.initializeMenu();
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    this.loading = true;
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats: DashboardStats) => {
        this.totalClients = stats.totalClients;
        this.monthlyNewClients = stats.monthlyNewClients;
        this.clientGrowthPercentage = stats.clientGrowthPercentage;
        this.totalCases = stats.activeCases; // Showing active cases instead of total
        this.totalDocuments = stats.totalDocuments;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.loading = false;
        // Keep default values if API fails
      }
    });
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