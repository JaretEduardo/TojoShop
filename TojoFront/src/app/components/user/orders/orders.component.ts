import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StartComponent } from '../start/start.component';
import { ProductsService } from '../../../services/products.service';

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  id: string;
  date: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  total: number;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, StartComponent],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];

  constructor(private router: Router, private productsService: ProductsService) { }

  ngOnInit(): void {
    this.productsService.orders().subscribe((orders: any[]) => {
      this.orders = orders.map(o => ({
        id: o.order_number || String(o.id),
        date: new Date(o.created_at),
        status: (o.status || 'processing') as Order['status'],
        items: (o.items || []).map((it: any) => ({
          id: it.product_id,
          name: it.product?.name || `Producto ${it.product_id}`,
          quantity: it.quantity,
          price: Number(it.price),
          image: 'https://via.placeholder.com/60x60/ff6b35/ffffff?text=' + encodeURIComponent(it.product?.name || 'Item')
        })),
        total: Number(o.total)
      }));
    });
  }

  getStatusText(status: string): string {
    const statusMap = {
      'pending': 'Pendiente',
      'processing': 'Procesando',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  }

  viewOrderDetails(order: Order) {
    console.log('Ver detalles de la orden:', order.id);
  }

  trackOrder(order: Order) {
    console.log('Rastrear orden:', order.id);
  }

  goToProducts() {
    this.router.navigate(['/home']);
  }
}
