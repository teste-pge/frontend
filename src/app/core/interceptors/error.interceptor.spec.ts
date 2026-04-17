import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';

import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
    let http: HttpClient;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([errorInterceptor])),
                provideHttpClientTesting(),
            ],
        });
        http = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it('should pass through successful requests', () => {
        http.get('/api/test').subscribe((res) => {
            expect(res).toEqual({ ok: true });
        });
        httpMock.expectOne('/api/test').flush({ ok: true });
    });

    it('should skip interception for viacep requests', () => {
        http.get('https://viacep.com.br/ws/01310100/json').subscribe((res) => {
            expect(res).toBeTruthy();
        });
        httpMock.expectOne('https://viacep.com.br/ws/01310100/json').flush({ cep: '01310100' });
    });

    it('should handle ApiError with errorCode', (done) => {
        http.get('/api/test').subscribe({
            error: (err) => {
                expect(err.userMessage).toBe('Corrida não encontrada');
                done();
            },
        });
        httpMock.expectOne('/api/test').flush(
            { errorCode: 'RIDE_NOT_FOUND', message: 'Corrida não encontrada', details: [] },
            { status: 404, statusText: 'Not Found' },
        );
    });

    it('should handle status 0 (network error)', (done) => {
        http.get('/api/test').subscribe({
            error: (err) => {
                expect(err.userMessage).toBe('Servidor indisponível. Verifique sua conexão.');
                done();
            },
        });
        httpMock.expectOne('/api/test').error(new ProgressEvent('error'), { status: 0, statusText: '' });
    });

    it('should handle status 400', (done) => {
        http.get('/api/test').subscribe({
            error: (err) => {
                expect(err.userMessage).toBe('Requisição inválida.');
                done();
            },
        });
        httpMock.expectOne('/api/test').flush('Bad', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle status 404', (done) => {
        http.get('/api/test').subscribe({
            error: (err) => {
                expect(err.userMessage).toBe('Recurso não encontrado.');
                done();
            },
        });
        httpMock.expectOne('/api/test').flush('Not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle status 409', (done) => {
        http.get('/api/test').subscribe({
            error: (err) => {
                expect(err.userMessage).toBe('Conflito: o recurso já foi modificado.');
                done();
            },
        });
        httpMock.expectOne('/api/test').flush('Conflict', { status: 409, statusText: 'Conflict' });
    });

    it('should handle status 500', (done) => {
        http.get('/api/test').subscribe({
            error: (err) => {
                expect(err.userMessage).toBe('Erro interno do servidor.');
                done();
            },
        });
        httpMock.expectOne('/api/test').flush('Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle unknown status with default message', (done) => {
        http.get('/api/test').subscribe({
            error: (err) => {
                expect(err.userMessage).toBe('Erro inesperado (403).');
                done();
            },
        });
        httpMock.expectOne('/api/test').flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
});
