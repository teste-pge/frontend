import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionStatusComponent } from './connection-status.component';
import { SseConnectionStatus } from '@core/services/sse.service';

describe('ConnectionStatusComponent', () => {
    let fixture: ComponentFixture<ConnectionStatusComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ConnectionStatusComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ConnectionStatusComponent);
    });

    it('should show correct indicator for each status', () => {
        const cases: { status: SseConnectionStatus; label: string }[] = [
            { status: 'connected', label: 'Online' },
            { status: 'disconnected', label: 'Offline' },
            { status: 'connecting', label: 'Conectando...' },
        ];

        for (const { status, label } of cases) {
            fixture.componentRef.setInput('status', status);
            fixture.detectChanges();

            const el: HTMLElement = fixture.nativeElement;
            expect(el.textContent).toContain(label);
            expect(el.querySelector(`.${status}`)).toBeTruthy();
        }
    });
});
