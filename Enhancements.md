# Milo — Post-Testing Enhancements

## Started 2026-08-16

Tracking the 10 changes requested after testing the app, grouped into 5 delivery batches
(per brainstorming decomposition). Checkboxes reflect implementation status; DB/deployment
follow-ups are called out in **bold** since they need to be run manually.

---

## Group A — Navigation cleanup

- [x] **#1** Trim the More menu — removed Digest, QuickAdd, Finance, Kitchen, Memory, ConnectedApps
      from the menu list (14 → 8 items: Water, Goals, Journal, Wellness, Weight, Medications, Cycle, Settings)
- [x] **#5** Digest menu removed — moved to a ✨ button on the `MiloBar` (opens `DigestSheet`,
      same daily/weekly generate flow). Backend `GET /digest` untouched.
- [x] **#6** Quick Add menu removed — `MiloSheet` (the "Ask Milo…" bar) already provided the same
      text → classify → create flow, so `QuickAddScreen` was deleted rather than duplicated.
      Dashboard's "Reminder" quick action now opens `MiloSheet`.
- [x] **#9** Finance/Kitchen removed from More menu — routes stay registered; Dashboard's existing
      Finance/Kitchen cards and chips still navigate to them unchanged.
- [x] **#10** Memory + Connected Apps moved into Settings — new "Milo & data" section with rows
      that push to the existing screens.

**No schema changes, no backend changes, no deploy required for Group A.**

---

## Group B — Small feature fixes

- [x] **#2** Customizable water intake target/unit — `count`/`target` on `water_logs` are now
      treated as milliliters under the hood (no DB migration needed, they were already plain
      integers). New device-local preference (`lib/waterSettings.ts`, AsyncStorage) for unit
      (Glasses/ml/Liters), target, and glass serving size, editable from a new "Customize
      tracking" section on the Water screen. Also fixes a pre-existing bug where the target
      silently reset to a hardcoded 8 every new day — it now falls back to the saved preference.
      Dashboard chip, Milo's insight text, and the Personal screen's water row all updated to
      match.
- [x] **#3** Goal edit — added a pencil icon to each goal card that switches it into an inline
      edit form (title, notes, habit link, target date), saving via the existing
      `PATCH /goals/:id` (already used for the completed-toggle, just wasn't exposed in the UI).

---

## Group C — Journal / Check-in merge

- [x] **#4** Merged Journal and Wellness into a single "Journal" screen with two tabs: Write
      (diary composer — daily entries now show an inline mood/energy/sleep section, writing to
      both `journal_entries` and `mood_logs` in one save) and Insights (the existing
      water↔mood / sleep↔energy / habit↔mood correlation cards, unchanged). Removed "Wellness"
      from the More menu (8 → 7 items). `WellnessScreen`, `MoodCheckinForm`, and
      `MoodHistoryList` deleted — their logic now lives inside `JournalScreen`/`JournalComposer`.
      No schema/backend changes — both tables and routes untouched.

---

## Group D — Medication reminders overhaul

- [x] **#7** Medications overhaul, built from the `AddMedication`/`Duration`/`EveryXDays`/`Monthly`/
      `SetTime`/`TakeAsNeeded`/`Weekly` inspiration screenshots:
      - **Schema** (`medications` table): removed `quantityRemaining`/`refillThreshold`; added
        `reminderEnabled` (bool, default off), `startDate`, `interval` (daily/weekly/every_x_days/
        monthly/as_needed), `intervalDays`, `repeatDays`, `daysOfMonth`, `times` (jsonb array of
        `{time, dose}`), `message` (defaults to "Time to take {name}" if left blank).
        `medication_logs`'s quantity-decrement logic removed from `POST /medication_logs`.
      - **Form** (`MedicationForm.tsx`): Name, Dosage, Notifications toggle, Start date picker,
        an Interval picker modal (`MedicationIntervalModal.tsx`) with the 5 radio options and
        matching inline sub-controls (weekday chips reusing the existing `DayPicker` for Weekly,
        a day-count stepper for Every X Days, a 1–28 day-of-month grid for Monthly), a Time & dose
        list with +Add (`MedicationTimeModal.tsx`, time picker + dose stepper, editable/deletable),
        and the Message field. Selecting "Take as needed" hides Time & dose and forces the
        reminder off.
      - **Notification scheduling** (`lib/medicationNotifications.ts`, mirrors the existing
        `lib/notifications.ts` used by Reminders): Daily → native DAILY trigger, Weekly → native
        WEEKLY trigger per day, Monthly → native MONTHLY trigger per day-of-month, one per
        time-slot. **Every X Days has no native repeating trigger in expo-notifications**, so it
        pre-schedules the next 12 occurrences as one-off DATE triggers per time slot instead —
        exact time and spacing, but the queue needs a resave (any edit) to top up beyond that
        if the medication runs unedited for a very long stretch. Rescheduled automatically on
        create/update, cancelled on delete.
      - **Cleanup**: `MedicationCard.tsx` now shows a reminder-bell icon + interval/time summary
        instead of the quantity/refill footer. Removed the low-medication "refill soon" insight
        from `miloInsights.ts` (and the now-unused `medications` query from `DashboardScreen.tsx`)
        since the reminder system replaces that role.

---

## Group E — Cycle prediction + proactive notifications

- [x] **#8** Cycle: new device-local "Cycle settings" (`lib/cycleSettings.ts`, AsyncStorage —
      same pattern as water settings, no DB change) for cycle length (default 28d) and average
      period length (default 5d), editable from a new card on the Cycle screen. Prediction now
      keys off last logged start date + your set cycle length (`predictNextStartFromCycleLength`
      in `utils/cycle.ts`) rather than only the historical average — the logged average still
      shows alongside as a reference. `CycleSummary` also shows the expected date range using
      the period-length setting.
      Two local notifications (`lib/cycleNotifications.ts`, mirrors the Reminders/Medications
      scheduling pattern), rescheduled every time a period is logged or deleted, or a setting
      changes: a "prepare" nudge 2 days before the predicted date, and a "did you forget to log?"
      check-in 1 day after. The forgot-to-log one only actually fires if you haven't logged a
      new period by then — logging one cancels and reschedules both from the new prediction, so
      the stale check-in for the old prediction never fires. No backend/schema changes.

