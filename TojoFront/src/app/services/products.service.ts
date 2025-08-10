import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpContext, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environment';
import { SKIP_SPINNER } from '../interceptors/http-context-tokens';

export interface ProductDto {
    id: number;
    name: string;
    price: number;
    description?: string;
    stock: number;
    category_id?: number | null;
    category?: { id: number; name: string };
}

export interface CategoryDto {
    id: number;
    name: string;
}

export interface Paginated<T> {
    message: string;
    data: T[];
    meta: { current_page: number; per_page: number; total: number; last_page: number };
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
    private readonly base = environment.apiUrl;

    constructor(private http: HttpClient) { }

    search(term: string): Observable<ProductDto[]> {
        const url = `${this.base}${environment.endpoints.productsSearch}`;
        const params = new HttpParams().set('q', term);
        return this.http
            .get<{ message: string; data: ProductDto[] }>(url, { params, context: new HttpContext().set(SKIP_SPINNER, true) })
            .pipe(map(res => res.data));
    }

    list(params: { page?: number; per_page?: number; q?: string; category_id?: number | '' }): Observable<Paginated<ProductDto>> {
        const url = `${this.base}${environment.endpoints.productsIndex}`;
        let httpParams = new HttpParams()
            .set('page', String(params.page ?? 1))
            .set('per_page', String(params.per_page ?? 12));
        if (params.q && params.q.trim().length >= 2) httpParams = httpParams.set('q', params.q.trim());
        if (params.category_id) httpParams = httpParams.set('category_id', String(params.category_id));
        return this.http.get<Paginated<ProductDto>>(url, { params: httpParams });
    }

    categories(): Observable<CategoryDto[]> {
        const url = `${this.base}${environment.endpoints.productsCategories}`;
        return this.http
            .get<{ message: string; data: CategoryDto[] }>(url)
            .pipe(map(res => res.data));
    }

    // Favorites API (requires Bearer token)
    private authHeaders(): HttpHeaders | undefined {
        try {
            const token = localStorage.getItem('access_token');
            return token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : undefined;
        } catch { return undefined; }
    }

    favoritesList(): Observable<ProductDto[]> {
        const url = `${this.base}${environment.endpoints.favoritesIndex}`;
        return this.http
            .get<{ message: string; data: ProductDto[] }>(url, { headers: this.authHeaders() })
            .pipe(map(res => res.data));
    }

    addFavorite(productId: number): Observable<{ message: string }> {
        const url = `${this.base}${environment.endpoints.favoritesAdd}`;
        return this.http.post<{ message: string }>(url, { product_id: productId }, { headers: this.authHeaders() });
    }

    removeFavorite(productId: number): Observable<{ message: string }> {
        const url = `${this.base}${environment.endpoints.favoritesRemove}/${productId}`;
        return this.http.delete<{ message: string }>(url, { headers: this.authHeaders() });
    }
}
