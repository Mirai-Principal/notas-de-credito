import { Component, signal } from '@angular/core';
import { NotasCreditoComponent } from './features/notas-credito/notas-credito';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NotasCreditoComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('plan_puntos');
}
