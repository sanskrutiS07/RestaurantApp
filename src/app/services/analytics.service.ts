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
  private readonly debugMode = new URLSearchParams(window.location.search).has('ga_debug');

  init(): void {
    const id = environment.gaMeasurementId;
    if (this.loaded || !id || id === 'G-XXXXXXXXXX') return;
    this.loaded = true;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer ?? [];
    // gtag expects queued entries in the same shape as the official snippet
    // (`arguments` object), not a plain array.
    window.gtag = function () {
      window.dataLayer!.push(arguments);
    } as unknown as (...args: unknown[]) => void;
    window.gtag('js', new Date());
    window.gtag('config', id, { send_page_view: false, debug_mode: this.debugMode });
    window.gtag('set', 'user_properties', {
      experiment_variant: this.experiment.variant,
    });
  }

  /** Low-level event sender — always attaches experiment_variant. */
  track(eventName: string, params: Record<string, unknown> = {}): void {
    if (!window.gtag) return;
    window.gtag('event', eventName, {
      ...params,
      debug_mode: this.debugMode,
      experiment_variant: this.experiment.variant,
    });
  }

  trackPageView(pagePath: string, pageTitle?: string): void {
    this.track('page_view', {
      page_location: window.location.origin + pagePath,
      page_path: pagePath,
      page_title: pageTitle ?? document.title,
    });
  }

  trackSelectTable(table: number): void {
    this.track('select_table', { table_number: table });
  }

  trackViewItem(itemId: string, itemName: string, price: number, category: string, table?: number): void {
    this.track('view_item', {
      currency: 'INR',
      value: price,
      table_number: table,
      items: [{ item_id: itemId, item_name: itemName, item_category: category, price }],
    });
  }

  trackAddToCart(line: CartLine, table?: number): void {
    this.track('add_to_cart', {
      currency: 'INR',
      value: line.item.price * line.quantity,
      table_number: table,
      items: [{
        item_id: line.item.id,
        item_name: line.item.name,
        item_category: line.item.category,
        price: line.item.price,
        quantity: line.quantity,
      }],
    });
  }

  trackRemoveFromCart(line: CartLine, table?: number): void {
    this.track('remove_from_cart', {
      currency: 'INR',
      value: line.item.price * line.quantity,
      table_number: table,
      items: [{
        item_id: line.item.id,
        item_name: line.item.name,
        item_category: line.item.category,
        price: line.item.price,
        quantity: line.quantity,
      }],
    });
  }

  trackViewCart(lines: CartLine[], value: number, table?: number): void {
    this.track('view_cart', {
      currency: 'INR',
      value,
      table_number: table,
      items: lines.map((l) => ({
        item_id: l.item.id,
        item_name: l.item.name,
        item_category: l.item.category,
        price: l.item.price,
        quantity: l.quantity,
      })),
    });
  }

  trackBeginCheckout(lines: CartLine[], value: number, table?: number): void {
    this.track('begin_checkout', {
      currency: 'INR',
      value,
      table_number: table,
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
      currency: 'INR',
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
