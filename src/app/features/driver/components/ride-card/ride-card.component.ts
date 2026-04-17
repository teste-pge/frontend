import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { DatePipe, SlicePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Ride } from '@core/models';
import { StatusBadgeComponent } from '@shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-ride-card',
  standalone: true,
  imports: [DatePipe, SlicePipe, MatCardModule, MatButtonModule, MatIconModule, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ride-card.component.html',
  styleUrl: './ride-card.component.scss',
})
export class RideCardComponent {
  ride = input.required<Ride>();
  accept = output<string>();
  reject = output<string>();
  complete = output<string>();

  formatAddress(addr: Ride['origin']): string {
    return `${addr.logradouro}, ${addr.numero} - ${addr.bairro}, ${addr.cidade}/${addr.estado}`;
  }
}
