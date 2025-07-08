import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FeedComponent } from '../../components/experience/feed/feed.component';
import { NfcComponent } from '../../components/experience/nfc/nfc.component';
import { SpinnerService } from '../../services/spinner.service';

@Component({
  selector: 'app-warning',
  standalone: true,
  imports: [CommonModule, RouterModule, FeedComponent, NfcComponent],
  templateUrl: './warning.component.html',
  styleUrl: './warning.component.css'
})
export class WarningComponent {
  currentStep: 'feed' | 'nfc' = 'feed';

  constructor(private spinnerService: SpinnerService) {
    console.log('WarningComponent initialized, currentStep:', this.currentStep);
  }

  showNfcComponent() {
    console.log('Switching to NFC component');
    // Mostrar spinner durante la transición (opcional)
    this.spinnerService.show();
    
    // Simular carga rápida de componente
    setTimeout(() => {
      this.currentStep = 'nfc';
      this.spinnerService.hide();
    }, 500); // Reducido a 500ms
  }

  resetToFeed() {
    console.log('Switching back to Feed component');
    // Mostrar spinner durante la transición (opcional)
    this.spinnerService.show();
    
    // Simular carga rápida de componente
    setTimeout(() => {
      this.currentStep = 'feed';
      this.spinnerService.hide();
    }, 500); // Reducido a 500ms
  }
}
