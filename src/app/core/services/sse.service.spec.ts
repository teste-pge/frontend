import { TestBed } from '@angular/core/testing';
import { Subscription } from 'rxjs';

import { SseService, SseEvent } from './sse.service';

// Mock EventSource
class MockEventSource {
  static instance: MockEventSource;
  private listeners: Record<string, ((event: MessageEvent) => void)[]> = {};
  onerror: (() => void) | null = null;
  readyState = 0;

  constructor(public url: string) {
    MockEventSource.instance = this;
  }

  addEventListener(type: string, listener: (event: MessageEvent) => void): void {
    if (!this.listeners[type]) this.listeners[type] = [];
    this.listeners[type].push(listener);
  }

  dispatchEvent(type: string, data: unknown): void {
    const event = new MessageEvent(type, { data: JSON.stringify(data) });
    this.listeners[type]?.forEach((fn) => fn(event));
  }

  close(): void {
    this.readyState = 2;
  }
}

describe('SseService', () => {
  let service: SseService;
  let originalEventSource: typeof EventSource;

  beforeEach(() => {
    originalEventSource = globalThis.EventSource;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any)['EventSource'] = MockEventSource;

    TestBed.configureTestingModule({});
    service = TestBed.inject(SseService);
  });

  afterEach(() => {
    service.disconnect();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any)['EventSource'] = originalEventSource;
  });

  it('should connect and emit CONNECTED event', (done) => {
    const sub: Subscription = service.connect('driver-1').subscribe((event: SseEvent) => {
      expect(event.type).toBe('CONNECTED');
      expect(event.data['driverId']).toBe('driver-1');
      expect(service.connectionStatus()).toBe('connected');
      sub.unsubscribe();
      done();
    });

    expect(service.connectionStatus()).toBe('connecting');

    // Simulate server sending CONNECTED event
    MockEventSource.instance.dispatchEvent('CONNECTED', {
      message: 'Conexão estabelecida',
      driverId: 'driver-1',
      timestamp: new Date().toISOString(),
    });
  });

  it('should emit NEW_RIDE event', (done) => {
    const events: SseEvent[] = [];

    const sub = service.connect('driver-1').subscribe((event) => {
      events.push(event);
      if (event.type === 'NEW_RIDE') {
        expect(event.data['rideId']).toBe('ride-123');
        sub.unsubscribe();
        done();
      }
    });

    MockEventSource.instance.dispatchEvent('CONNECTED', { message: 'ok', driverId: 'driver-1', timestamp: '' });
    MockEventSource.instance.dispatchEvent('NEW_RIDE', {
      rideId: 'ride-123',
      userId: 'user-1',
      originDisplay: 'Av Paulista, 1000',
      destinationDisplay: 'Av Faria Lima, 2000',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    });
  });

  it('should emit RIDE_ACCEPTED event', (done) => {
    const events: SseEvent[] = [];
    const sub = service.connect('driver-1').subscribe((event) => {
      events.push(event);
      if (event.type === 'RIDE_ACCEPTED') {
        expect(event.data['rideId']).toBe('ride-456');
        sub.unsubscribe();
        done();
      }
    });

    MockEventSource.instance.dispatchEvent('CONNECTED', { message: 'ok', driverId: 'driver-1', timestamp: '' });
    MockEventSource.instance.dispatchEvent('RIDE_ACCEPTED', { rideId: 'ride-456' });
  });

  it('should set disconnected status on error', () => {
    service.connect('driver-1').subscribe({ error: () => { } });

    MockEventSource.instance.onerror?.();

    expect(service.connectionStatus()).toBe('disconnected');
  });

  it('should disconnect and close EventSource', () => {
    service.connect('driver-1').subscribe();
    const instance = MockEventSource.instance;

    service.disconnect();

    expect(instance.readyState).toBe(2);
    expect(service.connectionStatus()).toBe('disconnected');
  });
});
