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

- [ ] Train custom wake word "Milo" on Picovoice Console — download `.ppn` model
- [ ] Integrate `@picovoice/porcupine-react-native`
- [ ] Android foreground service with persistent low-priority notification
- [ ] Request `RECORD_AUDIO`, foreground service, and notification permissions (Android 13+)
- [ ] On wake word detected → deep link → Dashboard screen
- [ ] Test battery impact over a full day of normal use

**Done when:** saying "Hey Milo" reliably opens the app to Dashboard, with acceptable battery drain.

---

## Phase 5 — Play Store Internal Testing (Week 3)

- [ ] Build signed AAB
- [ ] Write privacy policy (on-device audio processing, no storage/transmission)
- [ ] Set up Play Console internal/closed testing track
- [ ] Upload, add yourself as tester, verify install flow

---

## Phase 6 — V2 Backlog (post-launch, prioritize later)

Group A — Tracking
- [ ] Water intake (quick-tap logging, daily target, progress bar)
- [ ] Mood/health check-in (scale + energy + sleep + notes)
- [ ] Sleep log
- [ ] Weight/body metrics
- [ ] Medication/symptom tracker + refill alerts
- [ ] Menstrual cycle tracking

Group B — Planning
- [ ] Goals module (linked to habits)
- [ ] Journaling (daily notes)
- [ ] Weekly/monthly review prompts

Group C — Intelligence
- [ ] Insights dashboard (correlations: water↔mood, sleep↔energy, streak↔mood)
- [ ] Claude-powered daily/weekly digest
- [ ] Natural language quick-add ("remind me to call mom at 6")
- [ ] Follow-up voice command after wake word ("log water", "how am I doing")

Group D — Polish & Integration
- [ ] Home screen widget for quick-log
- [ ] Offline-first with sync
- [ ] Cross-link with FinanceTracker / KitchenPlanner

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
