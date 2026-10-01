import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { TableService } from '../../services/table.service';

@Component({
  selector: 'app-bill',
  standalone: true,
  imports: [AsyncPipe, CurrencyPipe, DatePipe, RouterLink],
  template: `
    <h1>Running Bill @if (table.currentTable) { — Table {{ table.currentTable }} }</h1>

    @if ((order.placedOrders$ | async); as orders) {
      @if (orders.length === 0) {
        <div class="card empty">
          <p>No orders placed yet.</p>
          <a class="btn-primary btn-link" routerLink="/menu">Start ordering</a>
        </div>
      } @else {
        @for (o of orders; track o.orderId) {
          <div class="card round">
            <div class="round-head">
              <strong>{{ o.orderId }}</strong>
              <span class="time">{{ o.placedAt | date:'shortTime' }}</span>
            </div>
            @for (l of o.lines; track l.item.id) {
              <div class="row">
                <span>{{ l.quantity }} × {{ l.item.name }}</span>
                <span>{{ l.item.price * l.quantity | currency:'INR' }}</span>
              </div>
            }
            <div class="row muted"><span>Subtotal</span><span>{{ o.subtotal | currency:'INR' }}</span></div>
            <div class="row muted"><span>Tax</span><span>{{ o.tax | currency:'INR' }}</span></div>
            <div class="row total"><span>Round Total</span><span>{{ o.total | currency:'INR' }}</span></div>
          </div>
        }

        <div class="card grand">
          <div class="row grand-row">
            <span>Grand Total ({{ orders.length }} order{{ orders.length > 1 ? 's' : '' }})</span>
            <span>{{ order.billTotal$ | async | currency:'INR' }}</span>
          </div>
          <div class="actions">
            <a class="btn-outline btn-link" routerLink="/menu">+ Order more items</a>
            <button class="btn-primary checkout" (click)="checkout()">Pay &amp; Check Out</button>
          </div>
        </div>
      }
    }
  `,
  styles: [`
    h1 { color: var(--amber); }
    .empty { text-align: center; padding: 40px; }
    .btn-link { display: inline-block; text-decoration: none; margin-top: 8px; border-radius: 8px; }
    .round { margin-bottom: 16px; }
    .round-head {
      display: flex; justify-content: space-between; margin-bottom: 10px;
      border-bottom: 1px solid var(--surface-2); padding-bottom: 8px;
    }
    .time { color: var(--muted); font-size: 0.85rem; }
    .row { display: flex; justify-content: space-between; padding: 4px 0; }
    .muted { color: var(--muted); font-size: 0.85rem; }
    .total { font-weight: 700; color: var(--amber); border-top: 1px dashed var(--surface-2); margin-top: 6px; padding-top: 8px; }
    .grand { background: var(--surface-2); text-align: center; }
    .grand-row { font-size: 1.25rem; font-weight: 700; color: var(--amber); }
    .actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 12px; }
    .checkout { padding: 10px 20px; }
  `],
})
export class BillComponent {
  readonly order = inject(OrderService);
  readonly table = inject(TableService);
  private readonly router = inject(Router);

  /** Pays the bill, frees the table for the next customer, and returns to table selection. */
  checkout(): void {
    this.order.resetTable();
    this.table.releaseTable();
    this.router.navigate(['/tables']);
  }
}
