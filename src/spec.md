# Specification

## Summary
**Goal:** Ensure daily progress entries persist reliably across app exit/refresh, and update the monthly statistics visualization to a line-only chart.

**Planned changes:**
- Fix daily tracking persistence so saved progress for the selected date is fetched from the backend and rendered correctly after refresh/tab close/reopen.
- Prevent data loss on navigation/exit by handling in-flight saves (complete reliably or show save-in-progress / save-failed messaging).
- Ensure partial updates for a given date preserve already-saved module fields and do not overwrite other modules’ values; handle saving when no existing record is present without runtime errors.
- Replace the monthly progress bar visualization with an SVG-based line chart (no bars), keeping percentage Y-axis labels and day labels on the X-axis, including horizontal scrolling and correct empty-state behavior.
- Update any newly added/modified loading/error/empty UI strings in touched areas to English (leave untouched strings as-is).

**User-visible outcome:** Users can record daily progress and return later (or refresh) to see the same date’s saved values without re-entering them, and the monthly progress page shows a scrollable line chart of daily percentage progress with appropriate labels and unchanged empty-state behavior.
