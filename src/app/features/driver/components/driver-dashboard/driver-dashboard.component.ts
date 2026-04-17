import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

import { DriverFacade } from '@core/facades';
import { RideFacade } from '@core/facades';
import { SseService } from '@core/services/sse.service';
import { Ride } from '@core/models';
import { RideCardComponent } from '../ride-card/ride-card.component';
import { ConnectionStatusComponent } from '../connection-status/connection-status.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '@shared/components/error-message/error-message.component';

@Component({
  selector: 'app-driver-dashboard',
  standalone: true,
  imports: [
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSnackBarModule,
    RideCardComponent,
    ConnectionStatusComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
  ],
  templateUrl: './driver-dashboard.component.html',
  styleUrl: './driver-dashboard.component.scss',
})
export class DriverDashboardComponent implements OnInit, OnDestroy {
  readonly driverFacade = inject(DriverFacade);
  readonly rideFacade = inject(RideFacade);
  readonly sseService = inject(SseService);
  private readonly snackBar = inject(MatSnackBar);

  readonly selectedDriverId = signal<string | null>(null);

  private sseSubscription?: Subscription;

  ngOnInit(): void {
    this.driverFacade.loadDrivers();
  }

  onDriverSelected(driverId: string): void {
    this.disconnectSse();
    this.selectedDriverId.set(driverId);
    this.rideFacade.rides.set([]);
    this.rideFacade.error.set(null);

    this.rideFacade.loadPendingRides();

    this.sseSubscription = this.sseService.connect(driverId).subscribe({
      next: (event) => {
        if (event.type === 'NEW_RIDE' && event.data) {
          this.rideFacade.addRideFromSse(event.data as unknown as Ride);
          this.snackBar.open('🚗 Nova corrida disponível!', 'OK', { duration: 3000 });
        }
      },
      error: () => {
        this.snackBar.open('Conexão SSE perdida', 'OK', { duration: 5000 });
      },
    });
  }

  onAcceptRide(rideId: string): void {
    const driverId = this.selectedDriverId();
    if (!driverId) return;

    this.rideFacade.acceptRide(rideId, driverId).subscribe({
      next: () => {
        this.snackBar.open('✅ Corrida aceita!', 'OK', { duration: 3000 });
      },
      error: (err) => {
        const message =
          err?.status === 409
            ? 'Esta corrida já foi aceita por outro motorista.'
            : 'Erro ao aceitar corrida.';
        this.snackBar.open(message, 'OK', { duration: 5000 });
      },
    });
  }

  onRejectRide(rideId: string): void {
    const driverId = this.selectedDriverId();
    if (!driverId) return;

    this.rideFacade.rejectRide(rideId, driverId).subscribe({
      next: () => {
        this.snackBar.open('Corrida rejeitada.', 'OK', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Erro ao rejeitar corrida.', 'OK', { duration: 5000 });
      },
    });
  }

  ngOnDestroy(): void {
    this.disconnectSse();
  }

  private disconnectSse(): void {
    this.sseSubscription?.unsubscribe();
    this.sseService.disconnect();
  }
}
