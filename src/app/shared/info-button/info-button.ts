import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-info-button',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './info-button.html',
  styleUrl: './info-button.css'
})
export class InfoButtonComponent {
  // Inputs configurables
  icon = input.required<string>();
  color = input<'primary' | 'accent' | 'warn'>('primary');
  tooltipText = input<string>('');
  tooltipPosition = input<'above' | 'below' | 'left' | 'right'>('above');
  ariaLabel = input<string>('');
  cssClass = input<string>('');
  
  // Output para el evento click
  onClick = output<void>();
}
