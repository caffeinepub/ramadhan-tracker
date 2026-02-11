# Specification

## Summary
**Goal:** Restore reliable admin bootstrapping and improve frontend handling so a user can gain and verify Admin access to reach `/admin` on production.

**Planned changes:**
- Fix backend admin-bootstrap detection so `promoteToAdmin` can correctly determine whether any Admin exists even when there are no `userTasks` entries yet.
- Add a backend query method that returns whether the canister is in bootstrap mode (no Admin exists yet), consistent with the logic used by `promoteToAdmin`.
- Update the Admin access-denied screen to show an English “Bootstrap Admin Access” action only when bootstrap mode is true; on click, call `promoteToAdmin` for the currently logged-in principal, show an English success toast, and refetch/refresh relevant queries so `/admin` becomes accessible without manual cache clearing.
- Improve `/admin` gate error handling to show a clear English error state with a “Retry” action when admin/role checks fail, while keeping the existing loading behavior unchanged.

**User-visible outcome:** On a fresh deployment, an authenticated user can bootstrap themselves to Admin (only when no Admin exists) and then access `/admin`; if admin checks fail due to errors, the UI shows a clear English error message with a retry option.
