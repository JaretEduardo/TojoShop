import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {}
  
  // Register
  Register(payload: { name: string; email: string; password: string; password_confirmation: string; role?: 'usuario' | 'empleado' | 'encargado'; }): Observable<ApiResponse> {
    const url = `${environment.apiUrl}${environment.endpoints.register}`;
    return this.http.post<ApiResponse>(url, payload);
  }

  // Login
  Login(payload: { email: string; password: string }): Observable<ApiResponse> {
    const url = `${environment.apiUrl}${environment.endpoints.login}`;
    return this.http.post<ApiResponse>(url, payload).pipe(
      tap((res: any) => {
        if (res && typeof res.access_token === 'string') {
          try { localStorage.setItem('access_token', res.access_token); } catch {}
        }
        if (res && typeof res.name === 'string') {
          try { localStorage.setItem('user_name', res.name); } catch {}
        }
        if (res && typeof res.role === 'string') {
          try { localStorage.setItem('user_role', res.role); } catch {}
        }
      })
    );
  }

  // Logout
  Logout(): Observable<ApiResponse> {
    const url = `${environment.apiUrl}${environment.endpoints.logout}`;
    const token = localStorage.getItem('access_token');
    const headers = token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : undefined;
    return this.http.post<ApiResponse>(url, {}, { headers }).pipe(
      tap(() => {
        try { localStorage.removeItem('access_token'); } catch {}
  try { localStorage.removeItem('user_role'); } catch {}
  try { localStorage.removeItem('user_name'); } catch {}
      })
    );
  }
}
