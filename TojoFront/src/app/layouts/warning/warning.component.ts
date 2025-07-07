import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FeedComponent } from '../../components/experience/feed/feed.component';
import { NfcComponent } from '../../components/experience/nfc/nfc.component';

@Component({
  selector: 'app-warning',
  standalone: true,
  imports: [CommonModule, RouterModule, FeedComponent, NfcComponent],
  templateUrl: './warning.component.html',
  styleUrl: './warning.component.css'
})
export class WarningComponent {
  currentStep: 'feed' | 'nfc' = 'feed';

  constructor() {
    console.log('WarningComponent initialized, currentStep:', this.currentStep);
  }

  showNfcComponent() {
    console.log('Switching to NFC component');
    this.currentStep = 'nfc';
  }

  resetToFeed() {
    console.log('Switching back to Feed component');
    this.currentStep = 'feed';
  }
}
