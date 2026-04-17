import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { RideCardComponent } from './ride-card.component';
import { Ride } from '@core/models';

const mockRide: Ride = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    userId: 'user-1',
    origin: {
        cep: '01310-100',
        logradouro: 'Av Paulista',
        numero: '1000',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'SP',
        displayString: 'Av Paulista, 1000 - Bela Vista, São Paulo/SP',
    },
    destination: {
        cep: '20040-020',
        logradouro: 'Av Rio Branco',
        numero: '1',
        bairro: 'Centro',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        displayString: 'Av Rio Branco, 1 - Centro, Rio de Janeiro/RJ',
    },
    status: 'PENDING',
    createdAt: '2026-04-17T10:00:00Z',
    updatedAt: '2026-04-17T10:00:00Z',
};

describe('RideCardComponent', () => {
    let component: RideCardComponent;
    let fixture: ComponentFixture<RideCardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RideCardComponent, NoopAnimationsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(RideCardComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('ride', mockRide);
        fixture.detectChanges();
    });

    it('should display origin and destination displayStrings', () => {
        const el: HTMLElement = fixture.nativeElement;
        expect(el.textContent).toContain('Av Paulista, 1000 - Bela Vista, São Paulo/SP');
        expect(el.textContent).toContain('Av Rio Branco, 1 - Centro, Rio de Janeiro/RJ');
    });

    it('should emit accept event on button click', () => {
        const spy = jest.fn();
        component.accept.subscribe(spy);

        const btn = fixture.nativeElement.querySelector('[data-testid="accept-btn"]');
        btn.click();

        expect(spy).toHaveBeenCalledWith(mockRide.id);
    });

    it('should emit reject event on button click', () => {
        const spy = jest.fn();
        component.reject.subscribe(spy);

        const btn = fixture.nativeElement.querySelector('[data-testid="reject-btn"]');
        btn.click();

        expect(spy).toHaveBeenCalledWith(mockRide.id);
    });
});
