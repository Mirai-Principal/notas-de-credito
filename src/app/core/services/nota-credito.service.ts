import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotaCreditoRequest, NotaCreditoItemResponse } from '../models/nota-credito.model';
import { enviroment } from '../../assets/config';

@Injectable({
  providedIn: 'root'
})
export class NotaCreditoService {
  private http = inject(HttpClient);
  private readonly API_URL = enviroment.API_URL_NOTA_CREDITO;

  // cálculo de puntos
  calcularPuntos(monto: number, FactorConversionPuntos: number): number {
    return Math.round(monto) * FactorConversionPuntos;
  }

  enviarNotaCredito(datos: NotaCreditoItemResponse[]): Observable<any> {
    console.log(datos);
    return this.http.post(`${this.API_URL}`, datos);
  }
}