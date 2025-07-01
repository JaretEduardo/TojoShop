import { Component } from '@angular/core';
import { NavbarAuthComponent } from '../../shared/navbarauth/navbarauth.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { CategoriesComponent } from '../../components/categories/categories.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarAuthComponent, HeroComponent, CategoriesComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
