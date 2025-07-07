import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  private loadingCounter = 0;

  show(): void {
    this.loadingCounter++;
    this.isLoadingSubject.next(true);
  }

  hide(): void {
    this.loadingCounter--;
    if (this.loadingCounter <= 0) {
      this.loadingCounter = 0;
      this.isLoadingSubject.next(false);
    }
  }

  forceHide(): void {
    this.loadingCounter = 0;
    this.isLoadingSubject.next(false);
  }

  get isLoading(): boolean {
    return this.isLoadingSubject.value;
  }
}
