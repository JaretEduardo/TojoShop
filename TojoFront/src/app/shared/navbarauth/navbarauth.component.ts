import { Component } from '@angular/core';

@Component({
  selector: 'app-navbarauth',
  standalone: true,
  imports: [],
  templateUrl: './navbarauth.component.html',
  styleUrl: './navbarauth.component.css'
})
export class NavbarAuthComponent {
  userName: string | null = null;

  constructor() {
    try {
      this.userName = localStorage.getItem('user_name');
    } catch {
      this.userName = null;
    }
  }
}
