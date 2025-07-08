import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StartComponent } from '../start/start.component';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  isFavorite?: boolean;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, StartComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {
  products: Product[] = [
    {
      id: 1,
      name: 'Cyberpunk Jacket',
      description: 'Chaqueta futurista con luces LED integradas',
      price: 299.99,
      image: 'https://via.placeholder.com/300x200/ff6b35/ffffff?text=Cyberpunk+Jacket'
    },
    {
      id: 2,
      name: 'Neural Headset',
      description: 'Auriculares con tecnología de realidad aumentada',
      price: 599.99,
      image: 'https://via.placeholder.com/300x200/8b5cf6/ffffff?text=Neural+Headset'
    },
    {
      id: 3,
      name: 'Holo Gloves',
      description: 'Guantes con interfaz holográfica',
      price: 199.99,
      image: 'https://via.placeholder.com/300x200/ff6b35/ffffff?text=Holo+Gloves'
    },
    {
      id: 4,
      name: 'Neon Sneakers',
      description: 'Zapatillas con suela luminosa',
      price: 149.99,
      image: 'https://via.placeholder.com/300x200/8b5cf6/ffffff?text=Neon+Sneakers'
    },
    {
      id: 5,
      name: 'Data Visor',
      description: 'Visor con pantalla de datos en tiempo real',
      price: 799.99,
      image: 'https://via.placeholder.com/300x200/ff6b35/ffffff?text=Data+Visor'
    },
    {
      id: 6,
      name: 'Tech Backpack',
      description: 'Mochila con cargador solar integrado',
      price: 89.99,
      image: 'https://via.placeholder.com/300x200/8b5cf6/ffffff?text=Tech+Backpack'
    }
  ];

  toggleFavorite(product: Product) {
    product.isFavorite = !product.isFavorite;
    console.log(`${product.name} ${product.isFavorite ? 'agregado a' : 'removido de'} favoritos`);
  }

  addToCart(product: Product) {
    console.log(`${product.name} agregado al carrito`);
  }
}
