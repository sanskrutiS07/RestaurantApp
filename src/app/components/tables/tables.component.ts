import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AnalyticsService } from '../../services/analytics.service';
import { TableService, TABLE_COUNT } from '../../services/table.service';

@Component({
  selector: 'app-tables',
  standalone: true,
  template: `
    <h1>Select Your Table</h1>
    <p class="hint">Tap the table you're seated at to start ordering. Occupied tables can't be booked.</p>
    <div class="grid">
      @for (n of tables; track n) {
        <button
          class="table-card"
          [class.selected]="table.currentTable === n"
          [class.occupied]="table.isOccupied(n) && table.currentTable !== n"
          [disabled]="table.isOccupied(n) && table.currentTable !== n"
          (click)="select(n)"
        >
          <span class="num">{{ n }}</span>
          <span class="label">Table</span>
          <span class="status">{{
            table.currentTable === n ? 'Your table'
            : table.isOccupied(n) ? 'Occupied'
            : 'Available'
          }}</span>
        </button>
      }
    </div>
  `,
  styles: [`
    h1 { color: var(--amber); }
    .hint { color: var(--muted); }
    .grid {
      display: grid; gap: 16px; margin-top: 24px;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    }
    .table-card {
      background: var(--surface); border: 2px solid var(--surface-2);
      border-radius: 14px; padding: 28px 0;
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      color: var(--cream);
    }
    .table-card:hover { border-color: var(--amber); }
    .table-card.selected { border-color: var(--amber); background: var(--surface-2); }
    .table-card.occupied { opacity: 0.45; cursor: not-allowed; }
    .table-card.occupied .num { color: var(--danger); }
    .num { font-size: 2rem; font-weight: 700; color: var(--amber); }
    .label { font-size: 0.8rem; color: var(--muted); text-transform: uppercase; }
    .status { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
    .table-card:not(.occupied):not(.selected) .status { color: #4caf50; }
    .table-card.selected .status { color: var(--amber); }
    .table-card.occupied .status { color: var(--danger); }
  `],
})
export class TablesComponent {
  readonly table = inject(TableService);
  private readonly analytics = inject(AnalyticsService);
  private readonly router = inject(Router);

  readonly tables = Array.from({ length: TABLE_COUNT }, (_, i) => i + 1);

  select(n: number): void {
    if (this.table.selectTable(n)) {
      this.analytics.trackSelectTable(n);
      this.router.navigate(['/menu']);
    }
  }
}
