import { HttpInterceptorFn } from '@angular/common/http';
import { signal } from '@angular/core';
import { finalize } from 'rxjs';

let activeRequests = 0;

export const isLoading = signal(false);

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  // Pula contagem para requisições ao ViaCEP
  if (req.url.includes('viacep.com.br')) {
    return next(req);
  }

  activeRequests++;
  isLoading.set(true);

  return next(req).pipe(
    finalize(() => {
      activeRequests--;
      if (activeRequests === 0) {
        isLoading.set(false);
      }
    })
  );
};
