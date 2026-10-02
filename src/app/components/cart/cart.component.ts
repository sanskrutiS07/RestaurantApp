import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AnalyticsService } from '../../services/analytics.service';
import { OrderService, TAX_RATE } from '../../services/order.service';
import { TableService } from '../../services/table.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, RouterLink],
  template: `
    <h1>Your Order</h1>

    @if ((order.cart$ | async); as cart) {
      @if (cart.length === 0) {
        <div class="card empty">
          <p>Your cart is empty.</p>
          <a class="btn-primary btn-link" routerLink="/menu">Browse the menu</a>
        </div>
      } @else {
        <div class="layout">
          <div class="lines">
            @for (line of cart; track line.item.id) {
              <div class="card line">
                <div class="info">
                  <strong>{{ line.item.name }}</strong>
                  <span class="unit">{{ line.item.price | currency:'INR' }} each</span>
                </div>
                <div class="qty">
                  <button (click)="dec(line.item.id, line.quantity)">−</button>
                  <span>{{ line.quantity }}</span>
                  <button (click)="inc(line.item.id, line.quantity)">+</button>
                </div>
                <span class="amt">{{ line.item.price * line.quantity | currency:'INR' }}</span>
                <button class="rm" (click)="remove(line.item.id)" title="Remove">✕</button>
              </div>
            }
          </div>

          <div class="card summary">
            <h3>Order Summary</h3>
            <div class="row"><span>Subtotal</span><span>{{ totals.subtotal | currency:'INR' }}</span></div>
            <div class="row"><span>Tax ({{ taxRate * 100 }}%)</span><span>{{ totals.tax | currency:'INR' }}</span></div>
            <div class="row total"><span>This Order</span><span>{{ totals.total | currency:'INR' }}</span></div>
            <button class="btn-primary place" (click)="place()">Place Order</button>
            <p class="note">Adds to your running bill — order more anytime.</p>
          </div>
        </div>
      }
    }
  `,
  styles: [`
    h1 { color: var(--amber); }
    .empty { text-align: center; padding: 40px; }
    .btn-link { display: inline-block; text-decoration: none; margin-top: 8px; border-radius: 8px; }
    .layout { display: grid; grid-template-columns: 1fr 300px; gap: 20px; align-items: start; }
    @media (max-width: 760px) { .layout { grid-template-columns: 1fr; } }
    .lines { display: flex; flex-direction: column; gap: 10px; }
    .line { display: flex; align-items: center; gap: 14px; }
    .info { flex: 1; display: flex; flex-direction: column; }
    .unit { color: var(--muted); font-size: 0.8rem; }
    .qty { display: flex; align-items: center; gap: 10px; }
    .qty button {
      width: 28px; height: 28px; border-radius: 50%;
      background: var(--surface-2); color: var(--cream); font-size: 1rem;
    }
    .amt { min-width: 70px; text-align: right; color: var(--amber); font-weight: 700; }
    .rm { background: transparent; color: var(--danger); font-size: 1rem; }
    .summary h3 { margin-top: 0; }
    .row { display: flex; justify-content: space-between; padding: 6px 0; color: var(--muted); }
    .row.total { color: var(--cream); font-weight: 700; border-top: 1px solid var(--surface-2); margin-top: 6px; padding-top: 10px; }
    .place { width: 100%; margin-top: 12px; padding: 12px; font-size: 1rem; }
    .note { color: var(--muted); font-size: 0.75rem; text-align: center; }
  `],
})
export class CartComponent implements OnInit {
  readonly order = inject(OrderService);
  readonly table = inject(TableService);
  private readonly analytics = inject(AnalyticsService);
  private readonly router = inject(Router);

  readonly taxRate = TAX_RATE;

  ngOnInit(): void {
    if (this.order.cart.length === 0) return;
    const { total } = this.order.cartTotals();
    this.analytics.trackViewCart(this.order.cart, total, this.table.currentTable ?? undefined);
  }

  get totals() {
    return this.order.cartTotals();
  }

  inc(id: string, q: number): void {
    const line = this.order.cart.find((l) => l.item.id === id);
    if (line) {
      this.analytics.trackAddToCart({ item: line.item, quantity: 1 }, this.table.currentTable ?? undefined);
    }
    this.order.setQuantity(id, q + 1);
  }

  dec(id: string, q: number): void {
    const line = this.order.cart.find((l) => l.item.id === id);
    if (line) {
      this.analytics.trackRemoveFromCart({ item: line.item, quantity: 1 }, this.table.currentTable ?? undefined);
    }
    this.order.setQuantity(id, q - 1);
  }

  remove(id: string): void {
    const line = this.order.cart.find((l) => l.item.id === id);
    if (line) {
      this.analytics.trackRemoveFromCart(line, this.table.currentTable ?? undefined);
    }
    this.order.removeFromCart(id);
  }

  place(): void {
    const table = this.table.currentTable;
    if (!table) {
      this.router.navigate(['/tables']);
      return;
    }
    const { total } = this.order.cartTotals();
    this.analytics.trackBeginCheckout(this.order.cart, total, table);
    const order = this.order.placeOrder(table);
    this.analytics.trackPurchase(order.orderId, table, order.total, order.tax, order.lines);
    this.router.navigate(['/bill']);
  }
}
