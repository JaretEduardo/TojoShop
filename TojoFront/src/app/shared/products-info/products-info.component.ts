import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';

export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  image?: string;
  stockTotal: number;
  category?: string;
  stock?: number;
  isFavorite?: boolean;
}

@Component({
  selector: 'app-products-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products-info.component.html',
  styleUrl: './products-info.component.css'
})
export class ProductsInfoComponent implements OnInit, OnDestroy {
  @Input() isVisible: boolean = false;
  @Input() product: Product | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() buyProduct = new EventEmitter<Product>();
  @Output() addToCart = new EventEmitter<Product>();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Prevenir scroll del body cuando el modal está activo (solo en el navegador)
    if (this.isVisible && isPlatformBrowser(this.platformId)) {
      this.document.body.style.overflow = 'hidden';
    }
  }

  ngOnDestroy() {
    // Restaurar scroll del body al destruir el componente (solo en el navegador)
    if (isPlatformBrowser(this.platformId)) {
      this.document.body.style.overflow = 'auto';
    }
  }

  // Cerrar modal
  onCloseModal() {
    if (isPlatformBrowser(this.platformId)) {
      this.document.body.style.overflow = 'auto';
    }
    this.closeModal.emit();
  }

  // Cerrar modal al hacer clic en el overlay
  onOverlayClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onCloseModal();
    }
  }

  // Comprar producto
  onBuyProduct() {
    if (this.product) {
      this.buyProduct.emit(this.product);
    }
  }

  // Agregar al carrito
  onAddToCart() {
    if (this.product) {
      this.addToCart.emit(this.product);
    }
  }

  // Verificar si hay stock disponible
  hasStock(): boolean {
    return this.product ? this.product.stockTotal > 0 : false;
  }

  // Obtener estado del stock
  getStockStatus(): string {
    if (!this.product) return 'Sin información';
    
    if (this.product.stockTotal === 0) return 'Sin stock';
    if (this.product.stockTotal <= 5) return 'Stock bajo';
    return 'Disponible';
  }

  // Obtener clase CSS según el estado del stock
  getStockStatusClass(): string {
    if (!this.product) return 'stock-unknown';
    
    if (this.product.stockTotal === 0) return 'stock-out';
    if (this.product.stockTotal <= 5) return 'stock-low';
    return 'stock-available';
  }

  // Formatear precio
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  }
}
