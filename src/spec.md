# Specification

## Summary
**Goal:** Fix unrealistic prayer time display, standardize key dashboard UI copy to Bahasa Indonesia, improve the Daily Progress component behavior/consistency, and relocate the report download feature to the Monthly Progress page.

**Planned changes:**
- Fix prayer time calculation/rendering so times are valid (00:00–23:59), realistic for the selected Indonesia timezone (WIB/WITA/WIT), never negative/invalid, and ordered correctly (Fajr < Sunrise < Dhuhr < Asr < Maghrib < Isha).
- Persist and immediately apply the selected timezone (WIB/WITA/WIT) across reloads, and keep correct auto-refresh behavior when the date rolls over.
- Localize affected UI areas to Bahasa Indonesia: Dashboard header copy, Prayer Times section labels/states, daily overview tiles, yesterday progress summary, and report download UI strings (including validation/errors/toasts).
- Improve the Daily Progress (Progres Harian) component UI/behavior: add explicit loading state, show an empty state when no data exists for the date, ensure responsive alignment, and use the shared progress calculation helper for consistent completion logic.
- Remove the report download UI from the Dashboard and render it only on the Monthly Progress page while preserving CSV/PDF export functionality.

**User-visible outcome:** On the Dashboard, prayer times display correctly for WIB/WITA/WIT without negative/invalid times, the relevant UI text is in Bahasa Indonesia, and the Daily Progress view clearly reflects loading/empty states; report downloads (CSV/PDF) are available only from the Monthly Progress page.
