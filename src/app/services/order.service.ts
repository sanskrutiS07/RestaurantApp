import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { CartLine, MenuItem, PlacedOrder } from '../models/menu-item.model';
import { ExperimentService } from './experiment.service';

export const TAX_RATE = 0.05;

interface OrderState {
  cart: CartLine[];
  placedOrders: PlacedOrder[];
}

/**
 * Holds the live cart plus all placed order rounds for the current table.
 * The bill accumulates: every "Place Order" appends a round and the grand
 * total keeps growing until the table checks out.
 */
@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly experiment = inject(ExperimentService);

  private readonly state = new BehaviorSubject<OrderState>({ cart: [], placedOrders: [] });

  readonly cart$ = this.state.pipe(map((s) => s.cart));
  readonly placedOrders$ = this.state.pipe(map((s) => s.placedOrders));
  readonly cartCount$ = this.state.pipe(
    map((s) => s.cart.reduce((n, l) => n + l.quantity, 0))
  );
  /** Running bill total (tax included) across all placed rounds. */
  readonly billTotal$ = this.state.pipe(
    map((s) => s.placedOrders.reduce((sum, o) => sum + o.total, 0))
  );

  get cart(): CartLine[] {
    return this.state.value.cart;
  }

  get placedOrders(): PlacedOrder[] {
    return this.state.value.placedOrders;
  }

  addToCart(item: MenuItem, quantity = 1): void {
    if (quantity <= 0) return;
    const cart = [...this.state.value.cart];
    const line = cart.find((l) => l.item.id === item.id);
    if (line) line.quantity += quantity;
    else cart.push({ item, quantity });
    this.patch({ cart });
  }

  setQuantity(itemId: string, quantity: number): void {
    let cart = [...this.state.value.cart];
    const line = cart.find((l) => l.item.id === itemId);
    if (!line) return;
    if (quantity <= 0) {
      cart = cart.filter((l) => l.item.id !== itemId);
    } else {
      line.quantity = quantity;
    }
    this.patch({ cart });
  }

  removeFromCart(itemId: string): void {
    this.patch({ cart: this.state.value.cart.filter((l) => l.item.id !== itemId) });
  }

  cartTotals(): { subtotal: number; tax: number; total: number } {
    return this.computeTotals(this.state.value.cart);
  }

  /** Places the current cart as a new order round for the table. Returns the order. */
  placeOrder(table: number): PlacedOrder {
    const { cart } = this.state.value;
    const { subtotal, tax, total } = this.computeTotals(cart);
    const order: PlacedOrder = {
      orderId: `ORD-${Date.now().toString(36).toUpperCase()}`,
      table,
      lines: cart.map((l) => ({ item: l.item, quantity: l.quantity })),
      subtotal,
      tax,
      total,
      placedAt: new Date(),
      variant: this.experiment.variant,
    };
    this.patch({ cart: [], placedOrders: [...this.state.value.placedOrders, order] });
    return order;
  }

  /** Clears cart and all placed rounds (table checks out / leaves). */
  resetTable(): void {
    this.state.next({ cart: [], placedOrders: [] });
  }

  private computeTotals(lines: CartLine[]): { subtotal: number; tax: number; total: number } {
    const subtotal = lines.reduce((s, l) => s + l.item.price * l.quantity, 0);
    const tax = Math.round(subtotal * TAX_RATE);
    return { subtotal, tax, total: subtotal + tax };
  }

  private patch(partial: Partial<OrderState>): void {
    this.state.next({ ...this.state.value, ...partial });
  }
}
