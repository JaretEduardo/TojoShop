import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Task {
  id: number;
  title: string;
  description: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  completedTime?: string;
}

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css'
})
export class TasksComponent {
  pendingTasks: Task[] = [
    {
      id: 1,
      title: 'Revisar inventario de bebidas',
      description: 'Verificar stock y registrar productos faltantes en el sistema',
      time: '09:30 AM',
      priority: 'high',
      completed: false
    },
    {
      id: 2,
      title: 'Limpiar área de caja',
      description: 'Desinfectar terminal POS y área de trabajo',
      time: '10:15 AM',
      priority: 'medium',
      completed: false
    },
    {
      id: 3,
      title: 'Actualizar precios en sistema',
      description: 'Aplicar nuevos precios según lista actualizada',
      time: '11:00 AM',
      priority: 'low',
      completed: false
    },
    {
      id: 7,
      title: 'Verificar temperatura de refrigeradores',
      description: 'Revisar que todos los equipos de refrigeración mantengan la temperatura adecuada',
      time: '11:30 AM',
      priority: 'high',
      completed: false
    },
    {
      id: 8,
      title: 'Organizar estantes de productos',
      description: 'Acomodar productos según planograma establecido',
      time: '12:00 PM',
      priority: 'medium',
      completed: false
    },
    {
      id: 9,
      title: 'Revisar fechas de caducidad',
      description: 'Verificar productos próximos a vencer y realizar rotación',
      time: '01:00 PM',
      priority: 'high',
      completed: false
    },
    {
      id: 10,
      title: 'Calibrar balanza electrónica',
      description: 'Verificar precisión de la balanza y ajustar si es necesario',
      time: '02:30 PM',
      priority: 'medium',
      completed: false
    },
    {
      id: 11,
      title: 'Reporte de ventas diario',
      description: 'Generar y enviar reporte de ventas del día anterior',
      time: '03:00 PM',
      priority: 'low',
      completed: false
    },
    {
      id: 12,
      title: 'Limpieza de área de almacén',
      description: 'Limpiar y organizar el área de almacenamiento',
      time: '04:00 PM',
      priority: 'medium',
      completed: false
    },
    {
      id: 13,
      title: 'Verificar sistema de seguridad',
      description: 'Revisar cámaras y sistema de alarma',
      time: '05:00 PM',
      priority: 'high',
      completed: false
    }
  ];

  completedTasks: Task[] = [
    {
      id: 4,
      title: 'Abrir caja registradora',
      description: 'Verificar fondos iniciales y registrar apertura',
      time: '08:00 AM',
      priority: 'high',
      completed: true,
      completedTime: '08:05 AM'
    },
    {
      id: 5,
      title: 'Revisar alertas del sistema',
      description: 'Verificar notificaciones de stock bajo',
      time: '08:30 AM',
      priority: 'medium',
      completed: true,
      completedTime: '08:45 AM'
    },
    {
      id: 6,
      title: 'Organizar área de trabajo',
      description: 'Preparar estación para el día laboral',
      time: '07:45 AM',
      priority: 'low',
      completed: true,
      completedTime: '07:55 AM'
    },
    {
      id: 14,
      title: 'Revisar stock de bolsas',
      description: 'Verificar cantidad de bolsas disponibles',
      time: '07:30 AM',
      priority: 'low',
      completed: true,
      completedTime: '07:35 AM'
    },
    {
      id: 15,
      title: 'Actualizar cartelería de precios',
      description: 'Colocar nuevos precios en productos promocionales',
      time: '08:15 AM',
      priority: 'medium',
      completed: true,
      completedTime: '08:30 AM'
    },
    {
      id: 16,
      title: 'Conteo de caja inicial',
      description: 'Verificar dinero en efectivo al inicio del turno',
      time: '07:50 AM',
      priority: 'high',
      completed: true,
      completedTime: '08:00 AM'
    }
  ];

  completeTask(taskId: number): void {
    const taskIndex = this.pendingTasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
      const task = this.pendingTasks[taskIndex];
      task.completed = true;
      task.completedTime = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      
      // Mover de pendientes a completadas
      this.completedTasks.unshift(task);
      this.pendingTasks.splice(taskIndex, 1);
    }
  }

  getPriorityClass(priority: string): string {
    return priority;
  }

  getPriorityText(priority: string): string {
    switch (priority) {
      case 'high': return 'ALTA';
      case 'medium': return 'MEDIA';
      case 'low': return 'BAJA';
      default: return 'MEDIA';
    }
  }
}
