import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-alert',
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: './alert.html',
  styleUrl: './alert.css',
})
export class Alert {
  dialogRef = inject(MatDialogRef<Alert>);
  data = inject(MAT_DIALOG_DATA);

  get title(): string {
    return this.data?.title || 'Alerta';
  }

  get message(): string {
    return this.data?.message || '';
  }

  get type(): 'success' | 'error' | 'info' | 'warning' {
    return this.data?.type || 'info';
  }

  get alertClass(): string {
    return `alert-${this.type}`;
  }

  get icon(): string {
    switch (this.type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  }

  close() {
    this.dialogRef.close();
  }
}
