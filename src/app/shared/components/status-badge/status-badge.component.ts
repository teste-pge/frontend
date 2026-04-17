import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { RideStatus } from '@core/models';

interface BadgeConfig {
    label: string;
    color: string;
    background: string;
}

const STATUS_MAP: Record<RideStatus, BadgeConfig> = {
    PENDING: { label: 'Aguardando motorista', color: '#856404', background: '#fff3cd' },
    ACCEPTED: { label: 'Aceita', color: '#155724', background: '#d4edda' },
    REJECTED: { label: 'Rejeitada', color: '#721c24', background: '#f8d7da' },
    CANCELLED: { label: 'Cancelada', color: '#383d41', background: '#e2e3e5' },
    COMPLETED: { label: 'Concluída', color: '#004085', background: '#cce5ff' },
};

@Component({
    selector: 'app-status-badge',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <span
      class="badge"
      [style.color]="config().color"
      [style.background]="config().background"
    >
      {{ config().label }}
    </span>
  `,
    styles: `
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 13px;
      font-weight: 500;
      white-space: nowrap;
    }
  `,
})
export class StatusBadgeComponent {
    status = input.required<RideStatus>();
    config = computed(() => STATUS_MAP[this.status()]);
}
