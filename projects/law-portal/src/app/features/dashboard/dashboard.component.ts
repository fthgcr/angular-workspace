import { Component, OnInit } from '@angular/core';
import { AuthService } from 'shared-lib';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: any = null;
  currentTime: string = '';
  
  // Dashboard Statistics
  dashboardStats = [
    { 
      title: 'Active Cases', 
      value: '24', 
      icon: 'pi-briefcase', 
      color: '#667eea',
      trend: '+12%'
    },
    { 
      title: 'Completed Cases', 
      value: '156', 
      icon: 'pi-check-circle', 
      color: '#48bb78',
      trend: '+8%'
    },
    { 
      title: 'Pending Reviews', 
      value: '8', 
      icon: 'pi-clock', 
      color: '#ed8936',
      trend: '-3%'
    },
    { 
      title: 'New Clients', 
      value: '12', 
      icon: 'pi-users', 
      color: '#9f7aea',
      trend: '+15%'
    }
  ];

  // Quick Actions
  quickActions = [
    { 
      title: 'New Case', 
      description: 'Create a new legal case', 
      icon: 'pi-plus-circle', 
      color: '#667eea',
      route: '/cases/new'
    },
    { 
      title: 'Client Management', 
      description: 'Manage client information', 
      icon: 'pi-users', 
      color: '#48bb78',
      route: '/clients'
    },
    { 
      title: 'Document Library', 
      description: 'Access legal documents', 
      icon: 'pi-file', 
      color: '#ed8936',
      route: '/documents'
    },
    { 
      title: 'Calendar', 
      description: 'View appointments and deadlines', 
      icon: 'pi-calendar', 
      color: '#9f7aea',
      route: '/calendar'
    }
  ];

  // Recent Activities
  recentActivities = [
    {
      title: 'Case #2024-001 updated',
      description: 'Smith vs. Johnson - Status changed to In Review',
      time: '2 hours ago',
      icon: 'pi-file-edit',
      color: '#667eea'
    },
    {
      title: 'New client registered',
      description: 'Maria Garcia has been added to the system',
      time: '4 hours ago',
      icon: 'pi-user-plus',
      color: '#48bb78'
    },
    {
      title: 'Document uploaded',
      description: 'Contract Agreement v2.1.pdf uploaded',
      time: '6 hours ago',
      icon: 'pi-cloud-upload',
      color: '#ed8936'
    },
    {
      title: 'Meeting scheduled',
      description: 'Client consultation for tomorrow at 10:00 AM',
      time: '1 day ago',
      icon: 'pi-calendar-plus',
      color: '#9f7aea'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.updateCurrentTime();
    setInterval(() => this.updateCurrentTime(), 1000);
  }

  updateCurrentTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  navigateToAction(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    const currentUser = this.currentUser;
    this.authService.logout();
    
    this.messageService.add({
      severity: 'success',
      summary: 'Logged Out',
      detail: `Goodbye ${currentUser?.firstName}! You have been successfully logged out.`
    });
    
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1500);
  }
}
