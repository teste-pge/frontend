import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { RideApiService } from './ride-api.service';
import { CreateRideRequest } from '../models';
import { environment } from '@env';

describe('RideApiService', () => {
  let service: RideApiService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/rides`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([])),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(RideApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should create a ride', () => {
    const request: CreateRideRequest = {
      userId: '550e8400-e29b-41d4-a716-446655440000',
      origin: {
        cep: '01310-100', logradouro: 'Av Paulista', numero: '1000',
        complemento: '', bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP',
      },
      destination: {
        cep: '04538-132', logradouro: 'Av Faria Lima', numero: '2000',
        complemento: '', bairro: 'Itaim Bibi', cidade: 'São Paulo', estado: 'SP',
      },
    };

    service.createRide(request).subscribe((res) => {
      expect(res.success).toBe(true);
      expect(res.data.id).toBeDefined();
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush({
      success: true,
      message: 'Corrida criada',
      data: { id: 'ride-1', ...request, status: 'PENDING', createdAt: '', updatedAt: '' },
      timestamp: new Date().toISOString(),
    });
  });

  it('should find pending rides with pagination', () => {
    service.findPendingRides(0, 10).subscribe((res) => {
      expect(res.data.content.length).toBe(1);
    });

    const req = httpMock.expectOne(`${baseUrl}?status=PENDING&page=0&size=10`);
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true, message: 'OK', timestamp: '',
      data: { content: [{ id: 'ride-1' }], totalElements: 1, totalPages: 1, size: 10, number: 0, first: true, last: true, empty: false },
    });
  });

  it('should accept a ride', () => {
    const rideId = 'ride-1';
    const driverId = 'driver-1';

    service.acceptRide(rideId, driverId).subscribe((res) => {
      expect(res.success).toBe(true);
    });

    const req = httpMock.expectOne(`${baseUrl}/${rideId}/accept`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ driverId });
    req.flush({ success: true, message: 'Aceita', data: { id: rideId, status: 'ACCEPTED' }, timestamp: '' });
  });
});
