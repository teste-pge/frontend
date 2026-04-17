import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';

import { AddressForm, ViaCepResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class CepService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://viacep.com.br/ws';

  lookup(cep: string): Observable<AddressForm | null> {
    const cleanCep = cep.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
      return of(null);
    }

    return this.http
      .get<ViaCepResponse>(`${this.baseUrl}/${cleanCep}/json`)
      .pipe(
        map((response) => {
          if (response.erro) {
            return null;
          }

          return {
            cep: this.formatCep(response.cep),
            logradouro: response.logradouro,
            numero: '',
            complemento: response.complemento || '',
            bairro: response.bairro,
            cidade: response.localidade,
            estado: response.uf,
          };
        })
      );
  }

  formatCep(value: string): string {
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 8) return value;
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
}
