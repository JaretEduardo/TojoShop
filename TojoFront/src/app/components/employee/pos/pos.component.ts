import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CartItem {
  id: number;
  code: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  price: number;
  stock: number;
}

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.css'
})
export class PosComponent {
  productCode: string = '';
  cartItems: CartItem[] = [];
  lastAddedItem: CartItem | null = null;

  // Mock products database
  products: Product[] = [
    { id: 1, code: '001', name: 'Coca Cola 600ml', price: 25.50, stock: 50 },
    { id: 2, code: '002', name: 'Doritos Nacho', price: 35.00, stock: 30 },
    { id: 3, code: '003', name: 'Pan Bimbo', price: 28.75, stock: 20 },
    { id: 4, code: '004', name: 'Leche Lala 1L', price: 22.00, stock: 15 },
    { id: 5, code: '005', name: 'Cerveza Corona', price: 18.50, stock: 25 },
    { id: 6, code: '006', name: 'Agua Bonafont 1.5L', price: 15.00, stock: 40 },
    { id: 7, code: '007', name: 'Galletas Oreo', price: 32.00, stock: 35 },
    { id: 8, code: '008', name: 'Jabón Zest', price: 12.75, stock: 60 }
  ];

  addProduct(): void {
    if (this.productCode.trim()) {
      this.searchProduct();
    }
  }

  searchProduct(): void {
    const product = this.products.find(p => 
      p.code.toLowerCase() === this.productCode.toLowerCase()
    );

    if (product) {
      this.addToCart(product);
      this.productCode = '';
    } else {
      alert('Producto no encontrado');
    }
  }

  addToCart(product: Product): void {
    const existingItem = this.cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity++;
    } else {
      const newItem: CartItem = {
        id: product.id,
        code: product.code,
        name: product.name,
        price: product.price,
        quantity: 1
      };
      this.cartItems.push(newItem);
      this.lastAddedItem = newItem;
    }
  }

  repeatLast(): void {
    if (this.lastAddedItem) {
      const product = this.products.find(p => p.id === this.lastAddedItem!.id);
      if (product) {
        this.addToCart(product);
      }
    }
  }

  removeLast(): void {
    if (this.cartItems.length > 0) {
      const lastItem = this.cartItems[this.cartItems.length - 1];
      if (lastItem.quantity > 1) {
        lastItem.quantity--;
      } else {
        this.cartItems.pop();
      }
    }
  }

  cancelAll(): void {
    if (this.cartItems.length > 0) {
      const confirm = window.confirm('¿Estás seguro de cancelar toda la venta?');
      if (confirm) {
        this.cartItems = [];
        this.lastAddedItem = null;
        this.productCode = '';
      }
    }
  }

  increaseQuantity(index: number): void {
    this.cartItems[index].quantity++;
  }

  decreaseQuantity(index: number): void {
    if (this.cartItems[index].quantity > 1) {
      this.cartItems[index].quantity--;
    }
  }

  removeItem(index: number): void {
    this.cartItems.splice(index, 1);
  }

  getTotalUnits(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  getTotalAmount(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getUniqueItems(): number {
    return this.cartItems.length;
  }

  getTax(): number {
    return parseFloat((this.getTotalAmount() * 0.16).toFixed(2));
  }

  getFinalTotal(): number {
    return parseFloat((this.getTotalAmount() + this.getTax()).toFixed(2));
  }

  processCashPayment(): void {
    if (this.cartItems.length === 0) {
      alert('No hay productos en la venta');
      return;
    }
    
    const total = this.getFinalTotal();
    const cash = prompt(`Total a pagar: $${total}\nIngrese el monto recibido:`);
    
    if (cash) {
      const cashAmount = parseFloat(cash);
      if (cashAmount >= total) {
        const change = cashAmount - total;
        alert(`Pago procesado!\nCambio: $${change.toFixed(2)}`);
        this.completeSale();
      } else {
        alert('El monto ingresado es insuficiente');
      }
    }
  }

  processCardPayment(): void {
    if (this.cartItems.length === 0) {
      alert('No hay productos en la venta');
      return;
    }
    
    const total = this.getFinalTotal();
    const confirm = window.confirm(`¿Procesar pago con tarjeta por $${total}?`);
    
    if (confirm) {
      alert('Pago con tarjeta procesado exitosamente!');
      this.completeSale();
    }
  }

  completeSale(): void {
    // Aquí se podría guardar la venta en base de datos
    console.log('Venta completada:', {
      items: this.cartItems,
      subtotal: this.getTotalAmount(),
      tax: this.getTax(),
      total: this.getFinalTotal(),
      timestamp: new Date()
    });
    
    // Limpiar el carrito
    this.cartItems = [];
    this.lastAddedItem = null;
    this.productCode = '';
  }
}
