import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { ExperimentService } from './experiment.service';
import { CartLine } from '../models/menu-item.model';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * GA4 wrapper. Loads gtag.js dynamically and enriches every event with the
 * A/B `experiment_variant` parameter so results can be split in GA4 Explore.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly experiment = inject(ExperimentService);
  private loaded = false;

  init(): void {
    const id = environment.gaMeasurementId;
    if (this.loaded || !id || id === 'G-XXXXXXXXXX') return;
    this.loaded = true;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer ?? [];
    window.gtag = (...args: unknown[]) => window.dataLayer!.push(args);
    window.gtag('js', new Date());
    window.gtag('config', id, { send_page_view: true });
    window.gtag('set', 'user_properties', {
      experiment_variant: this.experiment.variant,
    });
  }

  /** Low-level event sender — always attaches experiment_variant. */
  track(eventName: string, params: Record<string, unknown> = {}): void {
    if (!window.gtag) return;
    window.gtag('event', eventName, {
      ...params,
      experiment_variant: this.experiment.variant,
    });
  }

  trackSelectTable(table: number): void {
    this.track('select_table', { table_number: table });
  }

  trackViewItem(itemId: string, itemName: string, price: number, category: string): void {
    this.track('view_item', {
      currency: 'USD',
      value: price,
      items: [{ item_id: itemId, item_name: itemName, item_category: category, price }],
    });
  }

  trackAddToCart(line: CartLine): void {
    this.track('add_to_cart', {
      currency: 'USD',
      value: line.item.price * line.quantity,
      items: [{
        item_id: line.item.id,
        item_name: line.item.name,
        item_category: line.item.category,
        price: line.item.price,
        quantity: line.quantity,
      }],
    });
  }

  trackBeginCheckout(lines: CartLine[], value: number): void {
    this.track('begin_checkout', {
      currency: 'USD',
      value,
      items: lines.map((l) => ({
        item_id: l.item.id,
        item_name: l.item.name,
        price: l.item.price,
        quantity: l.quantity,
      })),
    });
  }

  trackPurchase(orderId: string, table: number, value: number, tax: number, lines: CartLine[]): void {
    this.track('purchase', {
      transaction_id: orderId,
      table_number: table,
      currency: 'USD',
      value,
      tax,
      items: lines.map((l) => ({
        item_id: l.item.id,
        item_name: l.item.name,
        item_category: l.item.category,
        price: l.item.price,
        quantity: l.quantity,
      })),
    });
  }
}
