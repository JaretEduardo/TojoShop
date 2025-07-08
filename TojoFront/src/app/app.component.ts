import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from './shared/spinner/spinner.component';
import { SpinnerService } from './services/spinner.service';
import { SpinnerGuard } from './shared/spinner/spinner.guard';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SpinnerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'TojoFront';

  constructor(
    public spinnerService: SpinnerService,
    private spinnerGuard: SpinnerGuard
  ) {
    // Inicializar el guard para que escuche los eventos de navegación
  }
}
