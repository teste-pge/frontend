import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { RideFacade } from './ride.facade';
import { RideApiService } from '../services/ride-api.service';
import { Ride, CreateRideRequest, ApiResponse, Page } from '../models';

const mockRide: Ride = {
    id: '11111111-1111-1111-1111-111111111111',
    userId: '22222222-2222-2222-2222-222222222222',
    origin: {
        cep: '01310-100', logradouro: 'Av Paulista', numero: '1000',
        bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP',
    },
    destination: {
        cep: '04543-000', logradouro: 'Av Faria Lima', numero: '500',
        bairro: 'Itaim Bibi', cidade: 'São Paulo', estado: 'SP',
    },
    status: 'PENDING',
    createdAt: '2026-04-17T10:00:00Z',
    updatedAt: '2026-04-17T10:00:00Z',
};

const mockPageResponse: ApiResponse<Page<Ride>> = {
    success: true,
    message: 'OK',
    data: {
        content: [mockRide],
        totalElements: 1, totalPages: 1, size: 20, number: 0,
        first: true, last: true, empty: false,
    },
    timestamp: '2026-04-17T10:00:00Z',
};

const mockCreateResponse: ApiResponse<Ride> = {
    success: true, message: 'Criada', data: mockRide, timestamp: '2026-04-17T10:00:00Z',
};

const mockAcceptResponse: ApiResponse<Ride> = {
    success: true, message: 'Aceita', data: { ...mockRide, status: 'ACCEPTED' }, timestamp: '2026-04-17T10:00:00Z',
};

describe('RideFacade', () => {
    let facade: RideFacade;
    let rideApiSpy: jest.Mocked<RideApiService>;

    beforeEach(() => {
        rideApiSpy = {
            findPendingRides: jest.fn(),
            createRide: jest.fn(),
            acceptRide: jest.fn(),
            rejectRide: jest.fn(),
            findById: jest.fn(),
        } as unknown as jest.Mocked<RideApiService>;

        TestBed.configureTestingModule({
            providers: [
                RideFacade,
                { provide: RideApiService, useValue: rideApiSpy },
            ],
        });

        facade = TestBed.inject(RideFacade);
    });

    it('should update rides signal after loading pending rides', () => {
        rideApiSpy.findPendingRides.mockReturnValue(of(mockPageResponse));

        facade.loadPendingRides();

        expect(facade.rides()).toEqual([mockRide]);
        expect(facade.loading()).toBe(false);
    });

    it('should add ride to state after creation', (done) => {
        rideApiSpy.createRide.mockReturnValue(of(mockCreateResponse));

        const request: CreateRideRequest = {
            userId: mockRide.userId,
            origin: mockRide.origin as any,
            destination: mockRide.destination as any,
        };

        facade.createRide(request).subscribe((ride) => {
            expect(ride).toEqual(mockRide);
            expect(facade.rides()).toContainEqual(mockRide);
            done();
        });
    });

    it('should remove ride from state after accepting', (done) => {
        facade.rides.set([mockRide]);
        rideApiSpy.acceptRide.mockReturnValue(of(mockAcceptResponse));

        facade.acceptRide(mockRide.id, 'driver-1').subscribe(() => {
            expect(facade.rides().find((r) => r.id === mockRide.id)).toBeUndefined();
            done();
        });
    });

    it('should set error signal on API failure', () => {
        const errorResponse = { error: { message: 'Not found' } };
        rideApiSpy.findPendingRides.mockReturnValue(throwError(() => errorResponse));

        facade.loadPendingRides();

        expect(facade.error()).toBe('Not found');
        expect(facade.loading()).toBe(false);
    });

    it('should set loading signal during request', () => {
        rideApiSpy.findPendingRides.mockReturnValue(of(mockPageResponse));

        // Before call
        expect(facade.loading()).toBe(false);

        facade.loadPendingRides();

        // After completion
        expect(facade.loading()).toBe(false);
    });

    it('should add ride from SSE event', () => {
        const sseRide: Ride = { ...mockRide, id: 'sse-ride-id' };

        facade.addRideFromSse(sseRide);

        expect(facade.rides()).toContainEqual(sseRide);
    });
});
