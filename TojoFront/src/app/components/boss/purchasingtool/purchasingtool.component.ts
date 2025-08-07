import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../services/alert.service';

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

  // Control del modal de confirmación
  mostrarModalConfirmacion: boolean = false;
  mostrarModalLimpiar: boolean = false;

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

  constructor(private alertService: AlertService) {}

  // Agregar producto a la compra
  agregarProducto(): void {
    // Validar ID del producto
    if (!this.productoId.trim()) {
      this.alertService.showWarning(
        'Por favor ingresa el ID o código del producto',
        'Campo requerido'
      );
      return;
    }

    // Validar cantidad de unidades
    if (this.unidadesAIngresar <= 0) {
      this.alertService.showError(
        'La cantidad de unidades debe ser mayor a cero',
        'Cantidad inválida'
      );
      return;
    }

    if (this.unidadesAIngresar > 10000) {
      this.alertService.showWarning(
        'La cantidad no puede exceder 10,000 unidades por producto',
        'Cantidad muy alta'
      );
      return;
    }

    // Buscar producto por ID o código
    const producto = this.productosDisponibles.find(p => 
      p.id === this.productoId || p.codigo.toLowerCase() === this.productoId.toLowerCase()
    );

    if (!producto) {
      this.alertService.showError(
        `No se encontró el producto "${this.productoId}". Verifica el ID o código del producto.`,
        'Producto no encontrado'
      );
      return;
    }

    // Verificar si el producto ya está en la compra
    const productoExistente = this.productosEnCompra.find(pc => pc.producto.id === producto.id);
    
    if (productoExistente) {
      // Actualizar cantidad si ya existe (sin alerta)
      productoExistente.cantidadARecibir += this.unidadesAIngresar;
      productoExistente.subtotal = productoExistente.cantidadARecibir * producto.precioUnitario;
    } else {
      // Agregar nuevo producto (sin alerta)
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
    const producto = this.productosEnCompra[index];
    if (!producto) {
      this.alertService.showError(
        'No se pudo encontrar el producto a eliminar',
        'Error'
      );
      return;
    }

    // Eliminar sin alerta
    this.productosEnCompra.splice(index, 1);
    this.calcularMontoTotal();
  }

  // Cerrar compra y confirmar ingreso al inventario
  cerrarCompra(): void {
    if (this.productosEnCompra.length === 0) {
      this.alertService.showWarning(
        'No hay productos en la compra actual. Agrega productos antes de cerrar la compra.',
        'Compra vacía'
      );
      return;
    }

    // Validar montos y cantidades
    if (this.montoTotal <= 0) {
      this.alertService.showError(
        'El monto total de la compra debe ser mayor a cero',
        'Monto inválido'
      );
      return;
    }

    if (this.montoTotal > 1000000) {
      this.alertService.showWarning(
        'El monto total excede $1,000,000. Por favor verifica las cantidades y precios.',
        'Monto muy alto'
      );
      return;
    }

    const totalUnidades = this.getTotalUnidades();
    if (totalUnidades > 50000) {
      this.alertService.showWarning(
        'El total de unidades excede 50,000. Por favor verifica las cantidades.',
        'Cantidad muy alta'
      );
      return;
    }

    // Mostrar modal de confirmación
    this.mostrarModalConfirmacion = true;
  }

  // Confirmar el cierre de compra desde el modal
  confirmarCierreCompra(): void {
    this.mostrarModalConfirmacion = false;
    this.procesarCompra();
  }

  // Cancelar el cierre de compra desde el modal
  cancelarCierreCompra(): void {
    this.mostrarModalConfirmacion = false;
  }

  // Procesar la compra confirmada
  private procesarCompra(): void {
    const resumenCompra = {
      productos: this.productosEnCompra.length,
      unidades: this.getTotalUnidades(),
      total: this.montoTotal
    };

    // Simular actualización del inventario
    this.productosEnCompra.forEach(pc => {
      const producto = this.productosDisponibles.find(p => p.id === pc.producto.id);
      if (producto) {
        producto.inventarioTeorico += pc.cantidadARecibir;
      }
    });

    // Limpiar compra actual antes del mensaje
    this.productosEnCompra = [];
    this.montoTotal = 0;

    // Mostrar confirmación de éxito
    this.alertService.showSuccess(
      `¡Compra procesada exitosamente! ${resumenCompra.productos} productos ingresados, ${resumenCompra.unidades} unidades totales por $${resumenCompra.total.toFixed(2)} MXN. El inventario ha sido actualizado.`,
      'Compra completada'
    );
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

  // Métodos auxiliares para diferentes tipos de alertas
  mostrarEstadisticasCompra(): void {
    if (this.productosEnCompra.length === 0) {
      this.alertService.showInfo(
        'No hay productos en la compra actual',
        'Compra vacía'
      );
      return;
    }

    const totalProductos = this.productosEnCompra.length;
    const totalUnidades = this.getTotalUnidades();
    const promedioUnidadesPorProducto = (totalUnidades / totalProductos).toFixed(1);
    const promedioPrecioPorUnidad = (this.montoTotal / totalUnidades).toFixed(2);

    this.alertService.showInfo(
      `Estadísticas de compra: ${totalProductos} productos, ${totalUnidades} unidades totales, Promedio: ${promedioUnidadesPorProducto} unidades/producto, $${promedioPrecioPorUnidad}/unidad`,
      'Estadísticas de compra'
    );
  }

  confirmarLimpiarCompra(): void {
    if (this.productosEnCompra.length === 0) {
      this.alertService.showInfo(
        'No hay productos en la compra para limpiar',
        'Compra vacía'
      );
      return;
    }

    // Mostrar modal de confirmación para limpiar
    this.mostrarModalLimpiar = true;
  }

  // Confirmar limpieza desde el modal
  confirmarLimpieza(): void {
    this.mostrarModalLimpiar = false;
    this.limpiarCompra();
  }

  // Cancelar limpieza desde el modal
  cancelarLimpieza(): void {
    this.mostrarModalLimpiar = false;
  }

  limpiarCompra(): void {
    // Limpiar sin alerta
    this.productosEnCompra = [];
    this.montoTotal = 0;
  }

  mostrarDetalleProducto(producto: Producto): void {
    const productoEnCompra = this.productosEnCompra.find(pc => pc.producto.id === producto.id);
    
    if (productoEnCompra) {
      this.alertService.showInfo(
        `${producto.nombre} - Código: ${producto.codigo} - Precio: $${producto.precioUnitario} - Inventario actual: ${producto.inventarioTeorico} - En compra: ${productoEnCompra.cantidadARecibir} unidades`,
        'Detalle del producto'
      );
    } else {
      this.alertService.showInfo(
        `${producto.nombre} - Código: ${producto.codigo} - Precio: $${producto.precioUnitario} - Inventario actual: ${producto.inventarioTeorico} unidades`,
        'Detalle del producto'
      );
    }
  }

  validarInventarioAlto(): void {
    const productosAltoInventario = this.productosEnCompra.filter(pc => {
      const inventarioFinal = pc.producto.inventarioTeorico + pc.cantidadARecibir;
      return inventarioFinal > 1000;
    });

    if (productosAltoInventario.length > 0) {
      const nombres = productosAltoInventario.map(pc => pc.producto.nombre).join(', ');
      this.alertService.showWarning(
        `Los siguientes productos tendrán inventario alto después de la compra: ${nombres}`,
        'Inventario alto detectado'
      );
    } else {
      this.alertService.showSuccess(
        'Todos los productos tendrán niveles de inventario normales',
        'Inventario validado'
      );
    }
  }

  mostrarAyudaCompra(): void {
    this.alertService.showInfo(
      'Para agregar productos: 1) Ingresa el código o ID del producto, 2) Especifica la cantidad de unidades, 3) Haz clic en "Agregar". Para finalizar, revisa la lista y haz clic en "Cerrar Compra".',
      'Ayuda - Cómo realizar compras'
    );
  }

  buscarProductoPorCodigo(codigo: string): void {
    const producto = this.productosDisponibles.find(p => 
      p.codigo.toLowerCase() === codigo.toLowerCase()
    );

    if (producto) {
      this.productoId = producto.codigo;
      this.alertService.showSuccess(
        `Producto encontrado: ${producto.nombre}`,
        'Producto seleccionado'
      );
    } else {
      this.alertService.showError(
        `No se encontró ningún producto con el código "${codigo}"`,
        'Producto no encontrado'
      );
    }
  }
}
