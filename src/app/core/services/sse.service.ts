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
  private eventSource: EventSource | null = null;

  readonly connectionStatus = signal<SseConnectionStatus>('disconnected');

  connect(driverId: string): Observable<SseEvent> {
    return new Observable<SseEvent>((subscriber) => {
      this.disconnect();
      this.connectionStatus.set('connecting');

      const url = `${environment.sseUrl}/drivers/${driverId}/stream`;

      this.zone.runOutsideAngular(() => {
        this.eventSource = new EventSource(url);

        this.eventSource.addEventListener('CONNECTED', (event: MessageEvent) => {
          this.zone.run(() => {
            this.connectionStatus.set('connected');
            subscriber.next({ type: 'CONNECTED', data: JSON.parse(event.data) });
          });
        });

        this.eventSource.addEventListener('NEW_RIDE', (event: MessageEvent) => {
          this.zone.run(() => {
            subscriber.next({ type: 'NEW_RIDE', data: JSON.parse(event.data) });
          });
        });

        this.eventSource.addEventListener('RIDE_ACCEPTED', (event: MessageEvent) => {
          this.zone.run(() => {
            subscriber.next({ type: 'RIDE_ACCEPTED', data: JSON.parse(event.data) });
          });
        });

        this.eventSource.onerror = () => {
          this.zone.run(() => {
            this.connectionStatus.set('disconnected');
          });
        };
      });

      return () => {
        this.disconnect();
      };
    });
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.connectionStatus.set('disconnected');
    }
  }
}
