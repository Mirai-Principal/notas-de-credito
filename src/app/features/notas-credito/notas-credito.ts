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
    this.cdr.detectChanges();
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
        if (item?.id) {
          // Es edición: actualizar el item existente
          const index = this.items.findIndex(i => i.id === item.id);
          if (index !== -1) {
            this.items[index] = result;
            // Forzar nueva referencia para detección de cambios
            this.items = [...this.items];
          }
        } else {
          // Es nuevo: agregar al array
          this.items = [...this.items, result];
        }
        this.cdr.detectChanges();
      }
    });
  }

  onItemAEditar(item: NotaCreditoItem) {
    this.abrirModal(item);
  }

  // limpia el array de items
  onItemsCleared() {
    this.items.length = 0;
  }
}