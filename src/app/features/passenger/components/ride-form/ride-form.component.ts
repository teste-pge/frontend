import { Component, ChangeDetectionStrategy, inject, signal, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

import { RideFacade } from '@core/facades';
import { Ride, CreateRideRequest } from '@core/models';
import { SseService } from '@core/services/sse.service';
import { AddressFormComponent } from '@shared/components/address-form/address-form.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '@shared/components/error-message/error-message.component';
import { RideConfirmationComponent } from '../ride-confirmation/ride-confirmation.component';
import { ConnectionStatusComponent } from '../../../driver/components/connection-status/connection-status.component';
import { uuidValidator, cepFormatValidator, brazilianStateValidator, differentAddressesValidator } from '@shared/validators';

export interface MockUser {
  id: string;
  name: string;
}

export const MOCK_USERS: MockUser[] = [
  { id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', name: 'João Silva' },
  { id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', name: 'Maria Santos' },
  { id: 'c3d4e5f6-a7b8-4c9d-8e1f-2a3b4c5d6e7f', name: 'Pedro Oliveira' },
  { id: 'd4e5f6a7-b8c9-4d0e-9f2a-3b4c5d6e7f8a', name: 'Ana Costa' },
  { id: 'e5f6a7b8-c9d0-4e1f-ab3b-4c5d6e7f8a9b', name: 'Lucas Ferreira' },
];

@Component({
  selector: 'app-ride-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    AddressFormComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    RideConfirmationComponent,
    ConnectionStatusComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ride-form.component.html',
  styleUrl: './ride-form.component.scss',
})
export class RideFormComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  readonly rideFacade = inject(RideFacade);
  readonly sseService = inject(SseService);
  private readonly snackBar = inject(MatSnackBar);

  readonly users = MOCK_USERS;
  readonly createdRide = signal<Ride | null>(null);
  readonly submitting = signal(false);
  readonly selectedUserId = signal<string | null>(null);

  private readonly snackConfig = { duration: 5000, verticalPosition: 'top' as const, horizontalPosition: 'right' as const };

  private sseSubscription?: Subscription;

  readonly form: FormGroup = this.fb.group({
    userId: ['', [Validators.required, uuidValidator()]],
    origin: this.fb.group({
      cep: ['', [Validators.required, cepFormatValidator()]],
      logradouro: ['', Validators.required],
      numero: ['', Validators.required],
      complemento: [''],
      bairro: ['', Validators.required],
      cidade: ['', Validators.required],
      estado: ['', [Validators.required, brazilianStateValidator()]],
    }),
    destination: this.fb.group({
      cep: ['', [Validators.required, cepFormatValidator()]],
      logradouro: ['', Validators.required],
      numero: ['', Validators.required],
      complemento: [''],
      bairro: ['', Validators.required],
      cidade: ['', Validators.required],
      estado: ['', [Validators.required, brazilianStateValidator()]],
    }),
  }, { validators: [differentAddressesValidator()] });

  get hasSameAddressError(): boolean {
    return this.form.hasError('sameAddress');
  }

  onUserSelected(userId: string): void {
    this.selectedUserId.set(userId);
    this.createdRide.set(null);
    this.rideFacade.currentRide.set(null);

    this.rideFacade.loadActiveRideForUser(userId);

    this.disconnectSse();
    this.sseSubscription = this.sseService.connectPassenger(userId).subscribe({
      next: (event) => {
        if (event.type === 'RIDE_ACCEPTED') {
          this.rideFacade.updateCurrentRideStatus('ACCEPTED', {
            driverId: event.data['driverId'] as string,
            acceptedAt: event.data['acceptedAt'] as string,
          });
          this.createdRide.set(null);
          this.snackBar.open('🎉 Corrida aceita por um motorista!', 'OK', this.snackConfig);
        }
        if (event.type === 'RIDE_COMPLETED') {
          this.rideFacade.updateCurrentRideStatus('COMPLETED');
          this.createdRide.set(null);
          this.snackBar.open('🏁 Corrida finalizada! Obrigado por viajar conosco.', 'OK', this.snackConfig);
        }
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitting.set(true);
    this.createdRide.set(null);

    const request: CreateRideRequest = this.form.getRawValue();

    this.rideFacade.createRide(request).subscribe({
      next: (ride) => {
        this.createdRide.set(null);
        this.rideFacade.currentRide.set(ride);
        this.submitting.set(false);
        this.form.reset();
        this.form.patchValue({ userId: this.selectedUserId() });
      },
      error: () => {
        this.submitting.set(false);
      },
    });
  }

  onNewRide(): void {
    this.createdRide.set(null);
    this.rideFacade.currentRide.set(null);
  }

  ngOnDestroy(): void {
    this.disconnectSse();
  }

  private disconnectSse(): void {
    this.sseSubscription?.unsubscribe();
    this.sseService.disconnect();
  }
}
