# Cut Tracker — Product & Technical Specification

**Version:** 2.0 MVP  
**Status:** Planned  
**Start Date:** September 9, 2026  
**Primary Platform:** Mobile-first PWA  
**Role:** Standalone fitness tracker, designed for future integration into a larger personal system

---

## 1. Purpose

Cut Tracker is a personal cutting-adherence tracker.

Its purpose is to make it easy to:

1. Track how many days a cut has been running.
2. Mark each day as compliant or non-compliant.
3. Record optional weight and nutrition data.
4. Visualize adherence over time.
5. Track weight trends and rate of loss.
6. Look back at historical data and compare adherence against results.

Core question:

> **"I've been cutting for X days. How consistently did I follow the plan, and what happened to my weight?"**

Daily interaction should take **less than 10 seconds**.

---

## 2. Product Principles

### 2.1 Extremely low friction

The primary daily interaction:

```
How did you do today?

🟩 GREEN       🟥 RED
```

Tap → done.

Everything else is optional.

### 2.2 Measure adherence, not perfection

Emphasize:

- Total adherence %
- Long-term consistency
- Weight trend
- Historical performance

Do not make a single red day feel catastrophic.

### 2.3 Retrospective-first design

The application should preserve enough history to answer:

> "I cut for 54 days, followed the plan on 47 days, had 87% adherence, and lost 4.2 kg."

### 2.4 User-defined compliance

The user defines what counts as compliance.

Example:

```
Calories: ≤ 2200 kcal
Protein: ≥ 150 g
No uncontrolled binge
```

The user's explicit GREEN/RED decision remains authoritative. Do not automatically classify a day from calorie/protein numbers. Future versions may offer recommendations, but the manual status is always final.

---

## 3. Cut Lifecycle

A cut has two persisted states:

```
ACTIVE
COMPLETED
```

A user can have multiple historical cuts, with one active cut at a time.

### 3.1 Starting a Cut

Required:

- Start date (defaults to today)

Optional:

- Starting weight
- Target weight (informational only — never auto-ends a cut)
- Calorie target
- Protein target
- Cutting rules (free text)
- Planned end date (informational only — displayed on the progress dashboard as a reference marker, never triggers any automatic behavior)

Cut day numbering is always automatic:

```
cutDay = currentDate - startDate + 1
```

The user never manually enters or maintains a day number.

### 3.2 Ending a Cut

Requires explicit user confirmation:

```
End this cut?

37 days
30 green
7 red
81.1% adherence
-2.6 kg

[ END CUT ]
[ CANCEL ]
```

Historical data remains permanently accessible after ending.

---

## 4. Screens

The MVP contains four primary screens accessed via bottom tab navigation.

### 4.1 Home Screen

Mobile-first primary interface.

```
┌─────────────────────────┐
│       CUT DAY 17        │
│       Sep 25, 2026      │
│                         │
│           🟩            │
│         GREEN           │
│                         │
│     [ CHANGE STATUS ]   │
│                         │
│ ─────────────────────── │
│ Current Streak          │
│ 8 days                  │
│                         │
│ Adherence               │
│ 88.2%                   │
│                         │
│ Weight                  │
│ -1.8 kg                 │
│                         │
│ Green       15          │
│ Red          2          │
└─────────────────────────┘
```

**States:**

If today is not logged:

```
[ LOG TODAY ]

🟩 GREEN       🟥 RED
```

After logging:

```
TODAY: 🟩 GREEN

[ CHANGE STATUS ]
```

**Change Status** flow: tap → select new status → confirm → done. This is the fix for accidental taps. Do not open a full edit form — just swap the status.

**Unlogged days nudge:** If there are unlogged days between the last entry and today, show a subtle message:

```
You have 3 unlogged days.    [ VIEW ]
```

Tapping navigates to the calendar. Do not auto-prompt or block the screen — this is informational, not a guilt trip.

**No active cut state:** If no cut is active, show a prompt to start one. Do not show an empty dashboard.

### 4.2 Calendar

Primary historical visualization.

```
        SEPTEMBER 2026

MON  TUE  WED  THU  FRI  SAT  SUN

 7    8   🟩   🟩   🟥   🟩   🟩
🟥   🟩   🟩   🟩   🟥   🟩   🟩
🟩   🟩   🟩   🟥   🟩   🟩   🟩
```

