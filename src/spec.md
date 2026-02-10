# Specification

## Summary
**Goal:** Ensure the Dashboard Daily Content (Tadabbur/Hadith/Islamic Quote) section reliably appears with a clear empty/error state, and that existing deployments have default content seeded so the carousel is not blank.

**Planned changes:**
- Update the Dashboard daily content carousel section to render an English empty state message when `getContents()` returns an empty array (instead of rendering nothing).
- Add an English error state message in the Daily Content section when the daily content fetch/query fails, while keeping the rest of the Dashboard functional.
- Add backend upgrade/seed logic to ensure at least one `DailyContent` record exists on existing deployments with zero items, without overwriting any existing admin-managed content.

**User-visible outcome:** The Dashboard always shows a Daily Content card: it auto-rotates through Tadabbur/Hadith/Islamic Quote when content exists, otherwise it shows a helpful English empty state; if loading fails, it shows an English error message instead of disappearing.
