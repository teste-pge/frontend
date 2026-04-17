import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env';
import { ApiResponse, Driver } from '../models';

@Injectable({ providedIn: 'root' })
export class DriverApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/drivers`;

  findAll(): Observable<ApiResponse<Driver[]>> {
    return this.http.get<ApiResponse<Driver[]>>(this.baseUrl);
  }

  findAvailable(): Observable<ApiResponse<Driver[]>> {
    return this.http.get<ApiResponse<Driver[]>>(`${this.baseUrl}/available`);
  }
}
