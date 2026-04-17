import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-loading-spinner',
    standalone: true,
    imports: [MatProgressSpinnerModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="spinner-container">
      <mat-spinner diameter="40"></mat-spinner>
      @if (message()) {
        <p class="spinner-message">{{ message() }}</p>
      }
    </div>
  `,
    styles: `
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 24px;
    }
    .spinner-message {
      color: #666;
      font-size: 14px;
      margin: 0;
    }
  `,
})
export class LoadingSpinnerComponent {
    message = input<string>();
}
