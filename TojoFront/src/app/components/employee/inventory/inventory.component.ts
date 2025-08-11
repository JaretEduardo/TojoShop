import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService, ProductDto, CategoryDto } from '../../../services/products.service';

interface InventoryProduct {
  id: number;
  name: string;
  category: string | null; // category name
  stockTotal: number;
  price: number;
  lastUpdated?: string;
  updating?: boolean;
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export class InventoryComponent {
  categories: Array<CategoryDto & { active?: boolean }> = [];
  activeCategory: number | 'all' = 'all';
  loading = false;
  products: InventoryProduct[] = [];

  constructor(private productsService: ProductsService) {}

  ngOnInit() {
    this.fetchCategories();
    this.loadProducts();
  }

  fetchCategories() {
    this.productsService.categories().subscribe({
      next: (cats) => {
        this.categories = cats.map(c => ({ ...c }));
      },
      error: () => {
        this.categories = [];
      }
    });
  }

  setActiveCategory(category: number | 'all'): void {
    this.activeCategory = category;
    this.loadProducts();
  }

  loadProducts(page = 1, per_page = 60) {
    this.loading = true;
    this.productsService.list({ page, per_page, category_id: this.activeCategory === 'all' ? undefined : this.activeCategory }).subscribe({
      next: (res) => {
        const items = res.data as ProductDto[];
        this.products = items.map(p => ({
          id: p.id,
          name: p.name,
          category: p.category?.name ?? null,
          stockTotal: p.stock,
          price: p.price,
        }));
        this.loading = false;
      },
      error: () => {
        this.products = [];
        this.loading = false;
      }
    });
  }

  getFilteredProducts(): InventoryProduct[] {
    // Products already filtered server-side, but keep for safety when 'all'
    if (this.activeCategory === 'all') return this.products;
    return this.products.filter(p => !!p.category);
  }

  updateStock(productId: number): void {
    const idx = this.products.findIndex(p => p.id === productId);
    if (idx === -1) return;
    const product = this.products[idx];
    product.updating = true;
    // Usamos search con el ID para obtener el producto más reciente
    this.productsService.search(String(productId)).subscribe({
      next: (results) => {
        const found = results.find(r => r.id === productId) ?? results[0];
        if (found) {
          this.products[idx] = {
            id: found.id,
            name: found.name,
            category: found.category?.name ?? null,
            stockTotal: found.stock,
            price: found.price,
            lastUpdated: new Date().toLocaleTimeString('es-ES', {
              hour: '2-digit', minute: '2-digit', second: '2-digit'
            })
          };
        }
        product.updating = false;
      },
      error: () => {
        product.updating = false;
      }
    });
  }
}
