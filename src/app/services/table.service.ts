import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const STORAGE_KEY = 'spice-table-number';
const OCCUPIED_KEY = 'spice-table-occupied';
export const TABLE_COUNT = 12;

@Injectable({ providedIn: 'root' })
export class TableService {
  private readonly tableSubject = new BehaviorSubject<number | null>(this.restore());
  readonly table$ = this.tableSubject.asObservable();

  private readonly occupiedSubject = new BehaviorSubject<Set<number>>(this.restoreOccupied());
  readonly occupied$ = this.occupiedSubject.asObservable();

  get currentTable(): number | null {
    return this.tableSubject.value;
  }

  get occupiedTables(): Set<number> {
    return this.occupiedSubject.value;
  }

  isOccupied(n: number): boolean {
    return this.occupiedSubject.value.has(n);
  }

  /** Books a table for this customer and marks it occupied for everyone else. */
  selectTable(n: number): boolean {
    if (n !== this.currentTable && this.isOccupied(n)) return false;
    localStorage.setItem(STORAGE_KEY, String(n));
    this.tableSubject.next(n);
    this.setOccupied(n, true);
    return true;
  }

  /** Releases the current table (checkout) so it becomes available again. */
  releaseTable(): void {
    const current = this.currentTable;
    if (current !== null) this.setOccupied(current, false);
    localStorage.removeItem(STORAGE_KEY);
    this.tableSubject.next(null);
  }

  clearTable(): void {
    this.releaseTable();
  }

  private setOccupied(n: number, occupied: boolean): void {
    const set = new Set(this.occupiedSubject.value);
    if (occupied) set.add(n);
    else set.delete(n);
    try {
      localStorage.setItem(OCCUPIED_KEY, JSON.stringify([...set]));
    } catch { /* storage unavailable */ }
    this.occupiedSubject.next(set);
  }

  private restore(): number | null {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      const n = v ? Number(v) : NaN;
      return Number.isInteger(n) && n >= 1 && n <= TABLE_COUNT ? n : null;
    } catch {
      return null;
    }
  }

  private restoreOccupied(): Set<number> {
    try {
      const raw = localStorage.getItem(OCCUPIED_KEY);
      if (raw === null) return this.seedRandomBookings();
      const arr: unknown = JSON.parse(raw);
      if (!Array.isArray(arr)) return new Set();
      return new Set(arr.filter((n) => Number.isInteger(n) && n >= 1 && n <= TABLE_COUNT));
    } catch {
      return new Set();
    }
  }

  /** On first load, randomly pre-book some tables as already occupied. */
  private seedRandomBookings(): Set<number> {
    const mine = this.currentTable;
    const seeded = new Set<number>();
    for (let n = 1; n <= TABLE_COUNT; n++) {
      if (n !== mine && Math.random() < 1 / 3) seeded.add(n);
    }
    try {
      localStorage.setItem(OCCUPIED_KEY, JSON.stringify([...seeded]));
    } catch { /* storage unavailable */ }
    return seeded;
  }
}
