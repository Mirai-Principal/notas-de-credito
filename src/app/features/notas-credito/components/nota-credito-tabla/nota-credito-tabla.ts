import { Component, input, output, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
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
    MatProgressSpinnerModule
  ],
  templateUrl: './nota-credito-tabla.html',
  styleUrl: './nota-credito-tabla.css'

})

export class NotaCreditoTablaComponent {

  private notaCreditoService = inject(NotaCreditoService);
  private clienteService = inject(ClienteService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  // Inputs
  items = input.required<NotaCreditoItem[]>();

  // Outputs
  itemEliminado = output<string>();
  itemAEditar = output<NotaCreditoItem>();
  itemsCleared = output<void>();

  // Estado de carga
  isLoading = false;

  displayedColumns = ['cliente', 'nroFactura', 'monto', 'fecha', 'descripcion', 'puntos', 'acciones'];

  obtenerNombreCorto(nombreCompleto: string): string {
    return this.clienteService.obtenerNombreCorto(nombreCompleto);
  }

  formatearMonto(monto: number | string): string {
    return (typeof monto === 'string' ? parseFloat(monto) : monto).toFixed(2);
  }

  formatearFecha(fecha: string): string {
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) return fecha;
    const date = new Date(fecha);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  }

  eliminarItem(id: string) {
    this.itemEliminado.emit(id);
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
      puntos: item.puntosEquivalentes.toString()
    }));

    this.notaCreditoService.enviarNotaCredito(datosResponse).subscribe({
      next: (response) => {
        // Detener loader
        this.isLoading = false;

        // Forzar detección de cambios para actualizar la UI
        this.cdr.detectChanges();

        // Mostrar alert personalizado con la respuesta del servidor
        this.dialog.open(Alert, {
          data: {
            title: 'Respuesta del Servidor',
            message: JSON.stringify(response, null, 2),
            type: 'success'
          }
        });

        // Notificar al componente padre que limpie los items
        this.itemsCleared.emit();
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
}