---

## Group F — Dashboard intelligence & work integration

- [ ] **#11** Dashboard redesign (finalized design, 2026-08-16): merge the greeting/weather line
      and "Milo's Daily Brief" into a single generated sentence block (weather + top insight +
      next event, rule-based `buildBrief()` in `miloInsights.ts`); replace the chip row + full-width
      Finance/Kitchen cards with three equal glance cards — 💰 Money (balance, due this month),
      🏠 Home (kitchen/shopping), 🧍 Personal (habits/water/goals/meds); replace the single
      "Up next" line with a full merged Today timeline (reminders + next meal + time-bound habits).
      New: `homeLocation` field on local `Profile`, backend `GET /weather` proxy route using a
      `WEATHER_API_KEY` env var (**user needs to obtain an OpenWeatherMap key and set it in
      `.env`/Render**, same `sync: false` pattern as `ANTHROPIC_API_KEY`), client-side AsyncStorage
      cache (~45 min TTL) so repeated Dashboard opens don't hammer the weather API.
- [ ] **#12** Office-dashboard integration (parked, not yet designed): surface work info
      (Jira tasks, PR review queue) from `~/omnichannel/office-dashboard` on Milo's Dashboard.
      Not a direct-DB-link like Finance/Kitchen — office-dashboard is a local-only Next.js app
      reading markdown files off the WSL filesystem, not a hosted service with its own DB, so
      Milo's cloud backend can't query it live. Likely shape: a one-way local→cloud push (a
      script or a new office-dashboard route sends a compact task/PR summary to a new Milo
      endpoint on a schedule), not a live query. Needs its own design pass before implementation.

---

## Group G — Open items carried over from Milo-Roadmap.md

Not part of the original 10-item testing feedback — copied over from `Milo-Roadmap.md`'s own
open checkboxes so all outstanding work lives in one place. Not started.

**From Phase 4 — Wake Word Integration** (blocked since 2026-08-15: Picovoice Console is gating
the `info@dreamdaycrew.com` account behind manual commercial-use review; no workaround, revisit
once approved)

- [ ] Train custom wake word "Milo" on Picovoice Console — download `.ppn` model
- [ ] Integrate `@picovoice/porcupine-react-native`
- [ ] Android foreground service with persistent low-priority notification
- [ ] Request `RECORD_AUDIO`, foreground service, and notification permissions (Android 13+)
- [ ] On wake word detected → deep link → Dashboard screen
- [ ] Test battery impact over a full day of normal use

**From Phase 6, Group C — Intelligence**

- [ ] Follow-up voice command after wake word ("log water", "how am I doing") — blocked on
      Phase 4 above, which is on hold

From Phase 6, Group D — Polish & Integration

- [ ] Home screen widget for quick-log
- [ ] Offline-first with sync

---
 
## Group H — Setting Menu

- [ ] Plan for PIN menu - Why? everytime we need to send OTP to user to validate, if in local memory if you're able to check email id, check the user table, if user is available, we will ask user to enter PIN, otherwise OTP existing flow, forgor PIN also OTP existing flow, to do so, we need a PIN from user. user can set PIN from settings screen 

---
## Pending / follow-up (update as groups complete)

- **No DB migration or server deploy needed for Groups A, B, C, or E** — all mobile-app-only
  (water and cycle settings both use the same device-local AsyncStorage pattern; goal edit and
  the journal/mood merge reuse existing backend routes/tables as-is).
- ~~Group D needs `npm run db:push` run against the live Neon DB~~ **Done (2026-08-16)** — pushed
  in two steps (drop `quantityRemaining`/`refillThreshold` first, then add the new reminder
  columns) to avoid drizzle-kit's interactive rename-detection prompt, which needs a real TTY
  this environment doesn't have. Any pre-existing `quantityRemaining`/`refillThreshold` values
  were dropped as expected. Still need the next server deploy to ship the `server/routes.ts`
  change (medication_logs no longer touches those columns).
- **Mobile app needs a new Expo build/OTA update pushed** once all groups are done, so testers
  actually get these changes (not needed per-group, but flagging so it isn't forgotten at the end).
