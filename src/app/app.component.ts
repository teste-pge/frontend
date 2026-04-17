import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule],
  template: `
    <mat-toolbar color="primary" class="app-toolbar">
      <span>🚕 RideFlow</span>
    </mat-toolbar>

    <nav class="app-nav">
      <a routerLink="/passenger" routerLinkActive="active">
        🚗 Passageiro
      </a>
      <a routerLink="/driver" routerLinkActive="active">
        🚙 Motorista
      </a>
    </nav>

    <main class="app-content">
      <router-outlet />
    </main>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .app-toolbar {
      flex-shrink: 0;
    }

    .app-nav {
      display: flex;
      gap: 0;
      background: #f5f5f5;
      border-bottom: 1px solid #ddd;

      a {
        flex: 1;
        text-align: center;
        padding: 12px 16px;
        text-decoration: none;
        color: #555;
        font-weight: 500;
        transition: background 0.2s, color 0.2s;

        &:hover {
          background: #e0e0e0;
        }

        &.active {
          color: #3f51b5;
          border-bottom: 3px solid #3f51b5;
          background: #fff;
        }
      }
    }

    .app-content {
      flex: 1;
      padding: 24px;
      max-width: 960px;
      width: 100%;
      margin: 0 auto;
    }

    @media (max-width: 600px) {
      .app-content {
        padding: 16px;
      }
    }
  `,
})
export class AppComponent {
  title = 'RideFlow';
}
