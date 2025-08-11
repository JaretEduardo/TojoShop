import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StartComponent } from '../start/start.component';
import { ProductsService } from '../../../services/products.service';

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
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];

  constructor(private router: Router, private productsService: ProductsService) { }

  ngOnInit(): void {
    this.loadCart();
  }

  private loadCart() {
    this.productsService.cartList().subscribe(items => {
      this.cartItems = items.map((i: any) => ({
        id: i.product_id ?? i.id,
        name: i.name,
        description: i.description ?? '',
        price: Number(i.price),
        image: 'https://via.placeholder.com/80x80/8b5cf6/ffffff?text=' + encodeURIComponent(i.name),
        quantity: i.quantity ?? 1,
      }));
    });
  }

  increaseQuantity(item: CartItem) {
    const next = item.quantity + 1;
    this.productsService.updateCart(item.id, next).subscribe({
      next: () => item.quantity = next
    });
  }

  decreaseQuantity(item: CartItem) {
    if (item.quantity <= 1) return;
    const next = item.quantity - 1;
    this.productsService.updateCart(item.id, next).subscribe({
      next: () => item.quantity = next
    });
  }

  removeFromCart(item: CartItem) {
    this.productsService.removeFromCart(item.id).subscribe(() => {
      this.cartItems = this.cartItems.filter(cartItem => cartItem.id !== item.id);
    });
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
    this.productsService.checkout().subscribe({
      next: () => {
        // Vaciar UI del carrito y navegar a órdenes
        this.cartItems = [];
        this.router.navigate(['/orders']);
      },
    });
  }

  goToProducts() {
    this.router.navigate(['/home']);
  }
}
