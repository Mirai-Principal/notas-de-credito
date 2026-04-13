import { Component, input, output, inject, ChangeDetectorRef, signal, OnChanges, SimpleChange } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InfoButtonComponent } from '../../../../shared/info-button/info-button';
import { Alert } from '../../../../shared/alert/alert';
import { NotaCreditoItem, NotaCreditoRequest, NotaCreditoItemResponse } from '../../../../core/models/nota-credito.model';
import { NotaCreditoService } from '../../../../core/services/nota-credito.service';
import { ClienteService } from '../../../../core/services/cliente.service';

@Component({
  selector: 'app-nota-credito-tabla',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    InfoButtonComponent
  ],
  templateUrl: './nota-credito-tabla.html',
  styleUrl: './nota-credito-tabla.css'

})

export class NotaCreditoTablaComponent implements OnChanges {

  private notaCreditoService = inject(NotaCreditoService);
  private clienteService = inject(ClienteService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  // Inputs
  items = input.required<NotaCreditoItem[]>();
  private itemsInternal = signal<NotaCreditoItem[]>([]);
  
  // Getter para obtener los items actualizados (con errores) o los originales
  get currentItems() {
    return this.itemsInternal().length > 0 ? this.itemsInternal() : this.items();
  }

  // Resetear estado interno cuando los items de entrada cambian
  private resetInternalState() {
    this.itemsInternal.set([]);
  }

  // Detectar cambios en los inputs y resetear estado interno si es necesario
  ngOnChanges(changes: { [key: string]: SimpleChange }) {
    if (changes['items'] && !changes['items'].firstChange) {
      // Resetear estado interno cuando los items cambian (por ejemplo, después de agregar nuevos registros)
      this.resetInternalState();
    }
  }

  // Outputs
  itemEliminado = output<string>();
  itemAEditar = output<NotaCreditoItem>();
  itemsCleared = output<void>();
  itemsExitososEliminados = output<string[]>();

  // Estado de carga
  isLoading = false;

  displayedColumns = ['cliente', 'ruc', 'nroFactura', 'monto', 'fecha', 'descripcion', 'puntos', 'acciones', 'estado'];

  obtenerNombreCorto(nombreCompleto: string): string {
    return this.clienteService.obtenerNombreCorto(nombreCompleto);
  }

  formatearMonto(monto: number | string): string {
    return (typeof monto === 'string' ? parseFloat(monto) : monto).toFixed(2);
  }

  formatearFecha(fecha: string): string {
    // Si ya está en formato YYYY-MM-DD, convertir directamente sin crear Date
    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      const [year, month, day] = fecha.split('-');
      return `${day}/${month}/${year}`;
    }
    
    // Para otros formatos, usar Date pero ajustando para zona horaria
    const date = new Date(fecha);
    // Usar UTC methods para evitar conversión de zona horaria
    return `${date.getUTCDate().toString().padStart(2, '0')}/${(date.getUTCMonth() + 1).toString().padStart(2, '0')}/${date.getUTCFullYear()}`;
  }

  eliminarItem(id: string) {
    this.itemEliminado.emit(id);
  }

  limpiarTodos() {
    this.itemsCleared.emit();
  }

  enviar() {
    // Iniciar loader
    this.isLoading = true;

    // Transformar items al formato NotaCreditoItemResponse[]
    const datosResponse: NotaCreditoItemResponse[] = this.items().map(item => ({
      fechaFactura: this.formatearFecha(item.fechaFactura),
      numFactura: item.nroFactura,
      descripcion: item.descripcion,
      numDocumento: item.cliente.Ruc,
      montoFactura: item.montoFactura.toString(),
      puntos: item.puntosEquivalentes.toString(),
    }));

    this.notaCreditoService.enviarNotaCredito(datosResponse).subscribe({
      next: (responses: any[]) => {
        // Detener loader
        this.isLoading = false;

        // Procesar cada respuesta
        const itemsActuales = [...this.items()];
        const itemsAEliminar: string[] = [];
        
        responses.forEach((response) => {
          const itemIndex = itemsActuales.findIndex(item => item.nroFactura === response.numFactura);
          if (itemIndex !== -1) {
            if (response.codigo === 1) {
              // Éxito: marcar para eliminar
              itemsAEliminar.push(response.numFactura);
            } else {
              // Error: actualizar estado y mensaje
              itemsActuales[itemIndex].estado = 'error';
              itemsActuales[itemIndex].mensajeError = response.mensaje;
            }
          }
        });

        // Eliminar solo los items exitosos (codigo=1) y mantener los errores
        const itemsFiltrados = itemsActuales.filter(item => !itemsAEliminar.includes(item.nroFactura));
        this.itemsInternal.set(itemsFiltrados);
        
        // Notificar al componente padre sobre los cambios
        // Emitir los items exitosos para que se eliminen del array original
        if (itemsAEliminar.length > 0) {
          this.itemsExitososEliminados.emit(itemsAEliminar);
        }
        
        // Solo emitir itemsCleared si todos los items fueron procesados exitosamente
        if (itemsAEliminar.length === this.items().length && itemsFiltrados.length === 0) {
          this.itemsCleared.emit();
        }

        // Forzar detección de cambios para actualizar la UI
        this.cdr.detectChanges();

        // Mostrar resumen
        const exitosos = itemsAEliminar.length;
        const errores = itemsFiltrados.filter(item => item.estado === 'error').length;
        let mensaje = `Proceso completado:\n- ${exitosos} enviados exitosamente\n- ${errores} con errores`;
        
        if (errores > 0) {
          mensaje += '\n\nRevisa los íconos de error en la tabla para ver los detalles.';
        }

        this.dialog.open(Alert, {
          data: {
            title: 'Resultado del Envío',
            message: mensaje,
            type: errores > 0 ? 'warning' : 'success'
          }
        });
      },
      error: (error) => {
        // Detener loader
        this.isLoading = false;

        // Forzar detección de cambios para actualizar la UI
        this.cdr.detectChanges();

        // Mostrar alert personalizado con el error
        this.dialog.open(Alert, {
          data: {
            title: 'Error al Enviar',
            message: JSON.stringify(error, null, 2),
            type: 'error'
          }
        });

        console.error('Error al enviar:', error);
      }
    });
  }

  editarItem(id: string) {
    const item = this.items().find(item => item.id === id);
    if (item) {
      // Emitir el item para que el componente padre lo cargue en el formulario
      this.itemAEditar.emit(item);
    }
  }

  mostrarMensajeError(item: NotaCreditoItem) {
    if (item.mensajeError) {
      this.dialog.open(Alert, {
        data: {
          title: 'Error en Factura ' + item.nroFactura,
          message: item.mensajeError,
          type: 'error'
        }
      });
    }
  }
}