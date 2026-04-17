import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { StatusBadgeComponent } from './status-badge.component';
import { RideStatus } from '@core/models';

@Component({
    standalone: true,
    imports: [StatusBadgeComponent],
    template: `<app-status-badge [status]="status" />`,
})
class TestHostComponent {
    status: RideStatus = 'PENDING';
}

describe('StatusBadgeComponent', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let host: TestHostComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHostComponent],
        }).compileComponents();
        fixture = TestBed.createComponent(TestHostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should show yellow badge for PENDING', () => {
        host.status = 'PENDING';
        fixture.detectChanges();
        const badge = fixture.nativeElement.querySelector('.badge') as HTMLElement;
        expect(badge.textContent?.trim()).toContain('Aguardando motorista');
        expect(badge.style.background).toBe('rgb(255, 243, 205)'); // #fff3cd
    });

    it('should show blue badge for COMPLETED', () => {
        host.status = 'COMPLETED';
        fixture.detectChanges();
        const badge = fixture.nativeElement.querySelector('.badge') as HTMLElement;
        expect(badge.textContent?.trim()).toContain('Concluída');
        expect(badge.style.background).toBe('rgb(204, 229, 255)'); // #cce5ff
    });
});
