import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, catchError, throwError, finalize } from 'rxjs';
import { map } from 'rxjs/operators';

import { RideApiService } from '../services/ride-api.service';
import { Ride, CreateRideRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class RideFacade {
    private readonly rideApi = inject(RideApiService);

    readonly rides = signal<Ride[]>([]);
    readonly currentRide = signal<Ride | null>(null);
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);

    loadPendingRides(page = 0, size = 20): void {
        this.loading.set(true);
        this.error.set(null);

        this.rideApi.findPendingRides(page, size).pipe(
            finalize(() => this.loading.set(false)),
        ).subscribe({
            next: (response) => this.rides.set(response.data.content),
            error: (err) => this.error.set(err?.error?.message ?? 'Erro ao carregar corridas'),
        });
    }

    loadActiveRideForUser(userId: string): void {
        this.rideApi.findActiveByUser(userId).subscribe({
            next: (response) => this.currentRide.set(response.data ?? null),
            error: () => this.currentRide.set(null),
        });
    }

    loadActiveRideForDriver(driverId: string): void {
        this.rideApi.findActiveByDriver(driverId).subscribe({
            next: (response) => {
                this.currentRide.set(response.data ?? null);
            },
            error: () => this.currentRide.set(null),
        });
    }

    createRide(request: CreateRideRequest): Observable<Ride> {
        this.loading.set(true);
        this.error.set(null);

        return this.rideApi.createRide(request).pipe(
            map((response) => response.data),
            tap((ride) => {
                this.rides.update((list) => [ride, ...list]);
                this.currentRide.set(ride);
            }),
            catchError((err) => {
                this.error.set(err?.error?.message ?? 'Erro ao criar corrida');
                return throwError(() => err);
            }),
            finalize(() => this.loading.set(false)),
        );
    }

    acceptRide(rideId: string, driverId: string): Observable<Ride> {
        this.loading.set(true);
        this.error.set(null);

        return this.rideApi.acceptRide(rideId, driverId).pipe(
            map((response) => response.data),
            tap((ride) => {
                this.removeRide(rideId);
                this.currentRide.set(ride);
            }),
            catchError((err) => {
                this.error.set(err?.error?.message ?? 'Erro ao aceitar corrida');
                return throwError(() => err);
            }),
            finalize(() => this.loading.set(false)),
        );
    }

    completeRide(rideId: string, driverId: string): Observable<Ride> {
        this.loading.set(true);
        this.error.set(null);

        return this.rideApi.completeRide(rideId, driverId).pipe(
            map((response) => response.data),
            tap(() => {
                this.currentRide.set(null);
            }),
            catchError((err) => {
                this.error.set(err?.error?.message ?? 'Erro ao completar corrida');
                return throwError(() => err);
            }),
            finalize(() => this.loading.set(false)),
        );
    }

    rejectRide(rideId: string, driverId: string): Observable<void> {
        this.loading.set(true);
        this.error.set(null);

        return this.rideApi.rejectRide(rideId, driverId).pipe(
            map((response) => response.data),
            tap(() => this.removeRide(rideId)),
            catchError((err) => {
                this.error.set(err?.error?.message ?? 'Erro ao rejeitar corrida');
                return throwError(() => err);
            }),
            finalize(() => this.loading.set(false)),
        );
    }

    addRideFromSse(ride: Ride): void {
        this.rides.update((list) => {
            const exists = list.some((r) => r.id === ride.id);
            return exists ? list : [ride, ...list];
        });
    }

    updateCurrentRideStatus(status: Ride['status'], extra?: Partial<Ride>): void {
        this.currentRide.update((ride) => {
            if (!ride) return null;
            return { ...ride, status, ...extra };
        });
    }

    removeRide(rideId: string): void {
        this.rides.update((list) => list.filter((r) => r.id !== rideId));
    }
}
