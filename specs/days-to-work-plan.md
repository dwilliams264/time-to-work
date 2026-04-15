# Days to Work — Office Day Management Test Plan

## Application Overview

The 'Days to Work' page allows users to track and manage their office attendance for the current and past months. Users can mark each working day with a status (Office, WFH, Annual Leave, Offsite/Conference, Sick Leave, Public Holiday) by clicking day cells in a monthly calendar grid. A Work Schedule settings panel lets users configure how many days per week they work and how many should be in-office, which sets an attendance target percentage. A stats panel shows Year to Date, This Month, and This Week breakdowns of attendance vs. target. Future days are disabled; only past and today are editable.

## Test Scenarios

### 1. Page Load and Calendar Display

**Seed:** `playwright/e2e/tests/seed.spec.ts`

#### 1.1. Default page load shows current month calendar

**File:** `playwright/e2e/tests/days-to-work/page-load.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/
    - expect: Page title is 'Time to Work — Track your hours. Own your day.'
    - expect: Month navigation displays 'April 2026'
    - expect: The 'Next month' button is disabled
    - expect: The 'Previous month' button is enabled
    - expect: The calendar grid shows only weekdays (Mon–Fri)
    - expect: Working days Apr 1–15 are rendered as enabled clickable buttons showing '—'
    - expect: Working days Apr 16–30 are rendered as disabled buttons with no status label
    - expect: Work Schedule panel header reads '3 of 5 days in office — 60% target'

### 2. Day Status Cycling

**Seed:** `playwright/e2e/tests/seed.spec.ts`

#### 2.1. Clicking a day cycles through all statuses and returns to unset

**File:** `playwright/e2e/tests/days-to-work/day-status-cycle.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/
    - expect: Page loads showing April 2026
  2. Click the 'Wed 1 Apr' day button once
    - expect: Button label updates to 'Wed 1 Apr: Office'
    - expect: Day cell shows 'Office' status label
    - expect: April attendance % in Year to Date chart updates to approximately 9%
  3. Click the 'Wed 1 Apr' day button a second time
    - expect: Button label updates to 'Wed 1 Apr: Work From Home'
    - expect: Day cell shows 'WFH' status label
    - expect: April attendance % resets to 0% (WFH does not count toward office attendance)
  4. Click the 'Wed 1 Apr' day button a third time
    - expect: Button label updates to 'Wed 1 Apr: Annual Leave'
    - expect: Day cell shows 'Leave' status label
  5. Click the 'Wed 1 Apr' day button a fourth time
    - expect: Button label updates to 'Wed 1 Apr: Offsite / Conference'
    - expect: Day cell shows 'Offsite' status label
    - expect: April attendance % updates (Offsite counts toward office attendance)
  6. Click the 'Wed 1 Apr' day button a fifth time
    - expect: Button label updates to 'Wed 1 Apr: Sick Leave'
    - expect: Day cell shows 'Sick' status label
    - expect: April attendance % resets to 0%
  7. Click the 'Wed 1 Apr' day button a sixth time
    - expect: Button label updates to 'Wed 1 Apr: Public Holiday'
    - expect: Day cell shows 'Holiday' status label
  8. Click the 'Wed 1 Apr' day button a seventh time
    - expect: Day cell returns to blank/unset state, showing '—'
    - expect: Button label has no status suffix
    - expect: April attendance % is 0%

#### 2.2. Future days in the current month cannot be clicked

