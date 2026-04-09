import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotaCreditoRequest } from '../models/nota-credito.model';

@Injectable({
  providedIn: 'root'
})
export class NotaCreditoService {
  private http = inject(HttpClient);
  private readonly API_URL = 'api/notas-credito'; // Cambiar api de destino

  // cálculo de puntos

  calcularPuntos(monto: number, FactorConversionPuntos: number): number {
    return Math.round(monto) * FactorConversionPuntos;
  }

  enviarNotaCredito(datos: NotaCreditoRequest): Observable<any> {
    console.log('📤 Enviando nota de crédito:', JSON.stringify(datos, null, 2));

    // TODO: Reemplazar con llamada HTTP real
    // return this.http.post(`${this.API_URL}`, datos);

    // Por ahora solo log
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ success: true, message: 'Nota de crédito creada' });
        observer.complete();
      }, 1000);
    });
  }
}