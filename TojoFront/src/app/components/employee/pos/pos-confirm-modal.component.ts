import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pos-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pos-confirm-modal.component.html',
  styleUrls: ['./pos-confirm-modal.component.css']
})
export class PosConfirmModalComponent {
  @Input() visible = false;
  @Input() title = 'Confirmar';
  @Input() message = '¿Deseas continuar?';
  @Input() confirmText = 'Confirmar';
  @Input() cancelText = 'Cancelar';

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  onConfirm() {
    this.confirm.emit();
  }
}