Status colors:

- 🟩 GREEN — compliant
- 🟥 RED — non-compliant
- ⬜ GREY — no entry / unlogged

Days before the cut start date do not receive any status.

Navigation: swipe or arrows to move between months, constrained to the active cut's date range.

**Tap a day** → detail sheet:

```
September 17
CUT DAY 9

Status: 🟩 GREEN
Weight: 81.7 kg
Calories: 2050 kcal
Protein: 157 g
Training: ✓

Notes:
Good day. Felt hungry at night.
```

**Edit mode:** every field on the detail sheet is editable. Past unlogged (GREY) days can be logged from here by tapping them and entering data.

### 4.3 Stats

Statistics and weight tracking combined into a single scrollable screen.

**Duration block:**

```
CUT DAY 37

Start: Sep 9, 2026
Today: Oct 15, 2026
```

**Adherence block:**

```
GREEN DAYS       30
RED DAYS          7

ADHERENCE       81.1%
```

**Streaks block:**

```
CURRENT STREAK
6 days 🔥

BEST STREAK
14 days
```

Streaks are secondary metrics. Avoid shame-based messaging.

**Weight block:**

```
STARTING WEIGHT     82.4 kg
CURRENT WEIGHT      79.8 kg
CHANGE              -2.6 kg
AVG WEEKLY LOSS     0.49 kg/week
```

**Weight chart:** date on X axis, weight on Y axis.

- Raw daily weight as dots
- 7-day moving average as a line (emphasized — this is the trend the user should read)

**Progress block (if target weight is set):**

```
79.8 ━━━━━━━━━━━●━━━━ 75.0

Starting    Current    Target
82.4 kg     79.8 kg    75.0 kg
```

### 4.4 Settings

- **Cut rules:** free text describing personal compliance criteria
- **Calorie target:** number input (kcal)
- **Protein target:** number input (g)
- **Target weight:** number input
- **Weight units:** toggle between kg and lbs (display only — stored as kg internally)
- **Export CSV:** download all entries for the active cut
- **End Cut:** with confirmation dialog (Section 3.2)
- **Cut History:** list of completed cuts → tap to view read-only calendar/stats
- **Sign Out**

---

## 5. Daily Entry — Data Model

### Required

Adherence status:

```
🟩 GREEN
🟥 RED
```

### Optional

| Field    | Format                 | Example                           |
| -------- | ---------------------- | --------------------------------- |
| Weight   | number (kg internally) | 81.7                              |
| Calories | number (kcal)          | 2050                              |
| Protein  | number (g)             | 157                               |
| Training | boolean                | ✓ / —                             |
| Notes    | free text              | "Good day. Felt hungry at night." |

A missing DailyEntry for a date means GREY / UNLOGGED. Grey days do not count toward adherence calculations.

---

## 6. Calculations

All computed automatically. The user never manually enters any of these.

### Cut Day

```
cutDay = currentDate - startDate + 1
```

### Tracked Days

```
trackedDays = greenDays + redDays
```

### Adherence

```
adherence = greenDays / trackedDays × 100
```

Grey/unlogged days are excluded from the denominator.

### Weight Change

```
weightChange = currentWeight - startingWeight
```

### Average Weekly Loss

```
weeklyLoss = weightChange / daysElapsed × 7
```

### 7-Day Moving Average

For each day with a weight entry, average that day's weight with the previous 6 days that have entries. Skip days without weight data — do not interpolate.

### Current Streak

Consecutive GREEN days counting backward from the most recent logged day. Breaks on the first RED or GREY day.

### Best Streak

Longest consecutive GREEN sequence across the entire cut.

---

## 7. Cut History

Users can view completed cuts.

```
MY CUTS

Current Cut
Sep 9, 2026 — Present
82.4 → 79.8 kg
81% adherence

Summer Cut
May 3 — Jun 28
86.2 → 81.9 kg
76% adherence
```

Each historical cut opens in read-only mode with its own calendar, stats, and weight data.

---

## 8. Data Model

### User

```
users (managed by Supabase Auth)
- id              UUID (from auth.users)
- created_at      TIMESTAMPTZ
```

