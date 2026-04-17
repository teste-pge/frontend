import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

import { DriverFacade } from '@core/facades';
import { RideFacade } from '@core/facades';
import { SseService } from '@core/services/sse.service';
import { RideApiService } from '@core/services/ride-api.service';
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
  private readonly rideApi = inject(RideApiService);
  private readonly snackBar = inject(MatSnackBar);

  private readonly snackConfig = { duration: 3000, verticalPosition: 'top' as const, horizontalPosition: 'right' as const };

  readonly selectedDriverId = signal<string | null>(null);

  private sseSubscription?: Subscription;

  ngOnInit(): void {
    this.driverFacade.loadDrivers();
  }

  onDriverSelected(driverId: string): void {
    this.disconnectSse();
    this.selectedDriverId.set(driverId);
    this.rideFacade.rides.set([]);
    this.rideFacade.currentRide.set(null);
    this.rideFacade.error.set(null);

    this.rideFacade.loadActiveRideForDriver(driverId);
    this.rideFacade.loadPendingRides();

    this.sseSubscription = this.sseService.connect(driverId).subscribe({
      next: (event) => {
        if (event.type === 'NEW_RIDE' && event.data) {
          const rideId = event.data['rideId'] as string;
          if (rideId) {
            this.rideApi.findById(rideId).subscribe({
              next: (res) => {
                if (res.data) {
                  this.rideFacade.addRideFromSse(res.data);
                }
              },
            });
          }
          this.snackBar.open('🚗 Nova corrida disponível!', 'OK', this.snackConfig);
        }
        if (event.type === 'RIDE_ACCEPTED' && event.data) {
          const rideId = event.data['rideId'] as string;
          this.rideFacade.removeRide(rideId);
        }
      },
      error: () => {
        this.snackBar.open('Conexão SSE perdida', 'OK', { ...this.snackConfig, duration: 5000 });
      },
    });
  }

  onAcceptRide(rideId: string): void {
    const driverId = this.selectedDriverId();
    if (!driverId) return;

    this.rideFacade.acceptRide(rideId, driverId).subscribe({
      next: () => {
        this.snackBar.open('✅ Corrida aceita!', 'OK', this.snackConfig);
      },
      error: (err) => {
        const message =
          err?.status === 409
            ? 'Esta corrida já foi aceita por outro motorista.'
            : 'Erro ao aceitar corrida.';
        this.snackBar.open(message, 'OK', { ...this.snackConfig, duration: 5000 });
      },
    });
  }

  onRejectRide(rideId: string): void {
    const driverId = this.selectedDriverId();
    if (!driverId) return;

    this.rideFacade.rejectRide(rideId, driverId).subscribe({
      next: () => {
        this.snackBar.open('Corrida rejeitada.', 'OK', this.snackConfig);
      },
      error: () => {
        this.snackBar.open('Erro ao rejeitar corrida.', 'OK', { ...this.snackConfig, duration: 5000 });
      },
    });
  }

  onCompleteRide(rideId: string): void {
    const driverId = this.selectedDriverId();
    if (!driverId) return;

    this.rideFacade.completeRide(rideId, driverId).subscribe({
      next: () => {
        this.snackBar.open('🏁 Corrida finalizada!', 'OK', this.snackConfig);
      },
      error: () => {
        this.snackBar.open('Erro ao finalizar corrida.', 'OK', { ...this.snackConfig, duration: 5000 });
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
