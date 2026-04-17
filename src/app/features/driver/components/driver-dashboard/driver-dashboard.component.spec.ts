import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, Subject, throwError } from 'rxjs';
import { signal } from '@angular/core';

import { DriverDashboardComponent } from './driver-dashboard.component';
import { DriverFacade } from '@core/facades';
import { RideFacade } from '@core/facades';
import { SseService, SseConnectionStatus, SseEvent } from '@core/services/sse.service';
import { RideApiService } from '@core/services/ride-api.service';
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
  const currentRideSignal = signal<Ride | null>(null);
  const loadingSignal = signal(false);
  const errorSignal = signal<string | null>(null);

  const mockDriverFacade = {
    drivers: signal(mockDrivers),
    loading: signal(false),
    loadDrivers: jest.fn(),
  };

  const mockRideFacade = {
    rides: ridesSignal,
    currentRide: currentRideSignal,
    loading: loadingSignal,
    error: errorSignal,
    loadPendingRides: jest.fn(),
    loadActiveRideForDriver: jest.fn(),
    acceptRide: jest.fn(),
    rejectRide: jest.fn(),
    completeRide: jest.fn(),
    addRideFromSse: jest.fn(),
    removeRide: jest.fn(),
  };

  let mockSseService: {
    connect: jest.Mock;
    disconnect: jest.Mock;
    connectionStatus: ReturnType<typeof signal<SseConnectionStatus>>;
  };

  const mockRideApiService = {
    findById: jest.fn().mockReturnValue(of({ success: true, data: mockRide })),
  };

  const mockSnackBar = {
    open: jest.fn(),
  };

  beforeEach(async () => {
    sseSubject = new Subject();
    mockSseService = {
      connect: jest.fn().mockReturnValue(sseSubject.asObservable()),
      disconnect: jest.fn(),
      connectionStatus: signal<SseConnectionStatus>('disconnected'),
    };

    ridesSignal.set([]);
    currentRideSignal.set(null);
    loadingSignal.set(false);
    errorSignal.set(null);
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [DriverDashboardComponent, NoopAnimationsModule],
      providers: [
        { provide: DriverFacade, useValue: mockDriverFacade },
        { provide: RideFacade, useValue: mockRideFacade },
        { provide: SseService, useValue: mockSseService },
        { provide: RideApiService, useValue: mockRideApiService },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DriverDashboardComponent);
    component = fixture.componentInstance;
    // Spy on the component's own snackBar instance (injected privately)
    jest.spyOn((component as any).snackBar, 'open');
    fixture.detectChanges();
  });

  it('should load available drivers on init', () => {
    expect(mockDriverFacade.loadDrivers).toHaveBeenCalled();
  });

  it('should connect to SSE when driver is selected', () => {
    component.onDriverSelected('driver-1');

    expect(mockSseService.connect).toHaveBeenCalledWith('driver-1');
    expect(mockRideFacade.loadPendingRides).toHaveBeenCalled();
    expect(mockRideFacade.loadActiveRideForDriver).toHaveBeenCalledWith('driver-1');
  });

  it('should fetch full ride from API when SSE NEW_RIDE event received', () => {
    mockRideApiService.findById.mockReturnValue(of({ success: true, data: mockRide }));
    component.onDriverSelected('driver-1');
    sseSubject.next({ type: 'NEW_RIDE', data: { rideId: 'ride-1' } });

    expect(mockRideApiService.findById).toHaveBeenCalledWith('ride-1');
    expect(mockRideFacade.addRideFromSse).toHaveBeenCalledWith(mockRide);
  });

  it('should remove ride from list on SSE RIDE_ACCEPTED event', () => {
    component.onDriverSelected('driver-1');
    sseSubject.next({ type: 'RIDE_ACCEPTED', data: { rideId: 'ride-1' } });

    expect(mockRideFacade.removeRide).toHaveBeenCalledWith('ride-1');
  });

  it('should remove ride from list after accepting', () => {
    mockRideFacade.acceptRide.mockReturnValue(of(mockRide));
    component.selectedDriverId.set('driver-1');

    component.onAcceptRide('ride-1');

    expect(mockRideFacade.acceptRide).toHaveBeenCalledWith('ride-1', 'driver-1');
  });

  it('should show conflict error when ride already accepted (409)', () => {
    mockRideFacade.acceptRide.mockReturnValue(throwError(() => ({ status: 409 })));
    component.selectedDriverId.set('driver-1');
    component.onAcceptRide('ride-1');

    expect((component as any).snackBar.open).toHaveBeenCalledWith(
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

  it('should not call acceptRide when no driver is selected', () => {
    component.selectedDriverId.set(null);
    component.onAcceptRide('ride-1');
    expect(mockRideFacade.acceptRide).not.toHaveBeenCalled();
  });

  it('should not call rejectRide when no driver is selected', () => {
    component.selectedDriverId.set(null);
    component.onRejectRide('ride-1');
    expect(mockRideFacade.rejectRide).not.toHaveBeenCalled();
  });

  it('should call rejectRide and show success snackbar', () => {
    mockRideFacade.rejectRide.mockReturnValue(of(undefined));
    component.selectedDriverId.set('driver-1');

    component.onRejectRide('ride-1');

    expect(mockRideFacade.rejectRide).toHaveBeenCalledWith('ride-1', 'driver-1');
    expect((component as any).snackBar.open).toHaveBeenCalledWith('Corrida rejeitada.', 'OK', expect.objectContaining({ duration: 3000 }));
  });

  it('should show error snackbar on rejectRide failure', () => {
    mockRideFacade.rejectRide.mockReturnValue(throwError(() => ({ status: 500 })));
    component.selectedDriverId.set('driver-1');

    component.onRejectRide('ride-1');

    expect((component as any).snackBar.open).toHaveBeenCalledWith('Erro ao rejeitar corrida.', 'OK', expect.objectContaining({ duration: 5000 }));
  });

  it('should show success snackbar on acceptRide success', () => {
    mockRideFacade.acceptRide.mockReturnValue(of(mockRide));
    component.selectedDriverId.set('driver-1');

    component.onAcceptRide('ride-1');

    expect((component as any).snackBar.open).toHaveBeenCalledWith('✅ Corrida aceita!', 'OK', expect.objectContaining({ duration: 3000 }));
  });

  it('should show generic error on acceptRide non-409 failure', () => {
    mockRideFacade.acceptRide.mockReturnValue(throwError(() => ({ status: 500 })));
    component.selectedDriverId.set('driver-1');

    component.onAcceptRide('ride-1');

    expect((component as any).snackBar.open).toHaveBeenCalledWith('Erro ao aceitar corrida.', 'OK', expect.objectContaining({ duration: 5000 }));
  });

  it('should show SSE error snackbar on SSE connection error', () => {
    component.onDriverSelected('driver-1');

    sseSubject.error(new Error('connection lost'));

    expect((component as any).snackBar.open).toHaveBeenCalledWith('Conexão SSE perdida', 'OK', expect.objectContaining({ duration: 5000 }));
  });

  it('should disconnect previous SSE when selecting new driver', () => {
    component.onDriverSelected('driver-1');
    component.onDriverSelected('driver-2');
    expect(mockSseService.disconnect).toHaveBeenCalled();
  });

  it('should not call completeRide when no driver is selected', () => {
    component.selectedDriverId.set(null);
    component.onCompleteRide('ride-1');
    expect(mockRideFacade.completeRide).not.toHaveBeenCalled();
  });

  it('should call completeRide and show success snackbar', () => {
    mockRideFacade.completeRide.mockReturnValue(of(mockRide));
    component.selectedDriverId.set('driver-1');

    component.onCompleteRide('ride-1');

    expect(mockRideFacade.completeRide).toHaveBeenCalledWith('ride-1', 'driver-1');
    expect((component as any).snackBar.open).toHaveBeenCalledWith('🏁 Corrida finalizada!', 'OK', expect.objectContaining({ duration: 3000 }));
  });

  it('should show error snackbar on completeRide failure', () => {
    mockRideFacade.completeRide.mockReturnValue(throwError(() => ({ status: 500 })));
    component.selectedDriverId.set('driver-1');

    component.onCompleteRide('ride-1');

    expect((component as any).snackBar.open).toHaveBeenCalledWith('Erro ao finalizar corrida.', 'OK', expect.objectContaining({ duration: 5000 }));
  });
});
