import { Injectable } from '@angular/core';
import { CanActivate, Router, NavigationEnd, NavigationStart } from '@angular/router';
import { SpinnerService } from '../../services/spinner.service';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SpinnerGuard implements CanActivate {

  constructor(
    private spinnerService: SpinnerService,
    private router: Router
  ) {
    // Mostrar spinner al inicio de navegación
    this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe(() => {
        this.spinnerService.show();
      });

    // Ocultar spinner al final de la navegación
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        setTimeout(() => {
          this.spinnerService.forceHide();
        }, 300); // Pequeño delay para mejor UX
      });
  }

  canActivate(): boolean {
    // Ya no mostramos el spinner aquí, se maneja en los eventos de navegación
    return true;
  }
}
