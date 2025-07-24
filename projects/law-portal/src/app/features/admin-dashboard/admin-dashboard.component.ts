import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'shared-lib';
import { MenuItem } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { DashboardService, DashboardStats, ClientStatusSummary, CaseTypeDistribution, CaseStatusDistribution, RecentActivity, ActivityType } from '../../core/services/dashboard.service';
import { EventService } from '../../core/services/event.service';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
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

  // New statistics for analytic dashboard
  clientStatusSummary: ClientStatusSummary | null = null;
  caseTypesDistribution: CaseTypeDistribution[] = [];
  caseStatusDistribution: CaseStatusDistribution[] = [];

  // Recent activities
  recentActivities: RecentActivity[] = [];

  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService, 
    private router: Router,
    private route: ActivatedRoute,
    private dashboardService: DashboardService,
    private eventService: EventService,
    private languageService: LanguageService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardStats();
    this.initializeMenu();
    
    // Query parameters'dan tab bilgisini al
    this.route.queryParams.subscribe(params => {
      this.activeTab = params['tab'] || 'overview';
    });

    // Language changes subscription
    this.subscriptions.add(
      this.languageService.currentLanguage$.subscribe(() => {
        this.initializeMenu();
      })
    );

    // Subscribe to dashboard refresh events
    this.subscriptions.add(
      this.eventService.dashboardRefresh$.subscribe(() => {
        console.log('Dashboard refresh event received, reloading stats...');
        this.loadDashboardStats();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadDashboardStats(): void {
    this.loading = true;
    
    console.log('=== LOADING DASHBOARD STATS ===');
    
    // Load all dashboard data in parallel
    Promise.all([
      this.dashboardService.getDashboardStats().toPromise(),
      this.dashboardService.getClientStatusSummary().toPromise(),
      this.dashboardService.getCaseTypesDistribution().toPromise(),
      this.dashboardService.getCaseStatusDistribution().toPromise(),
      this.dashboardService.getRecentActivities().toPromise()
    ]).then(([stats, clientStatus, caseTypes, caseStatus, activities]) => {
      console.log('Dashboard API Response:', {
        stats,
        clientStatus,
        caseTypes,
        caseStatus,
        activities
      });

      // Main stats
      if (stats) {
        console.log('Setting dashboard stats:', {
          totalClients: stats.totalClients,
          monthlyNewClients: stats.monthlyNewClients,
          clientGrowthPercentage: stats.clientGrowthPercentage,
          activeCases: stats.activeCases,
          totalDocuments: stats.totalDocuments
        });

        this.totalClients = stats.totalClients;
        this.monthlyNewClients = stats.monthlyNewClients;
        this.clientGrowthPercentage = stats.clientGrowthPercentage;
        this.totalCases = stats.activeCases; // Showing active cases instead of total
        this.totalDocuments = stats.totalDocuments;

        console.log('Component values after setting:', {
          totalClients: this.totalClients,
          monthlyNewClients: this.monthlyNewClients,
          clientGrowthPercentage: this.clientGrowthPercentage,
          totalCases: this.totalCases,
          totalDocuments: this.totalDocuments
        });
      } else {
        console.warn('Stats is null or undefined!');
      }

      // Client status summary
      this.clientStatusSummary = clientStatus || null;

      // Case types distribution
      this.caseTypesDistribution = caseTypes || [];

      // Case status distribution
      this.caseStatusDistribution = caseStatus || [];

      // Recent activities
      this.recentActivities = activities || [];

      this.loading = false;
      console.log('=== DASHBOARD STATS LOADED ===');
    }).catch((error) => {
      console.error('Error loading dashboard stats:', error);
      this.loading = false;
      // Keep default values if API fails
    });
  }

  initializeMenu(): void {
    this.menuItems = [
      {
        label: this.translate('overview'),
        icon: 'pi pi-home',
        id: 'overview'
      },
      {
        label: this.translate('client.management'),
        icon: 'pi pi-users',
        id: 'clients'
      },
      {
        label: this.translate('case.management'),
        icon: 'pi pi-briefcase',
        id: 'cases'
      },
      {
        label: this.translate('document.management'),
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
    
    // Overview tab'ına geçildiğinde dashboard'ı yenile
    if (tab === 'overview') {
      console.log('Switching to overview tab, refreshing dashboard...');
      this.loadDashboardStats();
    }
  }

  logout(): void {
    this.authService.logout();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'OPEN': return 'open';
      case 'IN_PROGRESS': return 'progress';
      case 'PENDING': return 'pending';
      case 'CLOSED': return 'closed';
      default: return 'open';
    }
  }

  getCaseTypeClass(type: string): string {
    switch (type) {
      case 'CIVIL': return 'civil';
      case 'CRIMINAL': return 'criminal';
      case 'FAMILY': return 'family';
      case 'CORPORATE': return 'corporate';
      case 'REAL_ESTATE': return 'real-estate';
      case 'INTELLECTUAL_PROPERTY': return 'intellectual';
      case 'CAR_DEPRECIATION': return 'car-depreciation';
      case 'OTHER': return 'other';
      default: return 'other';
    }
  }

  /**
   * Get detailed activity description with user and entity information
   */
  getDetailedActivityDescription(activity: RecentActivity): string {
    // Backend'den zaten Türkçe description geliyor, direkt döndür
    return activity.description;
  }

  /**
   * Get activity icon based on activity type
   */
  getActivityIcon(activity: RecentActivity): string {
    switch (activity.type) {
      case ActivityType.CLIENT_CREATED:
      case ActivityType.CLIENT_UPDATED:
        return 'pi-user-plus';
      
      case ActivityType.CASE_CREATED:
      case ActivityType.CASE_UPDATED:
      case ActivityType.CASE_ASSIGNED:
        return 'pi-briefcase';
      
      case ActivityType.DOCUMENT_CREATED:
      case ActivityType.DOCUMENT_UPDATED:
        return 'pi-file';
      
      case ActivityType.USER_CREATED:
      case ActivityType.USER_UPDATED:
        return 'pi-users';
      
      case ActivityType.CLIENT_DELETED:
      case ActivityType.CASE_DELETED:
      case ActivityType.DOCUMENT_DELETED:
        return 'pi-trash';
      
      default:
        return activity.icon || 'pi-clock';
    }
  }

  /**
   * Get CSS class for activity type
   */
  getActivityTypeClass(activity: RecentActivity): string {
    switch (activity.type) {
      case ActivityType.CLIENT_CREATED:
      case ActivityType.CASE_CREATED:
      case ActivityType.DOCUMENT_CREATED:
      case ActivityType.USER_CREATED:
        return 'activity-created';
      
      case ActivityType.CLIENT_UPDATED:
      case ActivityType.CASE_UPDATED:
      case ActivityType.DOCUMENT_UPDATED:
      case ActivityType.USER_UPDATED:
      case ActivityType.CASE_ASSIGNED:
        return 'activity-updated';
      
      case ActivityType.CLIENT_DELETED:
      case ActivityType.CASE_DELETED:
      case ActivityType.DOCUMENT_DELETED:
        return 'activity-deleted';
      
      default:
        return 'activity-default';
    }
  }

  /**
   * Get user display name for activity
   */
  getUserDisplayName(activity: RecentActivity): string {
    return `${activity.performedBy.firstName} ${activity.performedBy.lastName}`;
  }

  /**
   * Get target entity display with related info
   */
  getTargetEntityDisplay(activity: RecentActivity): string {
    const target = activity.targetEntity.name;
    const related = activity.relatedEntity?.name;
    
    if (related && activity.targetEntity.type === 'CASE') {
      return `${target} (${related})`;
    }
    if (related && activity.targetEntity.type === 'DOCUMENT') {
      return `${target} (${related})`;
    }
    
    return target;
  }

  /**
   * Get translation for a key
   */
  translate(key: string): string {
    return this.languageService.translate(key);
  }
} 