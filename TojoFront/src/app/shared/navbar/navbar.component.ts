import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsInfoComponent, Product } from '../products-info/products-info.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, ProductsInfoComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  searchTerm: string = '';
  searchResults: Product[] = [];
  showResults: boolean = false;
  showModal: boolean = false;
  selectedProduct: Product | null = null;

  // Productos de ejemplo (esto normalmente vendría de un servicio)
  mockProducts: Product[] = [
    {
      id: 1,
      name: 'iPhone 15 Pro',
      price: 29999,
      description: 'El iPhone más avanzado con chip A17 Pro y cámara de 48MP',
      stockTotal: 15,
      stockExhibido: 3,
      category: 'Electrónicos'
    },
    {
      id: 2,
      name: 'Samsung Galaxy S24',
      price: 24999,
      description: 'Smartphone Android de última generación con AI integrada',
      stockTotal: 8,
      stockExhibido: 2,
      category: 'Electrónicos'
    },
    {
      id: 3,
      name: 'MacBook Pro M3',
      price: 54999,
      description: 'Laptop profesional con chip M3 y pantalla Liquid Retina',
      stockTotal: 5,
      stockExhibido: 1,
      category: 'Computadoras'
    },
    {
      id: 4,
      name: 'AirPods Pro 2',
      price: 6999,
      description: 'Audífonos inalámbricos con cancelación de ruido activa',
      stockTotal: 0,
      stockExhibido: 0,
      category: 'Audio'
    },
    {
      id: 5,
      name: 'iPad Air',
      price: 19999,
      description: 'Tablet ligera y potente para creativos y profesionales',
      stockTotal: 12,
      stockExhibido: 4,
      category: 'Tablets'
    },
    {
      id: 6,
      name: 'Nintendo Switch OLED',
      price: 8999,
      description: 'Consola híbrida con pantalla OLED de 7 pulgadas',
      stockTotal: 3,
      stockExhibido: 1,
      category: 'Gaming'
    },
    {
      id: 7,
      name: 'Sony WH-1000XM5',
      price: 7999,
      description: 'Audífonos over-ear con la mejor cancelación de ruido',
      stockTotal: 20,
      stockExhibido: 5,
      category: 'Audio'
    },
    {
      id: 8,
      name: 'Apple Watch Series 9',
      price: 12999,
      description: 'Smartwatch avanzado con seguimiento de salud integral',
      stockTotal: 18,
      stockExhibido: 6,
      category: 'Wearables'
    }
  ];

  // Buscar productos
  onSearch() {
    if (this.searchTerm.trim().length < 2) {
      this.searchResults = [];
      this.showResults = false;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.searchResults = this.mockProducts.filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.description?.toLowerCase().includes(term) ||
      product.category?.toLowerCase().includes(term)
    ).slice(0, 5); // Mostrar máximo 5 resultados

    this.showResults = this.searchResults.length > 0;
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
