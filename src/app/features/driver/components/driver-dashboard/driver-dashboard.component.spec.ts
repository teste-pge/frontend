import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, Subject, throwError } from 'rxjs';
import { signal } from '@angular/core';

import { DriverDashboardComponent } from './driver-dashboard.component';
import { DriverFacade } from '@core/facades';
import { RideFacade } from '@core/facades';
import { SseService, SseConnectionStatus, SseEvent } from '@core/services/sse.service';
import { Ride } from '@core/models';
import { Driver } from '@core/models';

const mockDrivers: Driver[] = [
    { id: 'driver-1', name: 'Carlos', vehiclePlate: 'ABC-1234', status: 'AVAILABLE' },
    { id: 'driver-2', name: 'Ana', vehiclePlate: 'DEF-5678', status: 'AVAILABLE' },
];

const mockRide: Ride = {
    id: 'ride-1',
    userId: 'user-1',
    origin: {
        cep: '01310-100',
        logradouro: 'Av Paulista',
        numero: '1000',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'SP',
        displayString: 'Av Paulista, 1000 - Bela Vista, São Paulo/SP',
    },
    destination: {
        cep: '20040-020',
        logradouro: 'Av Rio Branco',
        numero: '1',
        bairro: 'Centro',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        displayString: 'Av Rio Branco, 1 - Centro, Rio de Janeiro/RJ',
    },
    status: 'PENDING',
    createdAt: '2026-04-17T10:00:00Z',
    updatedAt: '2026-04-17T10:00:00Z',
};

describe('DriverDashboardComponent', () => {
    let component: DriverDashboardComponent;
    let fixture: ComponentFixture<DriverDashboardComponent>;
    let sseSubject: Subject<SseEvent>;

    const ridesSignal = signal<Ride[]>([]);
    const loadingSignal = signal(false);
    const errorSignal = signal<string | null>(null);

    const mockDriverFacade = {
        drivers: signal(mockDrivers),
        loading: signal(false),
        loadDrivers: jest.fn(),
    };

    const mockRideFacade = {
        rides: ridesSignal,
        loading: loadingSignal,
        error: errorSignal,
        loadPendingRides: jest.fn(),
        acceptRide: jest.fn(),
        rejectRide: jest.fn(),
        addRideFromSse: jest.fn(),
        removeRide: jest.fn(),
    };

    let mockSseService: {
        connect: jest.Mock;
        disconnect: jest.Mock;
        connectionStatus: ReturnType<typeof signal<SseConnectionStatus>>;
    };

    beforeEach(async () => {
        sseSubject = new Subject();
        mockSseService = {
            connect: jest.fn().mockReturnValue(sseSubject.asObservable()),
            disconnect: jest.fn(),
            connectionStatus: signal<SseConnectionStatus>('disconnected'),
        };

        ridesSignal.set([]);
        loadingSignal.set(false);
        errorSignal.set(null);
        jest.clearAllMocks();

        await TestBed.configureTestingModule({
            imports: [DriverDashboardComponent, NoopAnimationsModule],
            providers: [
                { provide: DriverFacade, useValue: mockDriverFacade },
                { provide: RideFacade, useValue: mockRideFacade },
                { provide: SseService, useValue: mockSseService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(DriverDashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should load available drivers on init', () => {
        expect(mockDriverFacade.loadDrivers).toHaveBeenCalled();
    });

    it('should connect to SSE when driver is selected', () => {
        component.onDriverSelected('driver-1');

        expect(mockSseService.connect).toHaveBeenCalledWith('driver-1');
        expect(mockRideFacade.loadPendingRides).toHaveBeenCalled();
    });

    it('should add new ride when SSE NEW_RIDE event received', () => {
        component.onDriverSelected('driver-1');
        sseSubject.next({ type: 'NEW_RIDE', data: mockRide as unknown as Record<string, unknown> });

        expect(mockRideFacade.addRideFromSse).toHaveBeenCalledWith(mockRide);
    });

    it('should remove ride from list after accepting', () => {
        mockRideFacade.acceptRide.mockReturnValue(of(mockRide));
        component.selectedDriverId.set('driver-1');

        component.onAcceptRide('ride-1');

        expect(mockRideFacade.acceptRide).toHaveBeenCalledWith('ride-1', 'driver-1');
    });

    it('should show conflict error when ride already accepted (409)', () => {
        const snack = (component as any).snackBar;
        const openSpy = jest.spyOn(snack, 'open');

        mockRideFacade.acceptRide.mockImplementation(() => ({
            subscribe: (observer: any) => {
                observer.error({ status: 409 });
                return { unsubscribe: jest.fn() };
            },
        }));
        component.selectedDriverId.set('driver-1');

        component.onAcceptRide('ride-1');

        expect(openSpy).toHaveBeenCalledWith(
            'Esta corrida já foi aceita por outro motorista.',
            'OK',
            expect.objectContaining({ duration: 5000 }),
        );
    });

    it('should disconnect SSE on destroy', () => {
        component.onDriverSelected('driver-1');
        component.ngOnDestroy();

        expect(mockSseService.disconnect).toHaveBeenCalled();
    });

    it('should show connection status indicator', () => {
        component.selectedDriverId.set('driver-1');
        fixture.detectChanges();

        const el: HTMLElement = fixture.nativeElement;
        expect(el.querySelector('app-connection-status')).toBeTruthy();
    });
});
