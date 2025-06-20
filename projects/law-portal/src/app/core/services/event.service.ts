import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  
  // Dashboard refresh events
  private dashboardRefreshSubject = new Subject<void>();
  public dashboardRefresh$ = this.dashboardRefreshSubject.asObservable();

  // Client events
  private clientCreatedSubject = new Subject<any>();
  public clientCreated$ = this.clientCreatedSubject.asObservable();

  private clientUpdatedSubject = new Subject<any>();
  public clientUpdated$ = this.clientUpdatedSubject.asObservable();

  private clientDeletedSubject = new Subject<any>();
  public clientDeleted$ = this.clientDeletedSubject.asObservable();

  // Case events
  private caseCreatedSubject = new Subject<any>();
  public caseCreated$ = this.caseCreatedSubject.asObservable();

  private caseUpdatedSubject = new Subject<any>();
  public caseUpdated$ = this.caseUpdatedSubject.asObservable();

  constructor() { }

  // Dashboard methods
  refreshDashboard(): void {
    this.dashboardRefreshSubject.next();
  }

  // Client methods
  clientCreated(client: any): void {
    this.clientCreatedSubject.next(client);
    this.refreshDashboard(); // Auto refresh dashboard
  }

  clientUpdated(client: any): void {
    this.clientUpdatedSubject.next(client);
    this.refreshDashboard(); // Auto refresh dashboard
  }

  clientDeleted(clientId: any): void {
    this.clientDeletedSubject.next(clientId);
    this.refreshDashboard(); // Auto refresh dashboard
  }

  // Case methods
  caseCreated(case_: any): void {
    this.caseCreatedSubject.next(case_);
    this.refreshDashboard(); // Auto refresh dashboard
  }

  caseUpdated(case_: any): void {
    this.caseUpdatedSubject.next(case_);
    this.refreshDashboard(); // Auto refresh dashboard
  }
} 