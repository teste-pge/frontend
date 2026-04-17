import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorMessageComponent } from './error-message.component';

describe('ErrorMessageComponent', () => {
    let fixture: ComponentFixture<ErrorMessageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ErrorMessageComponent],
        }).compileComponents();
    });

    it('should display string error message', () => {
        fixture = TestBed.createComponent(ErrorMessageComponent);
        fixture.componentRef.setInput('error', 'Algo deu errado');
        fixture.detectChanges();

        const el: HTMLElement = fixture.nativeElement;
        expect(el.querySelector('.error-text')?.textContent).toContain('Algo deu errado');
        expect(el.querySelector('.error-list')).toBeNull();
    });

    it('should display field errors as list', () => {
        fixture = TestBed.createComponent(ErrorMessageComponent);
        fixture.componentRef.setInput('error', [
            { field: 'cep', message: 'CEP inválido' },
            { field: 'nome', message: 'Nome obrigatório' },
        ]);
        fixture.detectChanges();

        const el: HTMLElement = fixture.nativeElement;
        expect(el.querySelector('.error-text')).toBeNull();
        const items = el.querySelectorAll('.error-list li');
        expect(items.length).toBe(2);
        expect(items[0].textContent).toContain('cep');
        expect(items[0].textContent).toContain('CEP inválido');
    });
});
