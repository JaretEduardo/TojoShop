import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AlertService } from '../../services/alert.service';
import { AlertData } from '../../interfaces/api-response.interface';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.css'
})
export class AlertsComponent implements OnInit, OnDestroy {
  currentAlert: AlertData | null = null;
  private alertSubscription: Subscription = new Subscription();

  constructor(private alertService: AlertService) {}

  ngOnInit() {
    this.alertSubscription = this.alertService.alert$.subscribe(
      alert => {
        this.currentAlert = alert;
      }
    );
  }

  ngOnDestroy() {
    this.alertSubscription.unsubscribe();
  }

  closeAlert() {
    this.alertService.hideAlert();
  }

  getAlertIcon(): string {
    if (!this.currentAlert) return '';
    
    switch (this.currentAlert.type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  }

  getAlertClass(): string {
    if (!this.currentAlert) return '';
    return `alert-${this.currentAlert.type}`;
  }
}
