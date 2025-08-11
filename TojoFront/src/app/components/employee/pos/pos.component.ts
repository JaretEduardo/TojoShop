import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService, ProductDto } from '../../../services/products.service';
import { debounceTime, distinctUntilChanged, Subject, switchMap, of } from 'rxjs';
import { PosPaymentModalComponent } from './pos-payment-modal.component';
import { PosConfirmModalComponent } from './pos-confirm-modal.component';

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
  imports: [CommonModule, FormsModule, PosPaymentModalComponent, PosConfirmModalComponent],
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.css'
})
export class PosComponent {
  productCode: string = '';
  cartItems: CartItem[] = [];
  lastAddedItem: CartItem | null = null;
  suggestions: ProductDto[] = [];
  showSuggestions = false;
  private input$ = new Subject<string>();

  // Modal state
  showPaymentModal = false;
  paymentMode: 'cash' | 'card' = 'cash';
  paymentError: string | null = null;
  totalToPay = 0;

  // Confirm cancel modal state
  showCancelConfirm = false;

  constructor(private productsService: ProductsService) {}

  ngOnInit() {
    this.input$
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap(term => term.trim() ? this.productsService.search(term.trim()) : of([]))
      )
      .subscribe((res: ProductDto[]) => {
        this.suggestions = res.slice(0, 5);
        this.showSuggestions = this.suggestions.length > 0;
      });
  }

  addProduct(): void {
    if (this.productCode.trim()) {
      this.searchProduct();
    }
  }

  searchProduct(): void {
    const term = this.productCode.trim();
    if (!term) return;

    this.productsService.search(term).subscribe({
      next: (results: ProductDto[]) => {
        if (!results || results.length === 0) {
          alert('Producto no encontrado');
          return;
        }

        // Si escriben un número, intenta coincidir por id exacto
        const asNumber = Number(term);
        let picked: ProductDto | undefined;
        if (!isNaN(asNumber)) {
          picked = results.find(r => r.id === asNumber);
        }
        // Si no, intenta por nombre exacto (case-insensitive)
        if (!picked) {
          picked = results.find(r => r.name.toLowerCase() === term.toLowerCase());
        }
        // Como fallback, toma el primero
        if (!picked) picked = results[0];

        this.addDtoToCart(picked);
        this.productCode = '';
  this.clearSuggestions();
      },
      error: () => alert('Error al buscar el producto'),
    });
  }

  private addDtoToCart(product: ProductDto): void {
    const existingItem = this.cartItems.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity++;
      this.lastAddedItem = existingItem;
    } else {
      const newItem: CartItem = {
        id: product.id,
        code: String(product.id),
        name: product.name,
        price: Number(product.price),
        quantity: 1,
      };
      this.cartItems.push(newItem);
      this.lastAddedItem = newItem;
    }
  }

  onCodeInput(): void {
    const term = this.productCode ?? '';
    if (!term.trim()) {
      this.clearSuggestions();
      return;
    }
    this.input$.next(term);
  }

  selectSuggestion(p: ProductDto): void {
    this.addDtoToCart(p);
    this.productCode = '';
    this.clearSuggestions();
  }

  onBlurSuggestions(): void {
    // Give time for mousedown selection to fire before hiding
    setTimeout(() => this.clearSuggestions(), 150);
  }

  private clearSuggestions() {
    this.suggestions = [];
    this.showSuggestions = false;
  }

  repeatLast(): void {
    if (this.lastAddedItem) {
      const existingItem = this.cartItems.find(i => i.id === this.lastAddedItem!.id);
      if (existingItem) {
        existingItem.quantity++;
        this.lastAddedItem = existingItem;
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
      this.showCancelConfirm = true;
    }
  }

  onCancelConfirmClose() {
    this.showCancelConfirm = false;
  }

  onCancelConfirmAccept() {
    this.cartItems = [];
    this.lastAddedItem = null;
    this.productCode = '';
    this.showCancelConfirm = false;
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
      this.paymentError = 'No hay productos en la venta';
      this.paymentMode = 'cash';
      this.totalToPay = 0;
      this.showPaymentModal = true;
      return;
    }
    
    this.paymentMode = 'cash';
    this.totalToPay = this.getFinalTotal();
    this.paymentError = null;
    this.showPaymentModal = true;
  }

  processCardPayment(): void {
    if (this.cartItems.length === 0) {
      this.paymentError = 'No hay productos en la venta';
      this.paymentMode = 'card';
      this.totalToPay = 0;
      this.showPaymentModal = true;
      return;
    }
    
    this.paymentMode = 'card';
    this.totalToPay = this.getFinalTotal();
    this.paymentError = null;
    this.showPaymentModal = true;
  }

  // Modal handlers
  onClosePaymentModal() {
    this.showPaymentModal = false;
  }

  onConfirmCash(received: number) {
    // Ejecutar descuento de stock
    const items = this.cartItems.map(i => ({ product_id: i.id, quantity: i.quantity }));
    this.productsService.decrementStock(items).subscribe({
      next: () => {
        this.showPaymentModal = false;
        this.completeSale();
      },
      error: (err) => {
        this.paymentError = err?.error?.message || 'Error al actualizar stock';
      }
    });
  }

  onConfirmCard() {
    const items = this.cartItems.map(i => ({ product_id: i.id, quantity: i.quantity }));
    this.productsService.decrementStock(items).subscribe({
      next: () => {
        this.showPaymentModal = false;
        this.completeSale();
      },
      error: (err) => {
        this.paymentError = err?.error?.message || 'Error al actualizar stock';
      }
    });
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
