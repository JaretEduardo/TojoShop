import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StartComponent } from '../start/start.component';

interface CartItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, StartComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {
  cartItems: CartItem[] = [
    {
      id: 1,
      name: 'Cyberpunk Jacket',
      description: 'Chaqueta futurista con luces LED integradas',
      price: 299.99,
      image: 'https://via.placeholder.com/80x80/ff6b35/ffffff?text=Jacket',
      quantity: 1
    },
    {
      id: 2,
      name: 'Neural Headset',
      description: 'Auriculares con tecnología de realidad aumentada',
      price: 599.99,
      image: 'https://via.placeholder.com/80x80/8b5cf6/ffffff?text=Headset',
      quantity: 2
    }
  ];

  constructor(private router: Router) {}

  increaseQuantity(item: CartItem) {
    item.quantity++;
  }

  decreaseQuantity(item: CartItem) {
    if (item.quantity > 1) {
      item.quantity--;
    }
  }

  removeFromCart(item: CartItem) {
    this.cartItems = this.cartItems.filter(cartItem => cartItem.id !== item.id);
  }

  getSubtotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getShipping(): number {
    return this.getSubtotal() > 500 ? 0 : 25;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShipping();
  }

  checkout() {
    console.log('Procediendo al pago...');
  }

  goToProducts() {
    this.router.navigate(['/home']);
  }
}
