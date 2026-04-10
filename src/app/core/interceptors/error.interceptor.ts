import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  
  return next(req).pipe(
    retry(1), // Reintentar una vez en caso de error temporal
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Error desconocido';

      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMessage = `Error del cliente: ${error.error.message}`;
      } else {
        // Error del lado del servidor o de red
        switch (error.status) {
          case 0:
            errorMessage = 'No hay conexión a internet. Por favor, verifica tu conexión.';
            break;
          case 404:
            errorMessage = 'Recurso no encontrado. Verifica la URL del servidor.';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Intenta más tarde.';
            break;
          case 503:
            errorMessage = 'Servicio no disponible. Intenta más tarde.';
            break;
          default:
            errorMessage = `Error del servidor: ${error.status} - ${error.message}`;
        }
      }

      // Mostrar notificación al usuario
      snackBar.open(errorMessage, 'Cerrar', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });

      // Log para debugging
      console.error('Error HTTP:', error);

      return throwError(() => new Error(errorMessage));
    })
  );
};
