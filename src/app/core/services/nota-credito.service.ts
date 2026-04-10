import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotaCreditoRequest, NotaCreditoItemResponse } from '../models/nota-credito.model';

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

  enviarNotaCredito(datos: NotaCreditoItemResponse[]): Observable<any> {
    console.log(datos);

    // TODO: Reemplazar con llamada HTTP real
    // return this.http.post(`${this.API_URL}`, datos);

    //? respuesta del server
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ success: true, message: 'Nota de crédito creada' });
        observer.complete();
      }, 1000);
    });
  }
}