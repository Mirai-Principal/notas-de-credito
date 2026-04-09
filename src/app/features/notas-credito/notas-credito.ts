import { Component, inject } from '@angular/core';
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
    NotaCreditoFormComponent,
    NotaCreditoTablaComponent
  ],
  templateUrl: './notas-credito.html',
  styleUrl: './notas-credito.css'
})
export class NotasCreditoComponent {
  private dialog = inject(MatDialog);
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
        this.items = [...this.items, result];
      }
    });
  }

  onItemAEditar(item: NotaCreditoItem) {
    this.abrirModal(item);
  }

  onEnviarNotas() {
    console.log('🚀 Items a enviar:', this.items);
  }
}