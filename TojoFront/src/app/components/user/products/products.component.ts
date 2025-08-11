import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StartComponent } from '../start/start.component';
import { ProductsInfoComponent, Product } from '../../../shared/products-info/products-info.component';
import { ProductsService, ProductDto, CategoryDto, Paginated } from '../../../services/products.service';
// no debounce; we will fetch on every keystroke with spinner suppressed

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
  categories: CategoryDto[] = [];
  currentPage = 1;
  lastPage = 1;
  total = 0;
  pageInput: number | null = null;

  // Propiedades del modal
  selectedProduct: Product | null = null;
  isModalVisible: boolean = false;

  products: Product[] = [];
  // removed Subject to trigger requests immediately

  constructor(private productsService: ProductsService) {}

  ngOnInit() {
    this.loadCategories();
    // debounce search changes
  // initial load with spinner
    this.fetchProducts(this.currentPage, { skipSpinner: false });
  }

  filterProducts() {
    this.currentPage = 1;
  // fetch on every keystroke; suppress spinner for typing
  this.fetchProducts(this.currentPage, { skipSpinner: true });
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.stockFilter = '';
    this.currentPage = 1;
    this.fetchProducts();
  }

  toggleFavorite(product: Product) {
    const currentlyFav = !!product.isFavorite;
    product.isFavorite = !currentlyFav;
    if (product.isFavorite) {
      // persist add
      this.productsService.addFavorite(product.id).subscribe({
        error: () => { product.isFavorite = currentlyFav; }
      });
    } else {
      // persist remove
      this.productsService.removeFavorite(product.id).subscribe({
        error: () => { product.isFavorite = currentlyFav; }
      });
    }
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

  // Backend integration
  private fetchProducts(page: number = this.currentPage, options?: { skipSpinner?: boolean }) {
    this.productsService.list({
      page,
      per_page: 12,
      q: this.searchTerm,
      category_id: this.selectedCategory ? Number(this.selectedCategory) : ''
    }, { skipSpinner: options?.skipSpinner }).subscribe((res: Paginated<ProductDto>) => {
      // map DTOs to UI Product
      this.products = res.data.map(d => ({
        id: d.id,
        name: d.name,
        description: d.description,
        price: Number(d.price),
        stockTotal: d.stock,
        image: 'https://via.placeholder.com/300x200/8b5cf6/ffffff?text=' + encodeURIComponent(d.name),
        category: d.category?.name,
        // If you want to pre-mark favorites, fetch list and mark accordingly (future enhancement)
      }));
      this.filteredProducts = [...this.products];
      this.currentPage = res.meta.current_page;
      this.lastPage = res.meta.last_page;
      this.total = res.meta.total;
    });
  }

  private loadCategories() {
    this.productsService.categories().subscribe(data => {
      this.categories = data;
    });
  }

  // Pagination controls
  goToPage(page: number) {
    if (page < 1 || page > this.lastPage) return;
    this.currentPage = page;
  this.fetchProducts(this.currentPage, { skipSpinner: false });
  }

  getPages(): (number | '...')[] {
    const pages: (number | '...')[] = [];
    const total = this.lastPage;
    const current = this.currentPage;
    const windowSize = 1; // neighbors on each side

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    let start = Math.max(2, current - windowSize);
    let end = Math.min(total - 1, current + windowSize);

    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push('...');

    pages.push(total);
    return pages;
  }

  goToPageInput() {
    if (this.pageInput == null) return;
    const p = Math.max(1, Math.min(this.lastPage, Math.floor(this.pageInput)));
    this.pageInput = null;
    this.goToPage(p);
  }
}
