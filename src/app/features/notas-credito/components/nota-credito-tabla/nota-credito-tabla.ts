import { Component, input, output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { NotaCreditoItem, NotaCreditoRequest } from '../../../../core/models/nota-credito.model';
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
    MatCardModule
  ],
  templateUrl: './nota-credito-tabla.html',
  styleUrl: './nota-credito-tabla.css'

})

export class NotaCreditoTablaComponent {

  private notaCreditoService = inject(NotaCreditoService);
  private clienteService = inject(ClienteService);

  // Inputs
  items = input.required<NotaCreditoItem[]>();

  // Outputs
  itemEliminado = output<string>();
  itemAEditar = output<NotaCreditoItem>();
  enviarNotas = output<void>();

  // Computed
  totalMonto = computed(() =>
    this.items().reduce((sum, item) => sum + item.montoFactura, 0)
  );

  totalPuntos = computed(() =>
    this.items().reduce((sum, item) => sum + item.puntosEquivalentes, 0)
  );

  displayedColumns = ['cliente', 'nroFactura', 'monto', 'fecha', 'puntos', 'acciones'];

  obtenerNombreCorto(nombreCompleto: string): string {
    return this.clienteService.obtenerNombreCorto(nombreCompleto);
  }

  eliminarItem(id: string) {
    this.itemEliminado.emit(id);
  }

  enviar() {
    const request: NotaCreditoRequest = {
      items: this.items(),
      total: this.totalMonto(),
      fechaCreacion: new Date().toISOString()
    };

    this.notaCreditoService.enviarNotaCredito(request).subscribe({
      next: (response) => {
        console.log('✅ Respuesta del servidor:', response);
        this.enviarNotas.emit();
      },
      error: (error) => {
        console.error('❌ Error al enviar:', error);
      }
    });
  }

  editarItem(id: string) {
    const item = this.items().find(item => item.id === id);
    if (item) {
      // Emitir el item para que el componente padre lo cargue en el formulario
      this.itemAEditar.emit(item);
      // Eliminar el item de la lista actual
      this.itemEliminado.emit(id);
    }
  }
}