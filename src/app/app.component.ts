import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CurrencyPipe, NgIf } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AnalyticsService } from './services/analytics.service';
import { ExperimentService } from './services/experiment.service';
import { OrderService } from './services/order.service';
import { TableService } from './services/table.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe, CurrencyPipe, NgIf],
  template: `
    <header class="navbar">
      <a class="brand" routerLink="/tables">🍽️ Spice Table</a>
      <nav>
        <a routerLink="/tables" routerLinkActive="active">Tables</a>
        <a routerLink="/menu" routerLinkActive="active">Menu</a>
        <a routerLink="/cart" routerLinkActive="active">
          Cart <span class="pill" *ngIf="(order.cartCount$ | async) as n">{{ n }}</span>
        </a>
        <a routerLink="/bill" routerLinkActive="active">
          Bill <span class="pill bill" *ngIf="(order.billTotal$ | async) as t">{{ t | currency:'INR' }}</span>
        </a>
      </nav>
      <span class="table-chip" *ngIf="table.table$ | async as t">Table {{ t }}</span>
      <span class="variant-chip" title="A/B experiment variant">Variant {{ experiment.variant }}</span>
    </header>
    <main class="container">
      <router-outlet />
    </main>
  `,
  styles: [`
    .navbar {
      display: flex; align-items: center; gap: 20px;
      padding: 12px 20px; background: var(--surface);
      border-bottom: 2px solid var(--amber-dark);
      position: sticky; top: 0; z-index: 10;
    }
    .brand { font-size: 1.2rem; font-weight: 700; color: var(--amber); text-decoration: none; }
    nav { display: flex; gap: 14px; flex: 1; }
    nav a { color: var(--muted); text-decoration: none; font-weight: 600; }
    nav a.active, nav a:hover { color: var(--amber); }
    .pill {
      background: var(--amber); color: var(--bg);
      border-radius: 999px; padding: 1px 8px; font-size: 0.75rem;
    }
    .pill.bill { background: var(--cream); }
    .table-chip, .variant-chip {
      font-size: 0.8rem; padding: 4px 10px; border-radius: 999px;
      border: 1px solid var(--amber-dark); color: var(--amber);
    }
    .variant-chip { border-color: var(--surface-2); color: var(--muted); }
  `],
})
export class AppComponent implements OnInit {
  readonly analytics = inject(AnalyticsService);
  readonly experiment = inject(ExperimentService);
  readonly order = inject(OrderService);
  readonly table = inject(TableService);
  readonly router = inject(Router);

  ngOnInit(): void {
    this.analytics.init();
    this.analytics.trackPageView(this.router.url, document.title);
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      this.analytics.trackPageView((event as NavigationEnd).urlAfterRedirects, document.title);
    });
    document.body.classList.toggle('variant-b', this.experiment.isB);
  }
}
