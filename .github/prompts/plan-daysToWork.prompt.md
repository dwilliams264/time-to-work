# Days to Work — Office Attendance Tracker

## Overview

Extend the Time to Work app with a second page for tracking and visualising office attendance against the company's mandatory 3-days-per-week requirement. Attendance % is calculated across configurable periods (week, month, year, half-year) and compared against an auto-computed target based on the user's working schedule.

---

## Navigation

Add `react-router-dom`. The shared app header gains two nav tabs linking to `/` (Time to Work) and `/days-to-work` (Days to Work).

---

## Day Types

| Type | Label | Counts as… |
|---|---|---|
| `office` | Office | Attendance day ✅ |
| `offsite` | Offsite / Conference | Attendance day ✅ |
| `wfh` | Work From Home | Work day only |
| `annual-leave` | Annual Leave | Excluded from available days |
| `sick` | Sick Leave | Excluded from available days |
| `public-holiday` | Public Holiday | Excluded from available days |

---

## Attendance Calculation

**Office attendance % = (Attendance days ÷ Available work days) × 100**

- **Total work days** = weekdays (Mon–Fri) in period, minus public holidays
- **Available work days** = Total work days − Annual Leave − Sick Leave
- **Attendance days** = Office days + Offsite/Conference days

**Auto-target rules:**

| Days worked per week | Target % |
|---|---|
| 5 | 60% |
| 4 | 75% |
| 3 or fewer | 100% |

---

## Worked Example (from spec)

- 4-week month = 20 work days
- 2 days annual leave → 18 available work days
- 11 office + 1 offsite = 12 attendance days
- 12 ÷ 18 = **67% attendance**
- Works 5 days/week → target 60% → **target met ✅**

---

## Storage

New localStorage prefix: `daysToWork_`

- `daysToWork_settings` — global settings (days per week)
- `daysToWork_day_YYYY-MM-DD` — individual day type entries
- **Retention**: 30 days (auto-cleanup on app load)

---

## Implementation Phases

### Phase 1 — Routing & Navigation

1. Install `react-router-dom` (`yarn add react-router-dom`)
2. Wrap the app with `<BrowserRouter>` in `src/main.tsx`
3. Refactor `src/App.tsx` into a layout shell: shared `<header>` with nav tabs (`Time to Work` / `Days to Work`) using `<NavLink>`, plus `<Routes>` definitions
4. Extract current page content from `App.tsx` into `src/pages/TimeToWork/index.tsx` (near-copy/paste, no behaviour changes)
5. Create `src/pages/DaysToWork/index.tsx` as an empty placeholder wired to `/days-to-work`

### Phase 2 — Data Layer

6. **Types** — `src/types/attendance.ts`:
   - `DayType`: `'office' | 'wfh' | 'annual-leave' | 'offsite' | 'sick' | 'public-holiday'`
   - `AttendanceDay`: `{ date: string; type: DayType }` (date as `YYYY-MM-DD`)
   - `AttendanceSettings`: `{ daysWorkedPerWeek: 3 | 4 | 5 }`

7. **Constants** — `src/constants/attendance.ts`:
   - `DEFAULT_DAYS_PER_WEEK = 5`
   - `AUTO_TARGET_MAP: Record<3|4|5, number> = { 3: 100, 4: 75, 5: 60 }`
   - `DAY_TYPE_CONFIG` — label, colour class, and role for each type:
     - `office` → attendance day (green)
     - `offsite` → attendance day (teal)
     - `wfh` → work day, not attendance (blue)
     - `annual-leave` → excluded from available days (amber)
     - `sick` → excluded from available days (orange)
     - `public-holiday` → excluded from total work days (grey)

8. **Storage service** — `src/utils/attendanceStorage.ts` (`AttendanceStorageService`):
   - Mirrors the pattern in `src/utils/storage.ts`
   - `saveDay(date: string, type: DayType | null)` / `loadDay(date: string)`
   - `saveSettings(settings)` / `loadSettings()`
   - `getAllDaysInRange(start: Date, end: Date): AttendanceDay[]`
   - `cleanupOldData()` — removes entries older than 30 days

9. **Calculations** — `src/utils/attendanceCalculations.ts`:
   - `getWeekdays(start: Date, end: Date): Date[]` — Mon–Fri only
   - `calculateAttendance(days: AttendanceDay[], periodStart: Date, periodEnd: Date, settings: AttendanceSettings): AttendanceResult`
     - Returns `{ totalWorkDays, availableWorkDays, attendanceDays, wfhDays, leaveDays, attendancePct, targetPct, metTarget }`
   - Period boundary helpers:
     - `getThisWeekRange(date?: Date): [Date, Date]` — Mon to today (or Fri if past)
     - `getThisMonthRange(date?: Date): [Date, Date]`
     - `getThisYearRange(date?: Date): [Date, Date]`
     - `getHalfYearRange(date?: Date): [Date, Date]` — H1 = Jan–Jun, H2 = Jul–Dec

