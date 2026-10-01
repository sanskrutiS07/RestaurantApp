import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MenuCategory, MenuItem } from '../../models/menu-item.model';
import { AnalyticsService } from '../../services/analytics.service';
import { CATEGORIES, MenuService } from '../../services/menu.service';
import { OrderService } from '../../services/order.service';
import { TableService } from '../../services/table.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  template: `
    @if (!table.currentTable) {
      <div class="card notice">
        <p>Please select your table first.</p>
        <a class="btn-primary btn-link" routerLink="/tables">Choose a table</a>
      </div>
    } @else {
      <h1>Menu <span class="for-table">— Table {{ table.currentTable }}</span></h1>

      <div class="filters">
        <button [class.on]="!active" (click)="filter(null)">All</button>
        @for (c of categories; track c) {
          <button [class.on]="active === c" (click)="filter(c)">{{ c }}</button>
        }
      </div>

      @for (c of visibleCategories; track c) {
        <h2>{{ c }}</h2>
        <div class="grid">
          @for (item of menu.getByCategory(c); track item.id) {
            <div class="card dish" (mouseenter)="onView(item)">
              <div class="thumb">🍛</div>
              <h3>
                <span [class]="item.veg ? 'badge-veg' : 'badge-nonveg'"></span>{{ item.name }}
              </h3>
              <p class="desc">{{ item.description }}</p>
              <div class="row">
                <span class="price">{{ item.price | currency:'INR' }}</span>
                <div class="qty">
                  <button (click)="decQty(item.id)">−</button>
                  <span>{{ qtyOf(item.id) }}</span>
                  <button (click)="incQty(item.id)">+</button>
                </div>
                <button class="btn-primary cta-add" (click)="add(item)">Add to Order</button>
              </div>
            </div>
          }
        </div>
      }
    }
  `,
  styles: [`
    h1 { color: var(--amber); }
    .for-table { color: var(--muted); font-size: 1rem; }
    h2 { margin-top: 28px; border-bottom: 1px solid var(--surface-2); padding-bottom: 6px; }
    .notice { text-align: center; padding: 40px; }
    .btn-link { display: inline-block; text-decoration: none; margin-top: 8px; border-radius: 8px; }
    .filters { display: flex; gap: 8px; flex-wrap: wrap; margin: 16px 0 8px; }
    .filters button {
      background: var(--surface); color: var(--muted);
      padding: 8px 14px; border: 1px solid var(--surface-2);
    }
    .filters button.on { background: var(--amber); color: var(--bg); border-color: var(--amber); }
    .grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
    .dish { display: flex; flex-direction: column; gap: 8px; }
    .thumb {
      height: 110px; border-radius: 8px; background: var(--surface-2);
      display: flex; align-items: center; justify-content: center; font-size: 3rem;
    }
    .dish h3 { margin: 4px 0 0; font-size: 1.05rem; }
    .desc { color: var(--muted); font-size: 0.85rem; flex: 1; margin: 0; }
    .row { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
    .price { color: var(--amber); font-weight: 700; font-size: 1.1rem; }
    .qty { display: flex; align-items: center; gap: 8px; }
    .qty button {
      width: 26px; height: 26px; border-radius: 50%;
      background: var(--surface-2); color: var(--cream); font-size: 0.95rem;
    }
    .qty span { min-width: 18px; text-align: center; font-weight: 700; }
    .cta-add { padding: 8px 14px; font-size: 0.85rem; }
  `],
})
export class MenuComponent {
  readonly menu = inject(MenuService);
  readonly order = inject(OrderService);
  readonly table = inject(TableService);
  private readonly analytics = inject(AnalyticsService);
  private readonly router = inject(Router);

  readonly categories = CATEGORIES;
  active: MenuCategory | null = null;

  /** Per-item quantity chosen before tapping "Add to Order". */
  private readonly quantities = new Map<string, number>();

  qtyOf(itemId: string): number {
    return this.quantities.get(itemId) ?? 1;
  }

  incQty(itemId: string): void {
    this.quantities.set(itemId, this.qtyOf(itemId) + 1);
  }

  decQty(itemId: string): void {
    this.quantities.set(itemId, Math.max(1, this.qtyOf(itemId) - 1));
  }

  get visibleCategories(): MenuCategory[] {
    return this.active ? [this.active] : this.categories;
  }

  filter(c: MenuCategory | null): void {
    this.active = c;
  }

  onView(item: MenuItem): void {
    this.analytics.trackViewItem(item.id, item.name, item.price, item.category);
  }

  add(item: MenuItem): void {
    const qty = this.qtyOf(item.id);
    this.order.addToCart(item, qty);
    this.analytics.trackAddToCart({ item, quantity: qty });
    this.quantities.set(item.id, 1);
  }
}