No custom user table needed for MVP. Supabase Auth provides the user record. Add a `preferences` table for user-specific settings.

### Preferences

```
preferences
- id              UUID  PK
- user_id         UUID  FK → auth.users  UNIQUE
- weight_unit     TEXT  DEFAULT 'kg'     CHECK (weight_unit IN ('kg', 'lbs'))
- created_at      TIMESTAMPTZ
- updated_at      TIMESTAMPTZ
```

### Cut

```
cuts
- id              UUID  PK
- user_id         UUID  FK → auth.users
- start_date      DATE  NOT NULL
- end_date        DATE
- starting_weight NUMERIC
- target_weight   NUMERIC
- calorie_target  INTEGER
- protein_target  INTEGER
- rules           TEXT
- planned_end_date DATE
- status          TEXT  NOT NULL  DEFAULT 'ACTIVE'  CHECK (status IN ('ACTIVE', 'COMPLETED'))
- created_at      TIMESTAMPTZ
- updated_at      TIMESTAMPTZ
```

Constraint: only one `ACTIVE` cut per user at a time (enforced via partial unique index).

### DailyEntry

```
daily_entries
- id              UUID  PK
- user_id         UUID  FK → auth.users
- cut_id          UUID  FK → cuts
- date            DATE  NOT NULL
- status          TEXT  NOT NULL  CHECK (status IN ('GREEN', 'RED'))
- weight          NUMERIC
- calories        INTEGER
- protein         INTEGER
- training        BOOLEAN
- notes           TEXT
- created_at      TIMESTAMPTZ
- updated_at      TIMESTAMPTZ
```

Constraint: unique on `(user_id, cut_id, date)` — one entry per day per cut.

All weight values are stored in kg regardless of display preference.

---

## 9. Authentication

Google sign-in only via Supabase Auth for the MVP. No email+password, no password reset flows.

Single sign-in method keeps the auth surface minimal. Add email+password later if needed.

Data isolation is enforced at the database level via Row Level Security.

---

## 10. Database Security

**Row Level Security (RLS) is enabled from day one.**

Every table with user data has a policy:

```sql
CREATE POLICY "Users can only access own data"
ON table_name
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
```

Do not rely on frontend filtering. The database must enforce ownership.

---

## 11. Technology Stack

### Frontend

```
React
Vite
Tailwind CSS
```

Mobile-first design. All touch targets ≥ 44px.

### Backend / Database / Auth

```
Supabase
```

Provides: Authentication (Google OAuth), PostgreSQL, Row Level Security, auto-generated APIs.

### Charts

```
Recharts
```

Used for weight trend graph.

### Hosting

```
Vercel
```

Deployment:

```
GitHub → Vercel → Cut Tracker PWA → Supabase
```

---

## 12. Mobile Strategy

Build as a **Progressive Web App (PWA)**.

```
Chrome → Add to Home Screen → Cut Tracker
```

Benefits:

- Android support without APK distribution
- Easy deployment and updates
- Desktop access
- App-like experience

Only build a native APK if a genuine native requirement appears.

PWA setup:

- Web app manifest with name, icons, theme color, display: standalone
- Basic service worker for Add to Home Screen support
- No offline-first caching in MVP (Supabase requires network)

---

## 13. Service Layer

All Supabase queries go through a clean service module:

```
cutService.ts

  startCut(params)        → creates a new active cut
  getActiveCut()          → returns the current active cut
  getToday()              → returns today's entry + cut day number
  logDay(params)          → creates or updates today's entry
  updateEntry(date, params) → updates any day's entry
  getEntries(dateRange)   → returns entries for calendar/stats
  getWeightHistory()      → returns all weight entries for charting
  getCutSummary()         → returns computed stats
  endCut()                → marks the active cut as COMPLETED
  getCutHistory()         → returns all completed cuts
  exportCSV()             → generates CSV of all entries
```

This layer is the natural interface for future agent/tool integration. When the time comes, these functions become callable tools with minimal refactoring.

---

## 14. Error States & Edge Cases

### No active cut

Home screen shows a "Start a Cut" prompt. Calendar and Stats tabs show empty states with the same prompt.

### No entries yet

