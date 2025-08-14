import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsInfoComponent, Product } from '../products-info/products-info.component';
import { ProductsService, ProductDto } from '../../services/products.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, HttpClientModule, ProductsInfoComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  searchTerm: string = '';
  searchResults: Product[] = [];
  showResults: boolean = false;
  showModal: boolean = false;
  selectedProduct: Product | null = null;
  private loading = false;
  private searchTimer?: any;

  constructor(private products: ProductsService) {}

  // Buscar productos
  onSearch() {
    // debounce to avoid firing too many requests while typing fast
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      if (this.searchTerm.trim().length < 2) {
        this.searchResults = [];
        this.showResults = false;
        return;
      }

      const term = this.searchTerm.trim();
      if (this.loading) return;
      this.loading = true;
      this.products.search(term).subscribe({
        next: (data: ProductDto[]) => {
          // Map backend DTO to UI Product type
          this.searchResults = data.map(d => ({
            id: d.id,
            name: d.name,
            price: Number(d.price),
            description: d.description,
            stockTotal: d.stock,
          } as Product));
          this.showResults = true;
        },
        error: () => {
          this.searchResults = [];
          this.showResults = true;
        },
        complete: () => {
          this.loading = false;
        }
      });
    }, 200);
  }

  // Seleccionar producto del dropdown
  selectProduct(product: Product) {
    this.selectedProduct = product;
    this.showModal = true;
    this.showResults = false;
    this.searchTerm = '';
  }

  // Cerrar modal
  closeModal() {
    this.showModal = false;
    this.selectedProduct = null;
  }

  // Manejar compra de producto
  handleBuyProduct(product: Product) {
    console.log('Comprando producto:', product);
    // Aquí implementarías la lógica de compra
    alert(`Comprando: ${product.name}`);
    this.closeModal();
  }

  // Manejar agregar al carrito
  handleAddToCart(product: Product) {
    console.log('Agregando al carrito:', product);
    // Aquí implementarías la lógica para agregar al carrito
    alert(`${product.name} agregado al carrito`);
    this.closeModal();
  }

  // Ocultar resultados al hacer clic fuera
  hideResults() {
    setTimeout(() => {
      this.showResults = false;
    }, 200);
  }

  // Limpiar búsqueda
  clearSearch() {
    this.searchTerm = '';
    this.searchResults = [];
    this.showResults = false;
  }
}
