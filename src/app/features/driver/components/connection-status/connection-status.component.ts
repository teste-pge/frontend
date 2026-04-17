import { Component, ChangeDetectionStrategy, input } from '@angular/core';

import { SseConnectionStatus } from '@core/services/sse.service';

@Component({
    selector: 'app-connection-status',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './connection-status.component.html',
    styleUrl: './connection-status.component.scss',
})
export class ConnectionStatusComponent {
    status = input.required<SseConnectionStatus>();

    private readonly labels: Record<SseConnectionStatus, string> = {
        connected: 'Online',
        disconnected: 'Offline',
        connecting: 'Conectando...',
    };

    get statusLabel(): string {
        return this.labels[this.status()];
    }
}
