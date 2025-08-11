import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StartComponent } from '../start/start.component';
import { ProductsService, ProductDto } from '../../../services/products.service';

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
export class FavoritesComponent implements OnInit {
  favoriteItems: FavoriteItem[] = [];

  constructor(private router: Router, private productsService: ProductsService) { }

  ngOnInit(): void {
    this.loadFavorites();
  }

  private loadFavorites() {
    this.productsService.favoritesList().subscribe((items: ProductDto[]) => {
      this.favoriteItems = items.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description ?? '',
        price: Number(p.price),
        image: 'https://via.placeholder.com/300x200/ff6b35/ffffff?text=' + encodeURIComponent(p.name),
      }));
    });
  }

  removeFromFavorites(item: FavoriteItem) {
    this.productsService.removeFavorite(item.id).subscribe(() => {
      this.favoriteItems = this.favoriteItems.filter(f => f.id !== item.id);
    });
  }

  addToCart(item: FavoriteItem) {
    this.productsService.addToCart(item.id, 1).subscribe();
  }

  goToProducts() {
    this.router.navigate(['/home']);
  }
}