Home screen shows the cut day number and the LOG TODAY prompt. Stats show zeroes. Calendar shows all GREY.

### Unlogged gap days

If the user opens the app after missing several days, the home screen shows a nudge ("You have X unlogged days") linking to the calendar. Do not block the UI or force backfill. The user can log today immediately and backfill later — or never.

### Accidental tap

The CHANGE STATUS button on the home screen allows a quick status swap (tap → confirm → done) without opening the full edit form.

### Multiple weight entries per day

Use the most recent entry for that date. The daily_entries table stores one weight value per day — updating overwrites the previous value.

### Weight unit switching

Changing the display unit in Settings does not convert stored data. Stored values are always kg. The UI converts on display: `displayWeight = weightUnit === 'lbs' ? storedKg * 2.20462 : storedKg`.

### Planned end date reached

Nothing happens automatically. The planned end date is informational. The user must explicitly end the cut.

---

## 15. UX Guidelines

### Do

- Make daily logging nearly instant
- Make the calendar visually obvious
- Use green/red/grey consistently
- Make historical editing easy
- Keep the dashboard simple
- Emphasize long-term adherence
- Preserve historical data permanently
- Keep personal data private by default
- Use the 7-day moving average for weight trend interpretation

### Don't

- Shame the user for red days
- Make users enter unnecessary data
- Force calorie tracking
- Make streaks the primary success metric
- Add excessive gamification
- Auto-classify days based on nutrition numbers
- Auto-end cuts for any reason
- Block the daily log flow with prompts or modals

---

## 16. Success Criteria

The MVP is successful if a user can:

1. Sign in with Google.
2. Start a cut.
3. See the correct cut day number automatically.
4. Mark today GREEN or RED in under 10 seconds.
5. Fix an accidental status tap easily.
6. View a monthly calendar of previous days.
7. Tap a day to see its details.
8. Edit any historical entry.
9. Log past unlogged days.
10. Record weight.
11. View weight trend with 7-day moving average.
12. See adherence percentage and green/red counts.
13. See current and best streak.
14. See average weekly weight loss.
15. End a cut with a summary confirmation.
16. View historical completed cuts.
17. Export data as CSV.
18. Use the application comfortably from an Android phone via PWA.

---

## 17. Explicitly Out of Scope

Do not build:

- Food database or barcode scanner
- Full calorie tracker
- Recipe database
- Social features or public profiles
- AI diet coach or meal planner
- Complex workout tracking
- Wearable integrations
- Body composition estimation
- Subscription or payment system
- Push notifications (use a phone alarm instead)
- Email + password authentication
- Offline-first caching
- Agent/LLM integration (deferred to post-MVP)

The MVP is a **simple adherence + weight trend tracker**.

---

## 18. Future Versions

### v2

- 14-day moving average
- Progress photos
- Waist measurement
- Additional body measurements
- Email + password auth option

### v3

