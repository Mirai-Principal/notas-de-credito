import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-button-loader',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './button-loader.html',
  styleUrl: './button-loader.css',
})
export class ButtonLoader {
  // Inputs
  isLoading = input<boolean>(false);
  text = input<string>('Enviar');
  icon = input<string>('send');
  color = input<string>('accent');
  disabled = input<boolean>(false);
  
  // Outputs
  buttonClick = output<void>();
  
  onClick() {
    if (!this.isLoading() && !this.disabled()) {
      this.buttonClick.emit();
    }
  }
}
