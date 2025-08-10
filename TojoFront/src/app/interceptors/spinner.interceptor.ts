import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { SpinnerService } from '../services/spinner.service';
import { SKIP_SPINNER } from './http-context-tokens';

@Injectable()
export class SpinnerInterceptor implements HttpInterceptor {
  
  constructor(private spinnerService: SpinnerService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Allow requests to opt-out of the global spinner via HttpContext
    const skip = req.context.get(SKIP_SPINNER);
    if (!skip) {
      this.spinnerService.show();
    }
    
    return next.handle(req).pipe(
      finalize(() => {
        if (!skip) {
          this.spinnerService.hide();
        }
      })
    );
  }
}
