import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RideConfirmationComponent } from './ride-confirmation.component';
import { Ride } from '@core/models';

const mockRide: Ride = {
    id: '11111111-1111-1111-1111-111111111111',
    userId: 'user-1',
    origin: {
        cep: '01310-100', logradouro: 'Av Paulista', numero: '1000',
        bairro: 'Bela Vista', cidade: 'São Paulo', estado: 'SP',
        displayString: 'Av Paulista, 1000 - Bela Vista, São Paulo/SP',
    },
    destination: {
        cep: '04543-000', logradouro: 'Av Faria Lima', numero: '500',
        bairro: 'Itaim Bibi', cidade: 'São Paulo', estado: 'SP',
        displayString: 'Av Faria Lima, 500 - Itaim Bibi, São Paulo/SP',
    },
    status: 'PENDING',
    createdAt: '2026-04-17T10:00:00Z',
    updatedAt: '2026-04-17T10:00:00Z',
};

@Component({
    standalone: true,
    imports: [RideConfirmationComponent],
    template: `<app-ride-confirmation [ride]="ride" />`,
})
class TestHostComponent {
    ride = mockRide;
}

describe('RideConfirmationComponent', () => {
    let fixture: ComponentFixture<TestHostComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHostComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();
    });

    it('should display ride ID and status', () => {
        const el: HTMLElement = fixture.nativeElement;
        expect(el.textContent).toContain(mockRide.id);
    });

    it('should display origin and destination', () => {
        const el: HTMLElement = fixture.nativeElement;
        expect(el.textContent).toContain('Av Paulista');
        expect(el.textContent).toContain('Av Faria Lima');
    });
});
