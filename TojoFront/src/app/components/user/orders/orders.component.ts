import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StartComponent } from '../start/start.component';

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
export class OrdersComponent {
  orders: Order[] = [
    {
      id: 'ORD-2024-001',
      date: new Date('2024-01-15'),
      status: 'delivered',
      items: [
        {
          id: 1,
          name: 'Cyberpunk Jacket',
          quantity: 1,
          price: 299.99,
          image: 'https://via.placeholder.com/60x60/ff6b35/ffffff?text=Jacket'
        },
        {
          id: 2,
          name: 'Neural Headset',
          quantity: 1,
          price: 599.99,
          image: 'https://via.placeholder.com/60x60/8b5cf6/ffffff?text=Headset'
        }
      ],
      total: 899.98
    },
    {
      id: 'ORD-2024-002',
      date: new Date('2024-01-20'),
      status: 'shipped',
      items: [
        {
          id: 3,
          name: 'Holo Gloves',
          quantity: 2,
          price: 199.99,
          image: 'https://via.placeholder.com/60x60/ff6b35/ffffff?text=Gloves'
        }
      ],
      total: 399.98
    },
    {
      id: 'ORD-2024-003',
      date: new Date('2024-01-25'),
      status: 'processing',
      items: [
        {
          id: 5,
          name: 'Data Visor',
          quantity: 1,
          price: 799.99,
          image: 'https://via.placeholder.com/60x60/ff6b35/ffffff?text=Visor'
        }
      ],
      total: 799.99
    }
  ];

  constructor(private router: Router) {}

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
