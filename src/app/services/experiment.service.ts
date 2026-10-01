import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Variant = 'A' | 'B';

const STORAGE_KEY = 'spice-table-variant';

/**
 * Assigns each visitor to experiment variant A or B (50/50) and persists
 * the assignment in localStorage so the experience is stable across sessions.
 * The variant is attached to every GA4 event as `experiment_variant`.
 */
@Injectable({ providedIn: 'root' })
export class ExperimentService {
  private readonly variantSubject = new BehaviorSubject<Variant>(this.assign());
  readonly variant$ = this.variantSubject.asObservable();

  get variant(): Variant {
    return this.variantSubject.value;
  }

  get isB(): boolean {
    return this.variant === 'B';
  }

  private assign(): Variant {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'A' || stored === 'B') return stored;
      const assigned: Variant = Math.random() < 0.5 ? 'A' : 'B';
      localStorage.setItem(STORAGE_KEY, assigned);
      return assigned;
    } catch {
      return 'A';
    }
  }
}
