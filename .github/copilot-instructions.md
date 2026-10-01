# Spice Table — Angular Restaurant Ordering App

- Angular 17+, standalone components, SCSS, no backend (client-side data only).
- State via BehaviorSubjects in services (`OrderService`, `TableService`, `ExperimentService`).
- Analytics via GA4 gtag.js loaded dynamically in `AnalyticsService`; measurement ID lives in `src/environments/`.
- A/B testing: `ExperimentService` assigns variant A/B (persisted in localStorage), sent as `experiment_variant` param on all GA events.
- Build: `npm install` then `ng serve`.
