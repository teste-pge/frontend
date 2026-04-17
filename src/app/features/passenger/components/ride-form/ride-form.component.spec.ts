import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { RideFormComponent, MOCK_USERS } from './ride-form.component';
import { RideFacade } from '@core/facades';
import { Ride } from '@core/models';
import { CepService } from '@core/services';

const mockRide: Ride = {
    id: '11111111-1111-1111-1111-111111111111',
    userId: MOCK_USERS[0].id,
    origin: {
        cep: '01310-100', logradouro: 'Av Paulista', numero: '1000',
        bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP',
    },
    destination: {
        cep: '04543-000', logradouro: 'Av Faria Lima', numero: '500',
        bairro: 'Itaim Bibi', cidade: 'São Paulo', estado: 'SP',
    },
    status: 'PENDING',
    createdAt: '2026-04-17T10:00:00Z',
    updatedAt: '2026-04-17T10:00:00Z',
};

describe('RideFormComponent', () => {
    let component: RideFormComponent;
    let fixture: ComponentFixture<RideFormComponent>;
    let rideFacadeSpy: jest.Mocked<RideFacade>;

    beforeEach(async () => {
        rideFacadeSpy = {
            createRide: jest.fn(),
            loading: jest.fn(() => false) as any,
            error: jest.fn(() => null) as any,
            rides: jest.fn(() => []) as any,
        } as unknown as jest.Mocked<RideFacade>;

        const cepServiceSpy = {
            lookup: jest.fn().mockReturnValue(of(null)),
            formatCep: jest.fn(),
        };

        await TestBed.configureTestingModule({
            imports: [RideFormComponent, NoopAnimationsModule],
            providers: [
                { provide: RideFacade, useValue: rideFacadeSpy },
                { provide: CepService, useValue: cepServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(RideFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should render form with userId selector and two address-form components', () => {
        const el: HTMLElement = fixture.nativeElement;
        expect(el.querySelector('mat-select[formcontrolname="userId"]')).toBeTruthy();
        const addressForms = el.querySelectorAll('app-address-form');
        expect(addressForms.length).toBe(2);
    });

    it('should disable submit button when form is invalid', () => {
        const btn = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
        expect(btn.disabled).toBe(true);
    });

    it('should show error when origin and destination CEP+numero are equal', () => {
        fillValidForm(component);
        // Make addresses the same
        component.form.get('destination')!.patchValue({
            cep: '01310-100', numero: '1000',
        });
        component.form.updateValueAndValidity();
        fixture.detectChanges();

        expect(component.hasSameAddressError).toBe(true);
    });

    it('should call facade.createRide with correct payload on valid submit', () => {
        fillValidForm(component);
        rideFacadeSpy.createRide.mockReturnValue(of(mockRide));
        fixture.detectChanges();

        component.onSubmit();

        expect(rideFacadeSpy.createRide).toHaveBeenCalledWith(
            expect.objectContaining({ userId: MOCK_USERS[0].id }),
        );
    });

    it('should show success confirmation after creation', () => {
        rideFacadeSpy.createRide.mockReturnValue(of(mockRide));
        fillValidForm(component);
        component.onSubmit();
        fixture.detectChanges();

        const el: HTMLElement = fixture.nativeElement;
        expect(el.querySelector('app-ride-confirmation')).toBeTruthy();
    });

    it('should show error message when API returns 400', () => {
        (rideFacadeSpy.error as any) = jest.fn(() => 'Erro de validação');
        rideFacadeSpy.createRide.mockReturnValue(throwError(() => ({ error: { message: 'Erro de validação' } })));
        fillValidForm(component);
        component.onSubmit();
        fixture.detectChanges();

        expect(component.submitting()).toBe(false);
    });

    it('should show loading spinner during request', () => {
        fillValidForm(component);
        component.submitting.set(true);
        fixture.detectChanges();

        const el: HTMLElement = fixture.nativeElement;
        expect(el.querySelector('app-loading-spinner')).toBeTruthy();
    });

    it('should reset form after successful submission', () => {
        rideFacadeSpy.createRide.mockReturnValue(of(mockRide));
        fillValidForm(component);
        component.onSubmit();

        expect(component.form.get('userId')?.value).toBeFalsy();
    });
});

function fillValidForm(component: RideFormComponent): void {
    component.form.patchValue({
        userId: MOCK_USERS[0].id,
        origin: {
            cep: '01310-100', logradouro: 'Av Paulista', numero: '1000',
            complemento: '', bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP',
        },
        destination: {
            cep: '04543-000', logradouro: 'Av Faria Lima', numero: '500',
            complemento: '', bairro: 'Itaim Bibi', cidade: 'São Paulo', estado: 'SP',
        },
    });
    component.form.updateValueAndValidity();
}
