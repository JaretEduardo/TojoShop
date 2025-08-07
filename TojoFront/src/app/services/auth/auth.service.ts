import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../interfaces/api-response.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  // Login
  Login(): void { }

  // Logout
  Logout(): void { }

  // Register
  Register(): void { }

  // Get User
  GetUser(): void { }

  // Update User
  UpdateUser(): void { }

  // Delete User
  DeleteUser(): void { }
}
