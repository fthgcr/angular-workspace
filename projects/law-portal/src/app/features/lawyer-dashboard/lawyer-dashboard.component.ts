import { Component, OnInit } from '@angular/core';
import { AuthService } from 'shared-lib';

@Component({
  selector: 'app-lawyer-dashboard',
  templateUrl: './lawyer-dashboard.component.html',
  styleUrls: ['./lawyer-dashboard.component.scss']
})
export class LawyerDashboardComponent implements OnInit {
  currentUser: any;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
  }
} 