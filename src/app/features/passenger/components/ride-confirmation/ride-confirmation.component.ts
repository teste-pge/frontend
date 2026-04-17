import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

import { Ride } from '@core/models';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-ride-confirmation',
  standalone: true,
  imports: [DatePipe, MatCardModule, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card class="confirmation-card">
      <mat-card-header>
        <mat-card-title>🎉 Corrida Solicitada!</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="detail-row">
          <span class="label">ID:</span>
          <span class="value">{{ ride().id }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Status:</span>
          <app-status-badge [status]="ride().status" />
        </div>
        <div class="detail-row">
          <span class="label">Origem:</span>
          <span class="value">{{ ride().origin.displayString || formatAddress(ride().origin) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Destino:</span>
          <span class="value">{{ ride().destination.displayString || formatAddress(ride().destination) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Criada em:</span>
          <span class="value">{{ ride().createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    .confirmation-card {
      margin-top: 16px;
      background: #e8f5e9;
      border: 1px solid #a5d6a7;
    }
    .detail-row {
      display: flex;
      gap: 8px;
      padding: 6px 0;
      align-items: center;
    }
    .label {
      font-weight: 500;
      min-width: 80px;
      color: #555;
    }
    .value {
      color: #333;
    }
  `,
})
export class RideConfirmationComponent {
  ride = input.required<Ride>();

  formatAddress(addr: { logradouro?: string; numero?: string; bairro?: string; cidade?: string; estado?: string }): string {
    return `${addr.logradouro}, ${addr.numero} - ${addr.bairro}, ${addr.cidade}/${addr.estado}`;
  }
}
