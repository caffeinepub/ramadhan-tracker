# Specification

## Summary
**Goal:** Fix Indonesian prayer time calculations so WIB/WITA/WIT schedules match real-world expectations for the selected date, and prevent obviously incorrect schedules from being shown.

**Planned changes:**
- Update `frontend/src/utils/prayerTimes.ts` to compute prayer times correctly for Indonesian timezones (WIB/WITA/WIT) for the selected date, ensuring times are valid and stay within the same day.
- Add/adjust validation of computed prayer times (format, range, chronological order) before displaying them in the UI.
- Update `frontend/src/components/dashboard/PrayerTimesSection.tsx` to show a user-visible error state with an English Retry action when validation fails, and recompute on Retry without a hard refresh.

**User-visible outcome:** Prayer Times show sensible, correctly ordered schedules for WIB/WITA/WIT on the selected date; if computation fails, users see an English error state with a working Retry button instead of incorrect times.
