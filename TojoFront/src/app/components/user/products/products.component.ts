import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StartComponent } from '../start/start.component';
import { ProductsInfoComponent, Product } from '../../../shared/products-info/products-info.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, StartComponent, ProductsInfoComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  // Propiedades de filtrado
  searchTerm: string = '';
  selectedCategory: string = '';
  stockFilter: string = '';
  filteredProducts: Product[] = [];

  // Propiedades del modal
  selectedProduct: Product | null = null;
  isModalVisible: boolean = false;

  products: Product[] = [
    {
      id: 1,
      name: 'Cyberpunk Jacket',
      description: 'Chaqueta futurista con luces LED integradas. Fabricada con fibras inteligentes que se adaptan a la temperatura corporal y cuenta con un sistema de iluminación LED personalizable a través de una app móvil.',
      price: 299.99,
      category: 'clothing',
      stock: 15,
      stockTotal: 15,
      stockExhibido: 5,
      image: 'https://via.placeholder.com/300x200/ff6b35/ffffff?text=Cyberpunk+Jacket'
    },
    {
      id: 2,
      name: 'Neural Headset',
      description: 'Auriculares con tecnología de realidad aumentada avanzada. Incluye cancelación de ruido adaptativa, seguimiento ocular y conectividad neural para experiencias inmersivas completamente nuevas.',
      price: 599.99,
      category: 'electronics',
      stock: 8,
      stockTotal: 8,
      stockExhibido: 3,
      image: 'https://via.placeholder.com/300x200/8b5cf6/ffffff?text=Neural+Headset'
    },
    {
      id: 3,
      name: 'Holo Gloves',
      description: 'Guantes con interfaz holográfica táctil. Permiten manipular objetos virtuales con retroalimentación háptica ultra-realista y conectividad inalámbrica de última generación.',
      price: 199.99,
      category: 'accessories',
      stock: 12,
      stockTotal: 12,
      stockExhibido: 4,
      image: 'https://via.placeholder.com/300x200/ff6b35/ffffff?text=Holo+Gloves'
    },
    {
      id: 4,
      name: 'Neon Sneakers',
      description: 'Zapatillas con suela luminosa y tecnología de amortiguación inteligente. La suela LED se sincroniza con el ritmo de tus pasos y cambia de color según tu estado de ánimo.',
      price: 149.99,
      category: 'clothing',
      stock: 3,
      stockTotal: 3,
      stockExhibido: 2,
      image: 'https://via.placeholder.com/300x200/8b5cf6/ffffff?text=Neon+Sneakers'
    },
    {
      id: 5,
      name: 'Data Visor',
      description: 'Visor con pantalla de datos en tiempo real y análisis predictivo. Muestra información contextual del entorno, métricas biométricas y notificaciones inteligentes.',
      price: 799.99,
      category: 'electronics',
      stock: 5,
      stockTotal: 5,
      stockExhibido: 1,
      image: 'https://via.placeholder.com/300x200/ff6b35/ffffff?text=Data+Visor'
    },
    {
      id: 6,
      name: 'Tech Backpack',
      description: 'Mochila con cargador solar integrado y compartimentos inteligentes. Incluye puertos USB-C, sistema anti-robo y capacidad de carga inalámbrica para dispositivos móviles.',
      price: 89.99,
      category: 'accessories',
      stock: 20,
      stockTotal: 20,
      stockExhibido: 8,
      image: 'https://via.placeholder.com/300x200/8b5cf6/ffffff?text=Tech+Backpack'
    }
  ];

  ngOnInit() {
    this.filteredProducts = [...this.products];
  }

  filterProducts() {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           (product.description?.toLowerCase().includes(this.searchTerm.toLowerCase()) || false);
      
      const matchesCategory = !this.selectedCategory || product.category === this.selectedCategory;
      
      const matchesStock = !this.stockFilter || 
                          (this.stockFilter === 'available' && (product.stock || 0) > 5) ||
                          (this.stockFilter === 'low' && (product.stock || 0) <= 5);
      
      return matchesSearch && matchesCategory && matchesStock;
    });
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.stockFilter = '';
    this.filteredProducts = [...this.products];
  }

  toggleFavorite(product: Product) {
    product.isFavorite = !(product.isFavorite || false);
    console.log(`${product.name} ${product.isFavorite ? 'agregado a' : 'removido de'} favoritos`);
  }

  addToCart(product: Product) {
    console.log(`${product.name} agregado al carrito`);
  }

  // Métodos del modal
  openProductModal(product: Product) {
    this.selectedProduct = product;
    this.isModalVisible = true;
  }

  closeProductModal() {
    this.isModalVisible = false;
    this.selectedProduct = null;
  }
}
