import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { enviroment } from '../../assets/config';
import { Cliente } from '../models/nota-credito.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private http = inject(HttpClient);
  private readonly API_URL = enviroment.API_URL;

  buscarClientes(termino: string): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.API_URL}/${termino}`).pipe(
      map(clientes => this.filtrarSoloParticipantes(clientes))
    );
  }

  filtrarSoloParticipantes(clientes: Cliente[]): Cliente[] {
    return clientes.filter(cliente => cliente.ParticipantePlanPuntos);
  }

  obtenerNombreCorto(nombreCompleto: string): string {
    // Toma la primera parte antes del guión
    const partes = nombreCompleto.split(' - ');
    return partes[0].trim();
  }
  
  generarNumeroFactura(ruc: string, monto: number): string {
    //si es mayor a 999 tomar solo los tres primeros digitos, sino tomar todos sin parte decimal
    const montoStr = monto > 999 ? monto.toString().substring(0, 3) : monto.toString().split('.')[0];
    return `A${ruc}${montoStr}`;
  }
}