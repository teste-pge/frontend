import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { DriverApiService } from './driver-api.service';
import { Driver } from '../models';
import { environment } from '@env';

describe('DriverApiService', () => {
  let service: DriverApiService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/drivers`;

  const mockDrivers: Driver[] = [
    { id: 'd1', name: 'João Silva', vehiclePlate: 'ABC-1234', status: 'AVAILABLE' },
    { id: 'd2', name: 'Maria Santos', vehiclePlate: 'DEF-5678', status: 'BUSY' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([])),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(DriverApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should find all drivers', () => {
    service.findAll().subscribe((res) => {
      expect(res.data.length).toBe(2);
      expect(res.data[0].name).toBe('João Silva');
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: 'OK', data: mockDrivers, timestamp: '' });
  });

  it('should find available drivers', () => {
    service.findAvailable().subscribe((res) => {
      expect(res.data.length).toBe(1);
      expect(res.data[0].status).toBe('AVAILABLE');
    });

    const req = httpMock.expectOne(`${baseUrl}/available`);
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true, message: 'OK', timestamp: '',
      data: [mockDrivers[0]],
    });
  });
});
