import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {}
  
  // Register
  Register(payload: { name: string; email: string; password: string; password_confirmation: string; }): Observable<ApiResponse> {
    const url = `${environment.apiUrl}${environment.endpoints.register}`;
    return this.http.post<ApiResponse>(url, payload);
  }

  // Login
  Login(): void {}

  // Logout
  Logout(): void {}
}
