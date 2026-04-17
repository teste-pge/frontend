import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env';
import { ApiResponse, Page } from '../models';
import { Ride, CreateRideRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class RideApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/rides`;

  createRide(request: CreateRideRequest): Observable<ApiResponse<Ride>> {
    return this.http.post<ApiResponse<Ride>>(this.baseUrl, request);
  }

  findById(rideId: string): Observable<ApiResponse<Ride>> {
    return this.http.get<ApiResponse<Ride>>(`${this.baseUrl}/${rideId}`);
  }

  findPendingRides(page = 0, size = 20): Observable<ApiResponse<Page<Ride>>> {
    const params = new HttpParams()
      .set('status', 'PENDING')
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<Page<Ride>>>(this.baseUrl, { params });
  }

  acceptRide(rideId: string, driverId: string): Observable<ApiResponse<Ride>> {
    return this.http.post<ApiResponse<Ride>>(
      `${this.baseUrl}/${rideId}/accept`,
      { driverId }
    );
  }

  rejectRide(rideId: string, driverId: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(
      `${this.baseUrl}/${rideId}/reject`,
      { driverId }
    );
  }
}
