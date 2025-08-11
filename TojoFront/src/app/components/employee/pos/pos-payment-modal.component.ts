import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pos-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pos-payment-modal.component.html',
  styleUrls: ['./pos-payment-modal.component.css']
})
export class PosPaymentModalComponent {
  @Input() visible = false;
  @Input() mode: 'cash' | 'card' = 'cash';
  @Input() total = 0;
  @Input() errorMessage: string | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() confirmCash = new EventEmitter<number>();
  @Output() confirmCard = new EventEmitter<void>();

  receivedStr = '';

  get received(): number {
    const n = parseFloat(this.receivedStr);
    return isNaN(n) ? 0 : n;
  }

  get change(): number {
    const diff = this.received - this.total;
    return diff > 0 ? parseFloat(diff.toFixed(2)) : 0;
  }

  get canConfirmCash(): boolean {
    return this.received >= this.total && this.total > 0;
  }

  onClose() {
    this.close.emit();
  }

  onConfirm() {
    if (this.mode === 'cash') {
      if (!this.canConfirmCash) return;
      this.confirmCash.emit(this.received);
    } else {
      this.confirmCard.emit();
    }
  }
}
