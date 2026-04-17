import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { CepService } from './cep.service';

describe('CepService', () => {
  let service: CepService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([])),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(CepService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should return AddressForm for a valid CEP', () => {
    service.lookup('01310-100').subscribe((result) => {
      expect(result).toBeTruthy();
      expect(result!.cidade).toBe('São Paulo');
      expect(result!.estado).toBe('SP');
      expect(result!.cep).toBe('01310-100');
    });

    const req = httpMock.expectOne('https://viacep.com.br/ws/01310100/json');
    expect(req.request.method).toBe('GET');
    req.flush({
      cep: '01310100',
      logradouro: 'Avenida Paulista',
      complemento: '',
      bairro: 'Bela Vista',
      localidade: 'São Paulo',
      uf: 'SP',
    });
  });

  it('should return null when CEP is not found', () => {
    service.lookup('00000-000').subscribe((result) => {
      expect(result).toBeNull();
    });

    const req = httpMock.expectOne('https://viacep.com.br/ws/00000000/json');
    req.flush({ erro: true });
  });
});