- Automatic calorie/protein adherence suggestions (user's manual status remains authoritative)
- Progress photo timeline
- Body measurement graphs
- Cut-to-cut comparison view

### v4 — Agent Integration

- Expose service layer as callable tools for a personal agent
- Natural language logging ("I stayed on diet today" → log GREEN)
- Cross-skill analysis combining diet adherence, workouts, and weight

---

## 19. Build Phases

### Phase 1 — Foundation (Days 1–3)

**Goal:** App shell, auth, database, and a user can create a cut.

| Task                 | Details                                                                                      |
| -------------------- | -------------------------------------------------------------------------------------------- |
| Repo setup           | React + Vite + Tailwind, deploy to Vercel                                                    |
| Supabase project     | Create `cuts`, `daily_entries`, `preferences` tables per Section 8                           |
| RLS policies         | All rows scoped to `auth.uid()`                                                              |
| Partial unique index | Enforce one ACTIVE cut per user                                                              |
| Auth                 | Google sign-in via Supabase Auth, session persistence, protected routes                      |
| PWA manifest         | Name, icons, theme color, `display: standalone` — enough for Add to Home Screen              |
| App shell            | Bottom tab navigation: Home, Calendar, Stats, Settings                                       |
| Start Cut flow       | Start date (defaults today) + optional starting weight + optional targets → writes to `cuts` |
| Settings screen      | Display current cut info, Sign Out button                                                    |

**Deliverable:** Sign in on your phone, start a cut, see an empty home screen that knows it's Day 1.

---

### Phase 2 — Daily Logging (Days 4–6)

**Goal:** The core loop works. Log GREEN/RED and see today's status.

| Task                         | Details                                                           |
| ---------------------------- | ----------------------------------------------------------------- |
| Service layer                | `cutService.ts` with `getActiveCut()`, `getToday()`, `logDay()`   |
| Home screen — logged state   | Cut day number, today's date, status badge, CHANGE STATUS button  |
| Home screen — unlogged state | LOG TODAY prompt with GREEN/RED buttons                           |
| Log flow                     | Tap GREEN or RED → write to `daily_entries` → home screen updates |
| Change status flow           | Tap CHANGE STATUS → select new status → confirm → update          |
| Home screen stats            | Current streak, adherence %, green/red counts                     |
| No active cut state          | Redirect to Start Cut                                             |

**Deliverable:** Open the app, tap GREEN, done in under 10 seconds.

---

### Phase 3 — Calendar (Days 7–9)

**Goal:** Full historical view with editing.

| Task                  | Details                                                                   |
| --------------------- | ------------------------------------------------------------------------- |
| Monthly calendar grid | GREEN/RED/GREY cells for the active cut                                   |
| Month navigation      | Arrows or swipe, constrained to cut date range                            |
| Day detail sheet      | Tap a day → show status, weight, calories, protein, training, notes       |
| Edit mode             | Every field on the detail sheet is editable, save updates `daily_entries` |
| Log past days         | Tap a GREY day → open log form → create entry                             |
| Unlogged days nudge   | Home screen shows "You have X unlogged days → View" if gaps exist         |

**Deliverable:** Look back at your cut history, fill in any gaps, edit mistakes.

---

### Phase 4 — Weight Tracking (Days 10–12)

**Goal:** Weight logging and trend visualization.

| Task                      | Details                                                    |
| ------------------------- | ---------------------------------------------------------- |
| Weight input on daily log | Optional field after GREEN/RED selection                   |
| Weight on day detail      | Editable weight field on the calendar detail sheet         |
| Weight chart              | Recharts: raw daily dots + 7-day moving average line       |
| Home screen weight        | Show weight change from starting weight                    |
| Weight unit preference    | kg/lbs toggle in Settings, stored in `preferences` table   |
| Display conversion        | All stored as kg, converted on render when lbs is selected |

**Deliverable:** Track weight, see the trend line, know your rate of loss.

---

### Phase 5 — Stats, History & Polish (Days 13–16)

**Goal:** Full stats dashboard, cut history, CSV export, production polish.

| Task                  | Details                                                                   |
| --------------------- | ------------------------------------------------------------------------- |
| Stats screen          | Duration, adherence block, streaks, weight summary, avg weekly loss       |
| Progress bar          | Visual target progress if target weight is set                            |
| Weight chart on Stats | Full weight chart with 7-day MA (same as Phase 4, placed on Stats screen) |
| End Cut flow          | Summary confirmation dialog per Section 3.2                               |
| Cut History           | List completed cuts in Settings → tap for read-only calendar/stats        |
| CSV export            | Download all entries for the active cut as CSV from Settings              |
| Loading states        | Skeleton screens while data loads                                         |
| Empty states          | Clear messaging when no data exists for a section                         |
| Error handling        | Toast notifications for failed saves/loads                                |
| Mobile polish         | Safe-area insets, scroll behavior, touch targets ≥ 44px                   |
| PWA testing           | Full flow test on Android phone, fix any Add to Home Screen quirks        |

**Deliverable:** Production-ready MVP. All 18 success criteria from Section 16 are met.

---

## 20. Initial Cut

Development and testing cut:

```
START DATE:  September 9, 2026
CUT DAY:     1
```

The application automatically increments from this date. Use this as real data from day one — build the app while using it.

---

## 21. Core Philosophy

```
OPEN
  ↓
SEE CUT DAY
  ↓
LOG GREEN / RED
  ↓
OPTIONALLY LOG WEIGHT
  ↓
DONE
```

> Don't optimize for making the app complicated. Optimize for making it impossible to forget what happened during the cut.
