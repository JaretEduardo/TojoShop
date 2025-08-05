import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  inventarioTeorico: number;
  precioUnitario: number;
}

interface ProductoCompra {
  producto: Producto;
  cantidadARecibir: number;
  subtotal: number;
}

@Component({
  selector: 'app-purchasingtool',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './purchasingtool.component.html',
  styleUrl: './purchasingtool.component.css'
})
export class PurchasingtoolComponent {
  // Formulario de compra
  productoId: string = '';
  unidadesAIngresar: number = 0;
  montoTotal: number = 0;

  // Lista de productos en la compra actual
  productosEnCompra: ProductoCompra[] = [];

  // Base de datos simulada de productos
  productosDisponibles: Producto[] = [
    {
      id: '001',
      codigo: 'LAC001',
      nombre: 'Leche Entera 1L',
      inventarioTeorico: 45,
      precioUnitario: 45.50
    },
    {
      id: '002',
      codigo: 'PAN002',
      nombre: 'Pan Integral 500g',
      inventarioTeorico: 23,
      precioUnitario: 32.80
    },
    {
      id: '003',
      codigo: 'CAR003',
      nombre: 'Pollo Entero 1.2kg',
      inventarioTeorico: 12,
      precioUnitario: 155.50
    },
    {
      id: '004',
      codigo: 'BEB004',
      nombre: 'Agua Mineral 1.5L',
      inventarioTeorico: 67,
      precioUnitario: 15.85
    },
    {
      id: '005',
      codigo: 'SNK005',
      nombre: 'Papas Fritas 150g',
      inventarioTeorico: 34,
      precioUnitario: 42.20
    },
    {
      id: '006',
      codigo: 'FRU006',
      nombre: 'Manzanas Rojas 1kg',
      inventarioTeorico: 28,
      precioUnitario: 68.40
    },
    {
      id: '007',
      codigo: 'LIM007',
      nombre: 'Detergente Líquido 1L',
      inventarioTeorico: 15,
      precioUnitario: 89.75
    },
    {
      id: '008',
      codigo: 'CON008',
      nombre: 'Pizza Congelada 400g',
      inventarioTeorico: 18,
      precioUnitario: 115.90
    }
  ];

  // Agregar producto a la compra
  agregarProducto(): void {
    if (!this.productoId.trim() || this.unidadesAIngresar <= 0) {
      alert('Por favor, complete el ID del producto y la cantidad de unidades');
      return;
    }

    // Buscar producto por ID o código
    const producto = this.productosDisponibles.find(p => 
      p.id === this.productoId || p.codigo.toLowerCase() === this.productoId.toLowerCase()
    );

    if (!producto) {
      alert('Producto no encontrado. Verifique el ID o código del producto.');
      return;
    }

    // Verificar si el producto ya está en la compra
    const productoExistente = this.productosEnCompra.find(pc => pc.producto.id === producto.id);
    
    if (productoExistente) {
      // Actualizar cantidad si ya existe
      productoExistente.cantidadARecibir += this.unidadesAIngresar;
      productoExistente.subtotal = productoExistente.cantidadARecibir * producto.precioUnitario;
    } else {
      // Agregar nuevo producto
      const productoCompra: ProductoCompra = {
        producto: producto,
        cantidadARecibir: this.unidadesAIngresar,
        subtotal: this.unidadesAIngresar * producto.precioUnitario
      };
      this.productosEnCompra.push(productoCompra);
    }

    // Limpiar formulario
    this.productoId = '';
    this.unidadesAIngresar = 0;
    
    // Recalcular total
    this.calcularMontoTotal();
  }

  // Calcular monto total de la compra
  calcularMontoTotal(): void {
    this.montoTotal = this.productosEnCompra.reduce((total, pc) => total + pc.subtotal, 0);
  }

  // Eliminar producto de la compra
  eliminarProducto(index: number): void {
    this.productosEnCompra.splice(index, 1);
    this.calcularMontoTotal();
  }

  // Cerrar compra y confirmar ingreso al inventario
  cerrarCompra(): void {
    if (this.productosEnCompra.length === 0) {
      alert('No hay productos en la compra actual');
      return;
    }

    // Confirmar la compra
    const confirmacion = confirm(
      `¿Confirmar compra de ${this.productosEnCompra.length} productos por un total de $${this.montoTotal.toFixed(2)} MXN?`
    );

    if (confirmacion) {
      // Simular actualización del inventario
      this.productosEnCompra.forEach(pc => {
        const producto = this.productosDisponibles.find(p => p.id === pc.producto.id);
        if (producto) {
          producto.inventarioTeorico += pc.cantidadARecibir;
        }
      });

      // Mostrar resumen
      alert(`Compra confirmada exitosamente!\n\nProductos ingresados: ${this.productosEnCompra.length}\nTotal: $${this.montoTotal.toFixed(2)} MXN\n\nEl inventario ha sido actualizado.`);

      // Limpiar compra actual
      this.productosEnCompra = [];
      this.montoTotal = 0;
    }
  }

  // Obtener sugerencias de productos (para autocompletado)
  getSugerenciasProductos(): Producto[] {
    if (!this.productoId.trim()) return [];
    
    return this.productosDisponibles.filter(p => 
      p.codigo.toLowerCase().includes(this.productoId.toLowerCase()) ||
      p.nombre.toLowerCase().includes(this.productoId.toLowerCase())
    ).slice(0, 5); // Máximo 5 sugerencias
  }

  // Seleccionar producto de las sugerencias
  seleccionarProducto(producto: Producto): void {
    this.productoId = producto.codigo;
  }

  // Validar si se puede cerrar la compra
  puedeSerrarCompra(): boolean {
    return this.productosEnCompra.length > 0;
  }

  // Obtener total de unidades en la compra
  getTotalUnidades(): number {
    return this.productosEnCompra.reduce((total, pc) => total + pc.cantidadARecibir, 0);
  }

  // Helper para verificar si el productoId es válido
  isProductoIdValid(): boolean {
    return this.productoId.trim().length > 0;
  }
}
