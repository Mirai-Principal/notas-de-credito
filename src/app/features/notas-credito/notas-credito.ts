import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { NotaCreditoFormComponent } from './components/nota-credito-form/nota-credito-form';
import { NotaCreditoTablaComponent } from './components/nota-credito-tabla/nota-credito-tabla';
import { NotaCreditoItem } from '../../core/models/nota-credito.model';

@Component({
  selector: 'app-notas-credito',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    NotaCreditoTablaComponent
  ],
  templateUrl: './notas-credito.html',
  styleUrl: './notas-credito.css'
})
export class NotasCreditoComponent {
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);
  items: NotaCreditoItem[] = [];

  onItemAgregado(item: NotaCreditoItem) {
    this.items = [...this.items, item];
  }

  onItemEliminado(id: string) {
    this.items = this.items.filter(item => item.id !== id);
  }

  abrirModal(item?: NotaCreditoItem) {
    const dialogRef = this.dialog.open(NotaCreditoFormComponent, {
      width: '600px',
      data: item || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Si hay resultado, procesarlo (agregar nuevo o editar existente)
        // Usar setTimeout para evitar NG0100 ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          if (item && item.id) {
            // Es edición: reemplazar el item existente
            this.items = this.items.map(i => i.id === item.id ? result : i);
          } else {
            // Es nuevo: agregar al array
            this.items = [...this.items, result];
          }
          // Forzar detección de cambios para actualizar la UI
          this.cdr.detectChanges();
        }, 0);
      }
      // Si result es null (cancelado), no hacer nada - el registro original se conserva
    });
  }

  onItemAEditar(item: NotaCreditoItem) {
    this.abrirModal(item);
  }

  // limpia el array de items
  onItemsCleared() {
    this.items = [];
  }
}