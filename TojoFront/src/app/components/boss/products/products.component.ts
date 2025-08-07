import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../services/alert.service';

interface ProductoForm {
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  peso: number;
  categoria: string;
}

interface PosicionGondola {
  x: number;
  y: number;
  ocupado: boolean;
  producto?: string;
}

interface Gondola {
  id: string;
  nombre: string;
  filas: number;
  columnas: number;
  posiciones: PosicionGondola[][];
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsBossComponent {
  // Formulario de producto
  productoForm: ProductoForm = {
    codigo: '',
    nombre: '',
    descripcion: '',
    precio: 0,
    peso: 0,
    categoria: ''
  };

  // Categorías disponibles
  categorias = [
    { value: 'lacteos', label: 'Lácteos' },
    { value: 'carnes', label: 'Carnes' },
    { value: 'bebidas', label: 'Bebidas' },
    { value: 'panaderia', label: 'Panadería' },
    { value: 'frutas', label: 'Frutas y Verduras' },
    { value: 'limpieza', label: 'Limpieza' },
    { value: 'snacks', label: 'Snacks' },
    { value: 'congelados', label: 'Congelados' }
  ];

  // Góndolas disponibles
  gondolas: Gondola[] = [
    {
      id: 'g1',
      nombre: 'Góndola A',
      filas: 6,
      columnas: 8,
      posiciones: []
    },
    {
      id: 'g2', 
      nombre: 'Góndola B',
      filas: 5,
      columnas: 10,
      posiciones: []
    },
    {
      id: 'g3',
      nombre: 'Góndola C',
      filas: 4,
      columnas: 12,
      posiciones: []
    },
    {
      id: 'g4',
      nombre: 'Góndola D',
      filas: 6,
      columnas: 6,
      posiciones: []
    },
    {
      id: 'g5',
      nombre: 'Góndola E',
      filas: 4,
      columnas: 8,
      posiciones: []
    },
    {
      id: 'g6',
      nombre: 'Góndola F',
      filas: 3,
      columnas: 10,
      posiciones: []
    },
    {
      id: 'g7',
      nombre: 'Góndola G',
      filas: 5,
      columnas: 8,
      posiciones: []
    },
    {
      id: 'g8',
      nombre: 'Góndola H',
      filas: 4,
      columnas: 6,
      posiciones: []
    },
    {
      id: 'g9',
      nombre: 'Góndola I',
      filas: 3,
      columnas: 8,
      posiciones: []
    }
  ];

  // Góndola seleccionada
  gondolaSeleccionada: string = '';
  
  // Posición seleccionada en la góndola
  posicionSeleccionada: { x: number, y: number } | null = null;

  // Paginación de góndolas
  paginaActual: number = 1;
  gondolasPorPagina: number = 4;

  constructor(private alertService: AlertService) {
    this.inicializarGondolas();
  }

  // Inicializar las posiciones de las góndolas
  inicializarGondolas(): void {
    this.gondolas.forEach(gondola => {
      gondola.posiciones = [];
      for (let fila = 0; fila < gondola.filas; fila++) {
        gondola.posiciones[fila] = [];
        for (let col = 0; col < gondola.columnas; col++) {
          // Simular algunas posiciones ocupadas
          const ocupado = Math.random() < 0.15; // 15% de posiciones ocupadas
          gondola.posiciones[fila][col] = {
            x: col,
            y: fila,
            ocupado: ocupado,
            producto: ocupado ? `Producto ${Math.floor(Math.random() * 100)}` : undefined
          };
        }
      }
    });
  }

  // Obtener góndola actualmente seleccionada
  getGondolaActual(): Gondola | null {
    return this.gondolas.find(g => g.id === this.gondolaSeleccionada) || null;
  }

  // Seleccionar góndola
  seleccionarGondola(gondolaId: string): void {
    this.gondolaSeleccionada = gondolaId;
    this.posicionSeleccionada = null;
  }

  // Seleccionar posición en la góndola
  seleccionarPosicion(x: number, y: number): void {
    const gondola = this.getGondolaActual();
    if (!gondola) return;

    const posicion = gondola.posiciones[y][x];
    if (posicion.ocupado) return; // No permitir seleccionar posiciones ocupadas

    this.posicionSeleccionada = { x, y };
  }

  // Validar formulario completo
  validarFormulario(): boolean {
    return this.productoForm.codigo.trim() !== '' &&
           this.productoForm.nombre.trim() !== '' &&
           this.productoForm.descripcion.trim() !== '' &&
           this.productoForm.precio > 0 &&
           this.productoForm.peso > 0 &&
           this.productoForm.categoria !== '' &&
           this.gondolaSeleccionada !== '' &&
           this.posicionSeleccionada !== null;
  }

  // Obtener clase CSS para cada posición
  getPosicionClass(x: number, y: number): string {
    const gondola = this.getGondolaActual();
    if (!gondola) return '';

    const posicion = gondola.posiciones[y][x];
    let classes = ['posicion'];

    if (posicion.ocupado) {
      classes.push('ocupado');
    } else {
      classes.push('libre');
    }

    if (this.posicionSeleccionada?.x === x && this.posicionSeleccionada?.y === y) {
      classes.push('seleccionado');
    }

    return classes.join(' ');
  }

  // Añadir producto
  anadirProducto(): void {
    // Validar código del producto
    if (!this.productoForm.codigo.trim()) {
      this.alertService.showWarning(
        'Por favor ingresa el código del producto',
        'Campo requerido'
      );
      return;
    }

    // Validar nombre del producto
    if (!this.productoForm.nombre.trim()) {
      this.alertService.showWarning(
        'Por favor ingresa el nombre del producto',
        'Campo requerido'
      );
      return;
    }

    // Validar descripción del producto
    if (!this.productoForm.descripcion.trim()) {
      this.alertService.showWarning(
        'Por favor ingresa una descripción para el producto',
        'Campo requerido'
      );
      return;
    }

    // Validar precio
    if (this.productoForm.precio <= 0) {
      this.alertService.showError(
        'El precio debe ser mayor a cero',
        'Precio inválido'
      );
      return;
    }

    if (this.productoForm.precio > 999999) {
      this.alertService.showWarning(
        'El precio no puede exceder $999,999',
        'Precio muy alto'
      );
      return;
    }

    // Validar peso
    if (this.productoForm.peso <= 0) {
      this.alertService.showError(
        'El peso debe ser mayor a cero',
        'Peso inválido'
      );
      return;
    }

    if (this.productoForm.peso > 1000) {
      this.alertService.showWarning(
        'El peso no puede exceder 1000 kg',
        'Peso muy alto'
      );
      return;
    }

    // Validar categoría
    if (!this.productoForm.categoria) {
      this.alertService.showWarning(
        'Por favor selecciona una categoría para el producto',
        'Campo requerido'
      );
      return;
    }

    // Validar góndola seleccionada
    if (!this.gondolaSeleccionada) {
      this.alertService.showError(
        'Por favor selecciona una góndola donde colocar el producto',
        'Góndola requerida'
      );
      return;
    }

    // Validar posición seleccionada
    if (!this.posicionSeleccionada) {
      this.alertService.showError(
        'Por favor selecciona una posición libre en la góndola para colocar el producto',
        'Posición requerida'
      );
      return;
    }

    const gondola = this.getGondolaActual()!;
    const posicion = gondola.posiciones[this.posicionSeleccionada!.y][this.posicionSeleccionada!.x];

    // Verificar que la posición no esté ocupada (doble verificación)
    if (posicion.ocupado) {
      this.alertService.showError(
        'La posición seleccionada ya está ocupada. Por favor selecciona otra posición.',
        'Posición no disponible'
      );
      return;
    }

    // Guardar datos para el mensaje antes de limpiar
    const nombreProducto = this.productoForm.nombre;
    const nombreGondola = gondola.nombre;
    const posicionInfo = `(${this.posicionSeleccionada!.x + 1}, ${this.posicionSeleccionada!.y + 1})`;

    // Marcar posición como ocupada
    posicion.ocupado = true;
    posicion.producto = this.productoForm.nombre;

    // Simular guardado del producto
    const productoData = {
      ...this.productoForm,
      gondola: gondola.nombre,
      posicion: this.posicionSeleccionada
    };
    
    console.log('Producto agregado:', productoData);

    // Limpiar formulario
    this.productoForm = {
      codigo: '',
      nombre: '',
      descripcion: '',
      precio: 0,
      peso: 0,
      categoria: ''
    };
    this.posicionSeleccionada = null;

    // Mostrar confirmación de éxito
    this.alertService.showSuccess(
      `El producto "${nombreProducto}" ha sido agregado exitosamente en ${nombreGondola} - Posición ${posicionInfo}`,
      'Producto agregado'
    );
  }

  // Generar array para mostrar posiciones
  getFilas(): number[] {
    const gondola = this.getGondolaActual();
    if (!gondola) return [];
    return Array.from({ length: gondola.filas }, (_, i) => i);
  }

  getColumnas(): number[] {
    const gondola = this.getGondolaActual();
    if (!gondola) return [];
    return Array.from({ length: gondola.columnas }, (_, i) => i);
  }

  // Obtener información de tooltip para posición
  getTooltipInfo(x: number, y: number): string {
    const gondola = this.getGondolaActual();
    if (!gondola) return '';

    const posicion = gondola.posiciones[y][x];
    if (posicion.ocupado) {
      return `Ocupado: ${posicion.producto}`;
    }
    return `Posición libre (${x + 1}, ${y + 1})`;
  }

  // Verificar si una posición está ocupada de forma segura
  isPosicionOcupada(x: number, y: number): boolean {
    const gondola = this.getGondolaActual();
    if (!gondola || !gondola.posiciones[y] || !gondola.posiciones[y][x]) {
      return false;
    }
    return gondola.posiciones[y][x].ocupado;
  }

  // Obtener estadísticas de posiciones ocupadas
  getPosicionesOcupadas(): number {
    const gondola = this.getGondolaActual();
    if (!gondola || !gondola.posiciones) return 0;
    
    let ocupadas = 0;
    for (let fila of gondola.posiciones) {
      for (let posicion of fila) {
        if (posicion.ocupado) ocupadas++;
      }
    }
    return ocupadas;
  }

  // Obtener estadísticas de posiciones libres
  getPosicionesLibres(): number {
    const gondola = this.getGondolaActual();
    if (!gondola || !gondola.posiciones) return 0;
    
    let libres = 0;
    for (let fila of gondola.posiciones) {
      for (let posicion of fila) {
        if (!posicion.ocupado) libres++;
      }
    }
    return libres;
  }

  // Obtener total de posiciones
  getTotalPosiciones(): number {
    const gondola = this.getGondolaActual();
    if (!gondola) return 0;
    return gondola.filas * gondola.columnas;
  }

  // Métodos de paginación
  getGondolasPaginadas(): Gondola[] {
    const inicio = (this.paginaActual - 1) * this.gondolasPorPagina;
    const fin = inicio + this.gondolasPorPagina;
    return this.gondolas.slice(inicio, fin);
  }

  getTotalPaginas(): number {
    return Math.ceil(this.gondolas.length / this.gondolasPorPagina);
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.getTotalPaginas()) {
      this.paginaActual++;
    }
  }

  irAPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.getTotalPaginas()) {
      this.paginaActual = pagina;
    }
  }

  getNumerosPaginas(): number[] {
    const totalPaginas = this.getTotalPaginas();
    return Array.from({ length: totalPaginas }, (_, i) => i + 1);
  }

  // Verificar si podemos ir a la página anterior
  puedeIrAnterior(): boolean {
    return this.paginaActual > 1;
  }

  // Verificar si podemos ir a la página siguiente
  puedeIrSiguiente(): boolean {
    return this.paginaActual < this.getTotalPaginas();
  }

  // Métodos auxiliares para diferentes tipos de alertas
  mostrarInfoGondola(): void {
    const gondola = this.getGondolaActual();
    if (!gondola) {
      this.alertService.showWarning(
        'Por favor selecciona una góndola primero',
        'Góndola no seleccionada'
      );
      return;
    }

    const ocupadas = this.getPosicionesOcupadas();
    const libres = this.getPosicionesLibres();
    const total = this.getTotalPosiciones();
    const porcentajeOcupacion = ((ocupadas / total) * 100).toFixed(1);

    this.alertService.showInfo(
      `${gondola.nombre}: ${gondola.filas}x${gondola.columnas} posiciones | Ocupadas: ${ocupadas} | Libres: ${libres} | Ocupación: ${porcentajeOcupacion}%`,
      'Información de Góndola'
    );
  }

  confirmarLimpiarFormulario(): void {
    const tieneContenido = this.productoForm.codigo || this.productoForm.nombre || 
                          this.productoForm.descripcion || this.productoForm.precio > 0 || 
                          this.productoForm.peso > 0 || this.productoForm.categoria;

    if (tieneContenido) {
      this.alertService.showWarning(
        '¿Estás seguro de que deseas limpiar el formulario? Se perderán todos los datos ingresados.',
        'Confirmar limpieza'
      );
    } else {
      this.alertService.showInfo(
        'El formulario ya está vacío',
        'Información'
      );
    }
  }

  mostrarEstadisticasGenerales(): void {
    let totalOcupadas = 0;
    let totalPosiciones = 0;

    this.gondolas.forEach(gondola => {
      if (gondola.posiciones.length > 0) {
        for (let fila of gondola.posiciones) {
          for (let posicion of fila) {
            totalPosiciones++;
            if (posicion.ocupado) totalOcupadas++;
          }
        }
      }
    });

    const porcentajeGeneral = totalPosiciones > 0 ? ((totalOcupadas / totalPosiciones) * 100).toFixed(1) : '0';

    this.alertService.showInfo(
      `Estadísticas generales: ${this.gondolas.length} góndolas | ${totalPosiciones} posiciones totales | ${totalOcupadas} ocupadas | Ocupación general: ${porcentajeGeneral}%`,
      'Estadísticas del Inventario'
    );
  }

  validarCodigoDuplicado(): void {
    // Simular validación de código duplicado
    if (this.productoForm.codigo && this.productoForm.codigo.length >= 3) {
      // Simulación: algunos códigos ya existen
      const codigosExistentes = ['PROD001', 'ITEM002', 'SKU003', 'CODE004'];
      
      if (codigosExistentes.includes(this.productoForm.codigo.toUpperCase())) {
        this.alertService.showError(
          `El código "${this.productoForm.codigo}" ya existe en el sistema. Por favor utiliza un código diferente.`,
          'Código duplicado'
        );
      } else {
        this.alertService.showSuccess(
          `El código "${this.productoForm.codigo}" está disponible`,
          'Código válido'
        );
      }
    }
  }

  mostrarAyudaPosicionamiento(): void {
    this.alertService.showInfo(
      'Para agregar un producto: 1) Completa todos los campos del formulario, 2) Selecciona una góndola, 3) Haz clic en una posición libre (verde) en la góndola. Las posiciones rojas ya están ocupadas.',
      'Ayuda - Cómo agregar productos'
    );
  }
}
