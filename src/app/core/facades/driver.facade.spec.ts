import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { DriverFacade } from './driver.facade';
import { DriverApiService } from '../services/driver-api.service';
import { ApiResponse, Driver } from '../models';

const mockDrivers: Driver[] = [
    { id: 'drv-1', name: 'Carlos Silva', vehiclePlate: 'ABC-1234', status: 'AVAILABLE' },
    { id: 'drv-2', name: 'Ana Souza', vehiclePlate: 'DEF-5678', status: 'BUSY' },
];

const mockResponse: ApiResponse<Driver[]> = {
    success: true, message: 'OK', data: mockDrivers, timestamp: '2026-04-17T10:00:00Z',
};

describe('DriverFacade', () => {
    let facade: DriverFacade;
    let driverApiSpy: jest.Mocked<DriverApiService>;

    beforeEach(() => {
        driverApiSpy = {
            findAll: jest.fn(),
            findAvailable: jest.fn(),
        } as unknown as jest.Mocked<DriverApiService>;

        TestBed.configureTestingModule({
            providers: [
                DriverFacade,
                { provide: DriverApiService, useValue: driverApiSpy },
            ],
        });

        facade = TestBed.inject(DriverFacade);
    });

    it('should update drivers signal after loading', () => {
        driverApiSpy.findAll.mockReturnValue(of(mockResponse));

        facade.loadDrivers();

        expect(facade.drivers()).toEqual(mockDrivers);
        expect(facade.loading()).toBe(false);
    });

    it('should load available drivers', () => {
        const availableResponse: ApiResponse<Driver[]> = {
            ...mockResponse,
            data: [mockDrivers[0]],
        };
        driverApiSpy.findAvailable.mockReturnValue(of(availableResponse));

        facade.loadAvailable();

        expect(facade.drivers()).toEqual([mockDrivers[0]]);
        expect(facade.loading()).toBe(false);
    });
});
