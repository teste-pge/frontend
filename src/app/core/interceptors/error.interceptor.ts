import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import { ApiError } from '../models';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  // Pula interceptação para requisições ao ViaCEP (API externa)
  if (req.url.includes('viacep.com.br')) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message: string;

      if (error.error && typeof error.error === 'object' && 'errorCode' in error.error) {
        const apiError = error.error as ApiError;
        message = apiError.message;
      } else {
        switch (error.status) {
          case 0:
            message = 'Servidor indisponível. Verifique sua conexão.';
            break;
          case 400:
            message = 'Requisição inválida.';
            break;
          case 404:
            message = 'Recurso não encontrado.';
            break;
          case 409:
            message = 'Conflito: o recurso já foi modificado.';
            break;
          case 500:
            message = 'Erro interno do servidor.';
            break;
          default:
            message = `Erro inesperado (${error.status}).`;
        }
      }

      console.error(`[HTTP Error] ${error.status} - ${message}`, error);
      return throwError(() => ({ ...error, userMessage: message }));
    })
  );
};
