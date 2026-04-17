import { ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AddressFormComponent } from './address-form.component';
import { cepFormatValidator, brazilianStateValidator } from '@shared/validators';

function createAddressGroup(): FormGroup {
    return new FormGroup({
        cep: new FormControl('', [Validators.required, cepFormatValidator()]),
        logradouro: new FormControl('', Validators.required),
        numero: new FormControl('', Validators.required),
        complemento: new FormControl(''),
        bairro: new FormControl('', Validators.required),
        cidade: new FormControl('', Validators.required),
        estado: new FormControl('', [Validators.required, brazilianStateValidator()]),
    });
}

describe('AddressFormComponent', () => {
    let fixture: ComponentFixture<AddressFormComponent>;
    let component: AddressFormComponent;
    let httpMock: HttpTestingController;
    let parentForm: FormGroup;

    beforeEach(async () => {
        parentForm = new FormGroup({ origin: createAddressGroup() });

        await TestBed.configureTestingModule({
            imports: [AddressFormComponent, NoopAnimationsModule],
            providers: [
                provideHttpClient(withInterceptors([])),
                provideHttpClientTesting(),
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AddressFormComponent);
        component = fixture.componentInstance;

        fixture.componentRef.setInput('controlName', 'origin');
        fixture.componentRef.setInput('parentForm', parentForm);
        fixture.componentRef.setInput('label', 'Origem');

        fixture.detectChanges();
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    const VALID_RESPONSE = {
        cep: '01310100', logradouro: 'Avenida Paulista', complemento: 'até 610',
        bairro: 'Bela Vista', localidade: 'São Paulo', uf: 'SP',
    };

    it('should call CepService when 8 digits are typed', fakeAsync(() => {
        parentForm.get('origin.cep')!.setValue('01310-100');
        tick(500);
        const req = httpMock.expectOne('https://viacep.com.br/ws/01310100/json');
        expect(req.request.method).toBe('GET');
        req.flush(VALID_RESPONSE);
        discardPeriodicTasks();
    }));

    it('should auto-fill logradouro, bairro, cidade, estado on valid CEP', fakeAsync(() => {
        parentForm.get('origin.cep')!.setValue('01310-100');
        tick(500);
        httpMock.expectOne('https://viacep.com.br/ws/01310100/json').flush(VALID_RESPONSE);

        expect(parentForm.get('origin.logradouro')!.value).toBe('Avenida Paulista');
        expect(parentForm.get('origin.bairro')!.value).toBe('Bela Vista');
        expect(parentForm.get('origin.cidade')!.value).toBe('São Paulo');
        expect(parentForm.get('origin.estado')!.value).toBe('SP');
        discardPeriodicTasks();
    }));

    it('should show error when CEP is not found', fakeAsync(() => {
        parentForm.get('origin.cep')!.setValue('00000-000');
        tick(500);
        httpMock.expectOne('https://viacep.com.br/ws/00000000/json').flush({ erro: true });
        expect(component.cepNotFound()).toBe(true);
        discardPeriodicTasks();
    }));

    it('should show loading signal during CEP lookup', fakeAsync(() => {
        parentForm.get('origin.cep')!.setValue('01310-100');
        tick(500);
        expect(component.loading()).toBe(true);

        httpMock.expectOne('https://viacep.com.br/ws/01310100/json').flush(VALID_RESPONSE);
        expect(component.loading()).toBe(false);
        discardPeriodicTasks();
    }));

    it('should enable numero field after successful CEP lookup', fakeAsync(() => {
        parentForm.get('origin.cep')!.setValue('01310-100');
        tick(500);
        httpMock.expectOne('https://viacep.com.br/ws/01310100/json').flush(VALID_RESPONSE);

        const numero = parentForm.get('origin.numero')!;
        expect(numero.enabled).toBe(true);
        numero.setValue('1000');
        expect(numero.value).toBe('1000');
        discardPeriodicTasks();
    }));

    it('should show validation error when numero is empty', () => {
        const numero = parentForm.get('origin.numero')!;
        numero.setValue('');
        numero.markAsTouched();
        expect(numero.hasError('required')).toBe(true);
    });

    it('should allow manual editing of auto-filled fields', fakeAsync(() => {
        parentForm.get('origin.cep')!.setValue('01310-100');
        tick(500);
        httpMock.expectOne('https://viacep.com.br/ws/01310100/json').flush(VALID_RESPONSE);

        const logradouro = parentForm.get('origin.logradouro')!;
        logradouro.setValue('Rua Alterada');
        expect(logradouro.value).toBe('Rua Alterada');
        expect(logradouro.enabled).toBe(true);
        discardPeriodicTasks();
    }));
});