10. **Hook** — `src/hooks/useAttendanceData.ts`:
    - Loads/saves settings and day entries
    - Returns `{ settings, updateSettings, getDayType, setDayType, attendanceDays }`
    - Runs `cleanupOldData()` on mount

### Phase 3 — Components

11. **`AttendanceSettings`** — `src/components/days-to-work/attendance-settings/`:
    - Collapsible panel (same expand/collapse UI pattern as `GoalSetter`)
    - Header: "Attendance Target: 60% (3 of 5 days)"
    - Days-per-week selector: toggle buttons for 3, 4, 5 (like quick-goal buttons)
    - Auto-computes and displays resulting target %
    - Props: `settings: AttendanceSettings`, `onSettingsChange`

12. **`DayCell`** — `src/components/days-to-work/week-grid/day-cell/`:
    - Displays one Mon–Fri cell: day name, date number, day-type chip
    - Click cycles: `undefined → office → wfh → annual-leave → offsite → sick → public-holiday → undefined`
    - Future days (after today) are read-only / greyed out
    - Colour-coded background from `DAY_TYPE_CONFIG`
    - Props: `date: Date`, `type: DayType | undefined`, `onTypeChange`, `isDisabled`

13. **`WeekGrid`** — `src/components/days-to-work/week-grid/`:
    - 5-column Mon–Fri grid of `DayCell` components
    - Week navigation: ← / → arrow buttons (same style as date navigation)
    - Week label: "17 Mar – 21 Mar 2026"
    - Back limit: 4 weeks (aligns with 30-day storage retention)
    - Forward limit: current week only

14. **`AttendanceStats`** — `src/components/days-to-work/attendance-stats/`:
    - Four period tabs: **This Week** / **This Month** / **This Year** / **Half Year**
    - Reuses `StatCard` and `ProgressBar` from `src/components/time-stats/`
    - Per period: attendance %, available work days, attendance days, target met/not met badge

### Phase 4 — Page Assembly

15. Compose `src/pages/DaysToWork/index.tsx`:
    - Same two-column layout as `TimeToWork`: sticky sidebar left, main content right
    - Sidebar: `<AttendanceSettings>` + `<AttendanceStats>`
    - Main: `<WeekGrid>`
    - Consumes `useAttendanceData` hook

### Phase 5 — Tests

16. **Unit tests** — `src/test/utils/attendanceCalculations.test.ts`:
    - Worked example from spec: 12 ÷ 18 = 67%, target 60%, `metTarget: true`
    - Each period boundary helper
    - Edge cases: month with public holidays, all-leave week, zero available days
    - `getWeekdays` across month/year boundaries

17. **E2E tests**:
    - `playwright/e2e/pageobjects/days-to-work.page.ts` — mirrors existing page object pattern
    - `playwright/e2e/tests/days-to-work.spec.ts`:
      - Navigate to `/days-to-work` via header tab
      - Toggle day type on a cell and verify persistence after reload
      - Verify stat cards update correctly
      - Verify `/` still renders Time to Work (regression check)

---

## New Files

| File | Purpose |
|---|---|
| `src/types/attendance.ts` | Domain types |
| `src/constants/attendance.ts` | Defaults, target map, day type config |
| `src/utils/attendanceCalculations.ts` | Calculation logic + period helpers |
| `src/utils/attendanceStorage.ts` | localStorage service |
| `src/hooks/useAttendanceData.ts` | Persisted state hook |
| `src/pages/TimeToWork/index.tsx` | Extracted Time to Work page |
| `src/pages/DaysToWork/index.tsx` | New Days to Work page |
| `src/components/days-to-work/week-grid/` | WeekGrid + DayCell components |
| `src/components/days-to-work/attendance-settings/` | Settings panel component |
| `src/components/days-to-work/attendance-stats/` | Stats panel component |
| `src/test/utils/attendanceCalculations.test.ts` | Unit tests |
| `playwright/e2e/pageobjects/days-to-work.page.ts` | E2E page object |
| `playwright/e2e/tests/days-to-work.spec.ts` | E2E tests |

## Modified Files

| File | Change |
|---|---|
| `package.json` | Add `react-router-dom` |
| `src/main.tsx` | Add `<BrowserRouter>` |
| `src/App.tsx` | Refactor to layout shell with `<Routes>` + nav tabs |
| `src/App.css` | Add `.page-nav`, `.page-nav-link`, `.active` tab styles |

---

## Scope Exclusions (v1)

- No custom target % override — auto-calculated from `daysWorkedPerWeek` only
- No export or reporting features
- No future-day logging (read-only after today)
- No team-level aggregation
- No half-year "rolling window" — H1/H2 are fixed calendar halves (Jan–Jun / Jul–Dec)

---

## Open Questions

1. **Week start day** — plan assumes Monday. Confirm if Sunday-start is preferred.
2. **Half-year period** — currently defined as H1 = Jan–Jun, H2 = Jul–Dec. Confirm vs. a rolling 6-month window.
3. **Sick leave** — currently excluded from available days (same as annual leave). Confirm this is correct; some policies count sick days against office target.
