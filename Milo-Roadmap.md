# Milo — Personal Assistant App
### Development Roadmap

Stack: React Native (Android) + Express backend, deployed via Render + Play Store internal testing.
Wake word: **"Hey Milo"** (Picovoice Porcupine)

Mobile app runs on Expo SDK 54 (React Native 0.81, React 19) as of 2026-08-15.

---

## Phase 0 — Setup (Day 0-1)

- [x] Create GitHub repo `kumudha94/friendly-personal-assistant`
- [x] Init React Native app (Android target only, strip iOS config)
- [x] Init Express backend (reuse FinanceTracker's folder structure/patterns)
- [x] Set up Render deployment config for backend (render.yaml — connect repo in Render dashboard to finish)
- [x] Set up basic navigation shell: Dashboard, Habits, Reminders tabs
- [x] Add `.env` handling for API keys / config

DB: Neon Postgres via Drizzle (same pattern as FinanceTracker, separate Neon project).

---

## Phase 1 — Habits Module (Week 1)

**Backend**
- [x] `habits` table: id, name, frequency (daily/weekly/custom), targetCount, createdAt
- [x] `habit_logs` table: id, habitId, date, completed
- [x] Routes: `POST /habits`, `GET /habits`, `PATCH /habits/:id`, `DELETE /habits/:id`
- [x] Routes: `POST /habit_logs` (check-off), `GET /habit_logs?date=`

**Frontend**
- [x] Create habit form (name, frequency picker, target)
- [x] Habit list view with today's check-off toggle
- [x] Streak calculation (consecutive completed days)
- [x] Weekly view (7-day grid per habit)

**Done when:** you can create a habit, check it off daily, and see a streak count.

---

## Phase 2 — Reminders Module (Week 1-2)

**Backend**
- [x] `reminders` table: id, title, time, repeatDays, active, createdAt
- [x] Routes: `POST /reminders`, `GET /reminders`, `PATCH /reminders/:id`, `DELETE /reminders/:id`

**Frontend**
- [x] Create reminder form (title, time picker, repeat days)
- [x] Local notification scheduling (`expo-notifications` — see note below)
- [x] Reminder list with snooze / active-toggle actions
- [x] Reschedule logic for recurring reminders (handled natively by OS weekly triggers — no app-side reschedule-after-fire needed)

**Done when:** a reminder fires as a local Android notification at the set time and repeats correctly.

> Note: used `expo-notifications` instead of `notifee`/`react-native-push-notification` since the
> app is staying in the Expo managed workflow (no prebuild/eject needed, matches FinanceTracker's
> mobile app which already uses the same package). Local notification scheduling works fully in
> Expo Go on SDK 50, so this doesn't block on-device testing.

---

## Phase 3 — Dashboard (Week 2)

- [x] Home screen pulling: today's habits (checked/unchecked), upcoming reminders, streak summary
- [x] Simple, glanceable layout — this is what "Hey Milo" will open into
- [x] Empty states for new users

---

## Phase 4 — Wake Word Integration (Week 2-3)

Deliberately last — everything above is proven CRUD/notification work; this is the one
genuinely novel, highest-risk piece (foreground audio service + battery behavior across
Android OEMs). Complete Phases 1-3 first, then spike this before committing further.

> **Blocked (2026-08-15):** Picovoice Console is gating the account (`info@dreamdaycrew.com`)
> behind manual commercial-use review — "Home" and the model consoles (where the AccessKey lives)
> are inaccessible until Picovoice's team approves it, on an unknown timeline. Nothing to do here
> until that clears; no workaround exists. Revisit once approved.

- [ ] Train custom wake word "Milo" on Picovoice Console — download `.ppn` model
- [ ] Integrate `@picovoice/porcupine-react-native`
- [ ] Android foreground service with persistent low-priority notification
- [ ] Request `RECORD_AUDIO`, foreground service, and notification permissions (Android 13+)
- [ ] On wake word detected → deep link → Dashboard screen
- [ ] Test battery impact over a full day of normal use

**Done when:** saying "Hey Milo" reliably opens the app to Dashboard, with acceptable battery drain.

---

## Phase 5 — Play Store Internal Testing (Week 3)

- [x] Build signed AAB
- [x] Write privacy policy (on-device audio processing, no storage/transmission)
- [x] Set up Play Console internal/closed testing track
- [x] Upload, add yourself as tester, verify install flow

**Deployed (2026-08-15):** Live on Play Store internal testing.

---

## Phase 6 — V2 Backlog (post-launch, prioritize later)

Group A — Tracking
- [x] Water intake (quick-tap logging, daily target, progress bar) — new Water tab + compact Dashboard widget
- [x] Mood/health check-in (scale + energy + sleep + notes) — new Wellness tab, "Check-in" sub-view
- [x] Sleep log — folded into the mood check-in's `sleepHours` field rather than a separate tracker (the check-in bullet already listed "sleep" as one of its fields)
- [x] Weight/body metrics — new "Weight" screen under More (kg/lbs toggle, history with trend deltas)
- [x] Medication/symptom tracker + refill alerts — new "Medications" screen under More, Medications/Symptoms sub-view; taking a dose decrements quantity and alerts when it hits the refill threshold
- [x] Menstrual cycle tracking — new "Cycle" screen under More, logs period start/end, predicts next start from average cycle length

Group B — Planning
- [x] Goals module (linked to habits) — new Goals tab, optional habit link shows that habit's streak
- [x] Journaling (daily notes) — new Journal tab, doubles as weekly/monthly review via a type selector
- [x] Weekly/monthly review prompts — static prompt text shown per type in the Journal composer (not separate structured Q&A storage)

Group C — Intelligence
- [x] Insights dashboard (correlations: water↔mood, sleep↔energy, streak↔mood) — new Wellness tab, "Insights" sub-view. "Streak↔mood" implemented as daily habit-completion-count↔mood (a historical per-day streak reconstruction wasn't worth the complexity for a personal app)
- [x] Claude-powered daily/weekly digest — `GET /digest?period=daily|weekly`, new "Digest" screen under More
- [x] Natural language quick-add ("remind me to call mom at 6") — `POST /quick_add`, new "Quick add" screen under More, uses Claude tool-use to classify into a reminder/habit/goal
- [ ] Follow-up voice command after wake word ("log water", "how am I doing") — blocked on Phase 4, which is on hold

> Note (2026-08-15): live `ANTHROPIC_API_KEY` provided and wired in (`.env`, gitignored, not
> FinanceTracker's — this is Milo's own key). **The Render dashboard still needs this same key
> added as an environment variable** for the digest/quick-add routes to work in production; local
> dev and the routes' own error handling both already account for it being briefly unset there
> (`getAnthropicClient()` returns null instead of crashing server startup, and the two routes
> return a 502 with a clear message rather than taking the whole backend down).

Group D — Polish & Integration
- [ ] Home screen widget for quick-log
- [ ] Offline-first with sync
- [x] Cross-link with FinanceTracker — read-only, OTP-linked (FinanceTracker is multi-user); Dashboard's "My Finance" card + Finance screen show balance and bills due this month
- [x] Cross-link with KitchenPlanner — read-only, no linking needed (KitchenPlanner is single-tenant); Dashboard's "My Kitchen" card shows the next upcoming meal (time-of-day aware — afternoon shows dinner, not lunch) with recipe details when one's attached; Kitchen screen shows all of today's meal slots

---

## Data Model Summary (V1)

```
habits
  id, name, frequency, targetCount, createdAt

habit_logs
  id, habitId, date, completed

reminders
  id, title, time, repeatDays, active, createdAt
```
