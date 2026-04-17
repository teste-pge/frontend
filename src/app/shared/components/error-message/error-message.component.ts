import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { FieldError } from '@core/models';

@Component({
    selector: 'app-error-message',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="error-container" role="alert">
      @if (isString()) {
        <p class="error-text">{{ error() }}</p>
      } @else {
        <ul class="error-list">
          @for (fe of fieldErrors(); track fe.field) {
            <li><strong>{{ fe.field }}:</strong> {{ fe.message }}</li>
          }
        </ul>
      }
    </div>
  `,
    styles: `
    .error-container {
      background: #fdecea;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
      padding: 12px 16px;
      color: #b71c1c;
      margin: 8px 0;
    }
    .error-text { margin: 0; }
    .error-list {
      margin: 0;
      padding-left: 20px;
      li { margin-bottom: 4px; }
    }
  `,
})
export class ErrorMessageComponent {
    error = input.required<string | FieldError[]>();

    isString = computed(() => typeof this.error() === 'string');
    fieldErrors = computed(() =>
        Array.isArray(this.error()) ? (this.error() as FieldError[]) : []
    );
}
