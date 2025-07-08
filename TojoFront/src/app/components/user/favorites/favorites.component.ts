import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StartComponent } from '../start/start.component';

interface FavoriteItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, StartComponent],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.css'
})
export class FavoritesComponent {
  favoriteItems: FavoriteItem[] = [
    {
      id: 1,
      name: 'Cyberpunk Jacket',
      description: 'Chaqueta futurista con luces LED integradas',
      price: 299.99,
      image: 'https://via.placeholder.com/300x200/ff6b35/ffffff?text=Cyberpunk+Jacket'
    },
    {
      id: 3,
      name: 'Holo Gloves',
      description: 'Guantes con interfaz holográfica',
      price: 199.99,
      image: 'https://via.placeholder.com/300x200/ff6b35/ffffff?text=Holo+Gloves'
    },
    {
      id: 5,
      name: 'Data Visor',
      description: 'Visor con pantalla de datos en tiempo real',
      price: 799.99,
      image: 'https://via.placeholder.com/300x200/ff6b35/ffffff?text=Data+Visor'
    }
  ];

  constructor(private router: Router) {}

  removeFromFavorites(item: FavoriteItem) {
    this.favoriteItems = this.favoriteItems.filter(favorite => favorite.id !== item.id);
    console.log(`${item.name} removido de favoritos`);
  }

  addToCart(item: FavoriteItem) {
    console.log(`${item.name} agregado al carrito`);
  }

  goToProducts() {
    this.router.navigate(['/home']);
  }
}