**File:** `playwright/e2e/tests/days-to-work/future-days-disabled.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/
    - expect: Page loads showing April 2026
  2. Observe the 'Thu 16 Apr' day button
    - expect: Button is rendered as disabled and shows no status label
  3. Attempt to click the disabled 'Thu 16 Apr' day button
    - expect: No state change occurs
    - expect: The button remains disabled
    - expect: Stats and attendance percentage are unchanged
  4. Attempt to click the disabled 'Thu 30 Apr' day button
    - expect: No state change occurs
    - expect: The button remains disabled

### 3. Stats Panel

**Seed:** `playwright/e2e/tests/seed.spec.ts`

#### 3.1. This Month tab shows correct attendance breakdown

**File:** `playwright/e2e/tests/days-to-work/stats-this-month.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/
    - expect: Page loads showing April 2026
  2. Click 'Wed 1 Apr' once (→ Office), 'Thu 2 Apr' twice (→ WFH), 'Fri 3 Apr' three times (→ Annual Leave), 'Mon 6 Apr' four times (→ Offsite), 'Tue 7 Apr' five times (→ Sick Leave)
    - expect: Each day reflects the correct status label in the calendar cell
  3. Click the 'This Month' tab in the stats panel
    - expect: Attendance days shows 2 (Office + Offsite both count)
    - expect: WFH days shows 1
    - expect: Leave days shows 2 (Annual Leave + Sick Leave)
    - expect: Available work days shows 11
    - expect: Attendance % is approximately 18%
    - expect: Status indicator reads '✗ Target not met (60%)'

#### 3.2. This Month tab shows target met when attendance is sufficient

**File:** `playwright/e2e/tests/days-to-work/stats-target-met.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/
    - expect: Page loads showing April 2026
  2. Click the 'This Month' tab in the stats panel
    - expect: Attendance days shows 0, available days shows 11, status reads '✗ Target not met (60%)'
  3. Mark days Wed 1, Thu 2, Fri 3, Mon 6, Tue 7, Wed 8, Thu 9 Apr as Office (click each once)
    - expect: Each day shows 'Office' in the calendar cell
  4. Observe the 'This Month' stats panel
    - expect: Attendance days shows 7
    - expect: Attendance % is approximately 64%
    - expect: Progress bar exceeds the 60% marker
    - expect: Status indicator reads '✓ Target met (60%)'

#### 3.3. This Week tab shows stats for the current working week only

**File:** `playwright/e2e/tests/days-to-work/stats-this-week.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/
    - expect: Page loads showing April 2026
  2. Click the 'This Week' tab in the stats panel
    - expect: Available work days shows 3 (Mon 13, Tue 14, Wed 15 Apr — the current week days up to today)
    - expect: Attendance days shows 0
    - expect: WFH days shows 0
    - expect: Leave days shows 0
    - expect: Attendance % shows 0%

#### 3.4. Year to Date tab shows per-month attendance percentages

**File:** `playwright/e2e/tests/days-to-work/stats-year-to-date.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/
    - expect: Year to Date tab is selected by default
  2. Observe the monthly chart without marking any days
    - expect: Jan, Feb, Mar show '0%'
    - expect: Apr shows '0%'
    - expect: May through Dec show '—'
  3. Click 'Wed 1 Apr' once (→ Office)
    - expect: April updates to show a non-zero percentage (approximately 9%)
    - expect: Other months remain unchanged

### 4. Work Schedule Settings

**Seed:** `playwright/e2e/tests/seed.spec.ts`

#### 4.1. Expand and collapse the Work Schedule settings panel

**File:** `playwright/e2e/tests/days-to-work/settings-toggle.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/
    - expect: Work Schedule panel is visible in collapsed state showing only the header summary
  2. Click the 'Expand settings' (+) button
    - expect: Settings panel expands to show 'Days worked per week' and 'Office days per week' controls
    - expect: Button label changes to 'Collapse settings' (−)
  3. Click the 'Collapse settings' (−) button
    - expect: Settings panel collapses and hides the controls
    - expect: Only the header summary remains visible
  4. Click anywhere on the Work Schedule panel header row
    - expect: The settings panel toggles (expands if collapsed, collapses if expanded)

#### 4.2. Changing days worked per week updates target and office day options

