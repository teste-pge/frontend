import { Injectable, NgZone, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '@env';

export type SseConnectionStatus = 'connected' | 'disconnected' | 'connecting';

export interface SseEvent {
  type: string;
  data: Record<string, unknown>;
}

@Injectable({ providedIn: 'root' })
export class SseService {
  private readonly zone = inject(NgZone);
  private driverEventSource: EventSource | null = null;
  private passengerEventSource: EventSource | null = null;

  readonly connectionStatus = signal<SseConnectionStatus>('disconnected');
  readonly passengerConnectionStatus = signal<SseConnectionStatus>('disconnected');

  connect(driverId: string): Observable<SseEvent> {
    return new Observable<SseEvent>((subscriber) => {
      this.disconnectDriver();
      this.connectionStatus.set('connecting');

      const url = `${environment.sseUrl}/drivers/${driverId}/stream`;

      this.zone.runOutsideAngular(() => {
        this.driverEventSource = new EventSource(url);

        this.driverEventSource.addEventListener('CONNECTED', (event: MessageEvent) => {
          this.zone.run(() => {
            this.connectionStatus.set('connected');
            subscriber.next({ type: 'CONNECTED', data: JSON.parse(event.data) });
          });
        });

        this.driverEventSource.addEventListener('NEW_RIDE', (event: MessageEvent) => {
          this.zone.run(() => {
            subscriber.next({ type: 'NEW_RIDE', data: JSON.parse(event.data) });
          });
        });

        this.driverEventSource.addEventListener('RIDE_ACCEPTED', (event: MessageEvent) => {
          this.zone.run(() => {
            subscriber.next({ type: 'RIDE_ACCEPTED', data: JSON.parse(event.data) });
          });
        });

        this.driverEventSource.onerror = () => {
          this.zone.run(() => {
            this.connectionStatus.set('disconnected');
          });
        };
      });

      return () => {
        this.disconnectDriver();
      };
    });
  }

  connectPassenger(userId: string): Observable<SseEvent> {
    return new Observable<SseEvent>((subscriber) => {
      this.disconnectPassenger();
      this.passengerConnectionStatus.set('connecting');

      const url = `${environment.sseUrl}/passengers/${userId}/stream`;

      this.zone.runOutsideAngular(() => {
        this.passengerEventSource = new EventSource(url);

        this.passengerEventSource.addEventListener('CONNECTED', (event: MessageEvent) => {
          this.zone.run(() => {
            this.passengerConnectionStatus.set('connected');
            subscriber.next({ type: 'CONNECTED', data: JSON.parse(event.data) });
          });
        });

        this.passengerEventSource.addEventListener('RIDE_ACCEPTED', (event: MessageEvent) => {
          this.zone.run(() => {
            subscriber.next({ type: 'RIDE_ACCEPTED', data: JSON.parse(event.data) });
          });
        });

        this.passengerEventSource.addEventListener('RIDE_COMPLETED', (event: MessageEvent) => {
          this.zone.run(() => {
            subscriber.next({ type: 'RIDE_COMPLETED', data: JSON.parse(event.data) });
          });
        });

        this.passengerEventSource.onerror = () => {
          this.zone.run(() => {
            this.passengerConnectionStatus.set('disconnected');
          });
        };
      });

      return () => {
        this.disconnectPassenger();
      };
    });
  }

  disconnect(): void {
    this.disconnectDriver();
    this.disconnectPassenger();
  }

  private disconnectDriver(): void {
    if (this.driverEventSource) {
      this.driverEventSource.close();
      this.driverEventSource = null;
      this.connectionStatus.set('disconnected');
    }
  }

  private disconnectPassenger(): void {
    if (this.passengerEventSource) {
      this.passengerEventSource.close();
      this.passengerEventSource = null;
      this.passengerConnectionStatus.set('disconnected');
    }
  }
}
