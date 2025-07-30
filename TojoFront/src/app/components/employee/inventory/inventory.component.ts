import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Product {
  id: string;
  name: string;
  category: string;
  stockTotal: number;
  stockGondola: number;
  stockAlmacen: number;
  lastUpdated?: string;
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export class InventoryComponent {
  activeCategory: string = 'all';

  products: Product[] = [
    {
      id: 'BEB001',
      name: 'Coca Cola 350ml',
      category: 'bebidas',
      stockTotal: 48,
      stockGondola: 24,
      stockAlmacen: 24
    },
    {
      id: 'BEB002',
      name: 'Agua Mineral 500ml',
      category: 'bebidas',
      stockTotal: 36,
      stockGondola: 18,
      stockAlmacen: 18
    },
    {
      id: 'SNK001',
      name: 'Papas Fritas Original',
      category: 'snacks',
      stockTotal: 25,
      stockGondola: 15,
      stockAlmacen: 10
    },
    {
      id: 'SNK002',
      name: 'Palomitas de Maíz',
      category: 'snacks',
      stockTotal: 20,
      stockGondola: 12,
      stockAlmacen: 8
    },
    {
      id: 'DUL001',
      name: 'Chocolate con Leche',
      category: 'dulces',
      stockTotal: 32,
      stockGondola: 20,
      stockAlmacen: 12
    },
    {
      id: 'DUL002',
      name: 'Caramelos Surtidos',
      category: 'dulces',
      stockTotal: 45,
      stockGondola: 25,
      stockAlmacen: 20
    },
    {
      id: 'LAC001',
      name: 'Leche Entera 1L',
      category: 'lacteos',
      stockTotal: 28,
      stockGondola: 16,
      stockAlmacen: 12
    },
    {
      id: 'LAC002',
      name: 'Yogurt Natural 200g',
      category: 'lacteos',
      stockTotal: 40,
      stockGondola: 24,
      stockAlmacen: 16
    },
    {
      id: 'BEB003',
      name: 'Jugo de Naranja 1L',
      category: 'bebidas',
      stockTotal: 22,
      stockGondola: 14,
      stockAlmacen: 8
    },
    {
      id: 'SNK003',
      name: 'Galletas Saladas',
      category: 'snacks',
      stockTotal: 30,
      stockGondola: 18,
      stockAlmacen: 12
    },
    {
      id: 'DUL003',
      name: 'Gomitas de Frutas',
      category: 'dulces',
      stockTotal: 35,
      stockGondola: 22,
      stockAlmacen: 13
    },
    {
      id: 'LAC003',
      name: 'Queso Crema 200g',
      category: 'lacteos',
      stockTotal: 18,
      stockGondola: 10,
      stockAlmacen: 8
    },
    {
      id: 'BEB004',
      name: 'Energizante 250ml',
      category: 'bebidas',
      stockTotal: 24,
      stockGondola: 16,
      stockAlmacen: 8
    },
    {
      id: 'SNK004',
      name: 'Nueces Mixtas',
      category: 'snacks',
      stockTotal: 15,
      stockGondola: 9,
      stockAlmacen: 6
    },
    {
      id: 'DUL004',
      name: 'Barra de Cereal',
      category: 'dulces',
      stockTotal: 40,
      stockGondola: 25,
      stockAlmacen: 15
    },
    {
      id: 'LAC004',
      name: 'Mantequilla 250g',
      category: 'lacteos',
      stockTotal: 20,
      stockGondola: 12,
      stockAlmacen: 8
    },
    {
      id: 'BEB005',
      name: 'Té Helado 500ml',
      category: 'bebidas',
      stockTotal: 26,
      stockGondola: 16,
      stockAlmacen: 10
    },
    {
      id: 'SNK005',
      name: 'Pretzels Salados',
      category: 'snacks',
      stockTotal: 22,
      stockGondola: 14,
      stockAlmacen: 8
    }
  ];

  setActiveCategory(category: string): void {
    this.activeCategory = category;
  }

  getFilteredProducts(): Product[] {
    if (this.activeCategory === 'all') {
      return this.products;
    }
    return this.products.filter(product => product.category === this.activeCategory);
  }

  updateStock(productId: string): void {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      // Aquí iría la lógica para actualizar el stock
      console.log(`Actualizando stock para producto: ${product.name} (${productId})`);
      
      // Simular actualización
      product.lastUpdated = new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      // Aquí podrías hacer una llamada a la API para actualizar el stock
      // this.inventoryService.updateStock(productId).subscribe(...)
    }
  }
}