**File:** `playwright/e2e/tests/days-to-work/settings-days-worked.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/ and expand the Work Schedule settings
    - expect: Days worked per week shows options: 3, 4, 5 (default active: 5)
    - expect: Office days per week shows options 1–5
    - expect: Target reads '3/5 days = 60%'
  2. Click '4' under 'Days worked per week'
    - expect: The '4' button becomes active
    - expect: Office days per week options update to show only 1–4
    - expect: Header summary updates to '3 of 4 days in office — 75% target'
    - expect: Target in settings reads '3/4 days = 75%'
  3. Click '3' under 'Days worked per week'
    - expect: The '3' button becomes active
    - expect: Office days per week options update to show only 1–3
    - expect: Target percentage recalculates

#### 4.3. Changing office days per week updates the attendance target

**File:** `playwright/e2e/tests/days-to-work/settings-office-days.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/ and expand the Work Schedule settings
    - expect: Default shows 3 office days of 5 worked — 60% target
  2. Click '2' under 'Office days per week'
    - expect: Header summary updates to '2 of 5 days in office — 40% target'
    - expect: Settings display '2/5 days = 40%'
    - expect: 'This Month' stats target updates to 40%
  3. Click '5' under 'Office days per week'
    - expect: Header summary updates to '5 of 5 days in office — 100% target'
    - expect: Settings display '5/5 days = 100%'

#### 4.4. Work schedule settings persist across month navigation

**File:** `playwright/e2e/tests/days-to-work/settings-persistence.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/, expand settings, set 'Days worked per week' to 4 and 'Office days per week' to 2
    - expect: Target reads '2 of 4 days in office — 50% target'
  2. Click 'Previous month' to navigate to March 2026
    - expect: Month displays March 2026
  3. Click 'Next month' to return to April 2026, then expand settings
    - expect: 'Days worked per week' still shows 4 as selected
    - expect: 'Office days per week' still shows 2 as selected
    - expect: Target summary still reads '2 of 4 days in office — 50% target'

### 5. Month Navigation

**Seed:** `playwright/e2e/tests/seed.spec.ts`

#### 5.1. Navigate to a previous month shows all days as editable

**File:** `playwright/e2e/tests/days-to-work/navigation-previous-month.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/
    - expect: Month navigation shows April 2026
  2. Click the 'Previous month' (←) button
    - expect: Month navigation updates to 'March 2026'
    - expect: 'Next month' (→) button becomes enabled
    - expect: 'Previous month' (←) button remains enabled
    - expect: All weekdays in March 2026 are displayed as enabled clickable buttons
    - expect: No days are disabled

#### 5.2. Navigate back to current month re-disables future days

**File:** `playwright/e2e/tests/days-to-work/navigation-return-to-current.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/ and click 'Previous month'
    - expect: March 2026 is displayed with all days enabled
  2. Click 'Next month' (→) to return to April 2026
    - expect: Month navigation displays 'April 2026'
    - expect: 'Next month' button becomes disabled
    - expect: Working days Apr 16–30 are disabled again
    - expect: Working days Apr 1–15 remain clickable

#### 5.3. Cannot navigate beyond the current month

**File:** `playwright/e2e/tests/days-to-work/navigation-no-future-months.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/
    - expect: Month navigation shows April 2026 and 'Next month' is disabled
  2. Attempt to click the disabled 'Next month' button
    - expect: Month remains at 'April 2026'
    - expect: No future month calendar is displayed
    - expect: The button remains in a disabled state

### 6. Data Persistence

**Seed:** `playwright/e2e/tests/seed.spec.ts`

#### 6.1. Marked day statuses persist after page reload

**File:** `playwright/e2e/tests/days-to-work/persistence-reload.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/
    - expect: Page loads showing April 2026
  2. Click 'Wed 1 Apr' once (→ Office) and click 'Thu 2 Apr' twice (→ WFH)
    - expect: Wed 1 Apr shows 'Office' status
    - expect: Thu 2 Apr shows 'WFH' status
  3. Reload the page
    - expect: Wed 1 Apr still shows 'Office' status
    - expect: Thu 2 Apr still shows 'WFH' status
    - expect: Stats reflect the saved data correctly
