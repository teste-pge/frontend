import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';

import { loadingInterceptor, isLoading } from './loading.interceptor';

describe('loadingInterceptor', () => {
    let http: HttpClient;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([loadingInterceptor])),
                provideHttpClientTesting(),
            ],
        });
        http = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it('should set isLoading to true during request', () => {
        http.get('/api/test').subscribe();
        expect(isLoading()).toBe(true);
        httpMock.expectOne('/api/test').flush({ ok: true });
        expect(isLoading()).toBe(false);
    });

    it('should skip loading for viacep requests', () => {
        const before = isLoading();
        http.get('https://viacep.com.br/ws/01310100/json').subscribe();
        // isLoading should not have changed (or stayed same)
        httpMock.expectOne('https://viacep.com.br/ws/01310100/json').flush({});
        expect(isLoading()).toBe(before);
    });

    it('should handle multiple concurrent requests', () => {
        http.get('/api/a').subscribe();
        http.get('/api/b').subscribe();
        expect(isLoading()).toBe(true);

        httpMock.expectOne('/api/a').flush({});
        // Still loading because /api/b is pending
        expect(isLoading()).toBe(true);

        httpMock.expectOne('/api/b').flush({});
        expect(isLoading()).toBe(false);
    });

    it('should set isLoading to false on error', () => {
        http.get('/api/fail').subscribe({ error: () => { } });
        expect(isLoading()).toBe(true);
        httpMock.expectOne('/api/fail').flush('err', { status: 500, statusText: 'Error' });
        expect(isLoading()).toBe(false);
    });
});
