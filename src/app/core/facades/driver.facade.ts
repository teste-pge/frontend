import { Injectable, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { DriverApiService } from '../services/driver-api.service';
import { Driver } from '../models';

@Injectable({ providedIn: 'root' })
export class DriverFacade {
    private readonly driverApi = inject(DriverApiService);

    readonly drivers = signal<Driver[]>([]);
    readonly loading = signal(false);

    loadDrivers(): void {
        this.loading.set(true);

        this.driverApi.findAll().pipe(
            finalize(() => this.loading.set(false)),
        ).subscribe({
            next: (response) => this.drivers.set(response.data),
        });
    }

    loadAvailable(): void {
        this.loading.set(true);

        this.driverApi.findAvailable().pipe(
            finalize(() => this.loading.set(false)),
        ).subscribe({
            next: (response) => this.drivers.set(response.data),
        });
    }
}
