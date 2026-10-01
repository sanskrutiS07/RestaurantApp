# 🍽️ Spice Table — Restaurant Table Ordering (Angular + GA4 A/B Analytics)

A client-side Angular 17 app where diners pick their table, browse the menu, place
multiple order rounds that accumulate into a running bill — with Google Analytics 4
events wired for A/B testing.

## Features

- **Table selection** — 12 tables, persisted in `localStorage`
- **Menu** — 16 dishes across Starters / Mains / Desserts / Drinks with category filters
- **Cart** — quantity controls, subtotal + 5% tax, live navbar badge
- **Running bill** — each "Place Order" adds a round; the bill page shows all rounds and the grand total
- **GA4 analytics** — `select_table`, `view_item`, `add_to_cart`, `begin_checkout`, `purchase`
- **A/B testing** — `ExperimentService` assigns variant A/B (persisted); variant B shows an alternate "Add to Order" CTA style; every event carries an `experiment_variant` param

## Setup

```bash
npm install
ng serve
```

Open http://localhost:4200

## Google Analytics setup

1. Create a GA4 property and web data stream at https://analytics.google.com
2. Copy the Measurement ID (`G-XXXXXXX`)
3. Replace `G-XXXXXXXXXX` in:
   - `src/environments/environment.ts`
   - `src/environments/environment.development.ts`
4. In GA4 → **Admin → Custom definitions**, register `experiment_variant` as an
   **event-scoped custom dimension** (and user property) so you can segment by it.

## A/B test analysis in GA4 (Explore)

1. Go to **Explore → Blank** report.
2. Add dimension `experiment_variant` (the custom dimension above) plus `Event name`.
3. Add metrics: `Event count`, `Total revenue`, `Ecommerce purchases`.
4. Build a comparison: segment A = `experiment_variant = A`, segment B = `= B`.
5. Compare funnel steps `view_item → add_to_cart → begin_checkout → purchase`
   per variant to see which CTA style converts better.

> Tip: GA4 can also link to BigQuery for deeper SQL analysis, or you can migrate
> the experiment to Firebase Remote Config / Google Optimize alternatives later.
