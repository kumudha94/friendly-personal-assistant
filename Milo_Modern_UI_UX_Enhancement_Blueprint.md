# Milo — Modern UI/UX Enhancement Blueprint

## Vision

Transform **Friendly Personal Assistant (Milo)** from a simple utility-style Android app into a modern, AI-native personal assistant experience.

### Target personality

> **Dark. Calm. Premium. Friendly. Intelligent. Slightly futuristic.**

The goal is not to make Milo look like another generic AI chatbot. Milo should feel like a **personal command center** where the assistant understands context, surfaces useful information, and lets the user interact naturally through text, voice, and contextual UI.

---

## Progress Tracker

Started as a frontend-only redesign layered onto the existing app; as of 2026-08-15 it also
touches the backend for the first time (new `memories` table + structured `/digest` and
`/plan_evening` endpoints — see Phase 3/4 below). See `Milo-Roadmap.md` for the core build.

Everything below is done **except voice** — "Voice-first experience" (Phase 2) stays blocked on
the separate Picovoice commercial-use review tracked in `Milo-Roadmap.md` Phase 4, and
"Streaming AI responses" (Phase 2) was deliberately not built — see that section for why.

---

### Phase 1 — Visual Transformation

- [x] Establish Milo design tokens
- [x] Create dark-first theme
- [x] Redesign typography
- [x] Redesign spacing and radii
- [x] Create Milo Core
- [x] Add Milo Core animations
- [x] Redesign Dashboard into Today
- [x] Create Milo Bar
- [x] Create assistant bottom sheet
- [x] Redesign cards
- [x] Add polished transitions
- [x] Improve empty/loading/error states

**Done when:** every screen matches the dark design tokens end-to-end, with Milo Core/Bar/Sheet
live and no leftover light-theme text.

> **Done (2026-08-15).** Every screen/component runs on `src/theme/tokens.ts`, nav is
> dark-themed, `MiloCore`/`MiloBar`/`MiloSheet` are live, the Dashboard tab is "Today" with a
> Now/Up Next/Later timeline, `EmptyState` replaced ad hoc "No X yet" text throughout. Polished
> transitions landed last: `MoreStack`'s native-stack screens now use `animation:
> "slide_from_right"` (built into `@react-navigation/native-stack`, no new dependency); tab
> switches deliberately don't crossfade, matching platform convention.
>
> A real bug surfaced during the color migration and was fixed: several existing text/input
> styles never had an explicit `color` (relying on light-theme default black-on-white), which
> would have rendered as invisible or near-invisible text on the new dark surfaces. Audited and
> fixed across all affected files, not just the ones touched by the token pass.

---

### Phase 2 — AI-Native UI

- [x] Structured AI response cards
- [x] Contextual quick actions
- [ ] Streaming AI responses
- [ ] Voice-first experience
- [x] Milo Insights
- [x] Dynamic timeline
- [x] Contextual action buttons

**Done when:** Milo surfaces proactive, dismissible insights with real actions, and AI
responses render as structured UI instead of only text.

> **Done except streaming and voice (2026-08-15).** Milo Insights are real dismissible cards
> (`MiloInsight`, `src/lib/insights.ts`), now driving four signals: habit streak, water
> remaining, an upcoming goal deadline (within 7 days), and a low-supply medication — the last
> two added this round by wiring `useGoals`/`useMedications` into the Today screen alongside the
> existing queries. `server/digest.ts` was rewritten to use forced Claude tool-use (same pattern
> as `quickAdd.ts`) returning `{ headline, highlight, sections }` instead of a text blob;
> `DigestScreen.tsx` renders that as a hero line, a highlight callout, and per-category cards —
> real structured AI output, not a client-side text parse.
>
> **Streaming AI responses — deliberately not built.** True token-by-token streaming needs
> backend SSE plus a React Native client that can reliably consume a streaming fetch body; RN/
> Hermes streaming support is inconsistent across environments, and every AI response in Milo
> (digest, quick-add, evening plan) is short — `MiloCore`'s "thinking" animation already covers
> the actual latency gap. Disproportionate engineering risk for a benefit this app's response
> lengths wouldn't make noticeable. Revisit only if a genuinely long-form AI response is added
> later. **Voice-first** stays blocked on the separate Picovoice review.

---

### Phase 3 — Agent Experience

- [x] Agent activity timeline
- [x] Visible task execution
- [x] Action receipts
- [x] Approval flows
- [x] Undo actions
- [x] Multi-step plans
- [x] Progress states

**Done when:** every Milo-initiated action shows a receipt with Undo, and multi-step agent runs
show visible step-by-step progress.

> **Done (2026-08-15), scoped deliberately.** Action receipts + Undo shipped earlier
> (`ActionReceipt`, used by `QuickAddScreen.tsx` and `MiloSheet.tsx`). The rest of this phase —
> activity timeline, visible task execution, approval flows, multi-step plans, progress states —
> shipped together as one bounded feature, **"Plan my evening"**, reached via a new 4th Milo Bar
> shortcut (`PlanEveningSheet.tsx`): `server/planEvening.ts` gathers today's remaining reminders,
> incomplete habits, and open goals, then makes **one** forced-tool-use Claude call (same pattern
> as digest/quick-add) proposing an ordered list of evening items. `AgentActivity.tsx` presents
> that real, already-happened data-gathering sequence as a step timeline (✓ reminders / ✓ habits
> / ✓ goals / ◉ preparing suggestions).
>
> **Scope note:** this is *not* a general multi-turn agent loop (Claude autonomously calling
> tools across several turns) — that's a materially bigger, riskier build with per-turn error
> handling and cost/latency to manage. It's one request whose real, sequential inputs are shown
> honestly as steps. Accept loops the existing `useCreateReminder` mutation once per plan item
> (reuses tested code, including OS notification scheduling) rather than a second backend
> "accept" endpoint; Change just closes the sheet with no writes. If a true autonomous multi-step
> agent is wanted later, that's a distinct, larger scoping conversation.

---

### Phase 4 — Personal Milo

- [x] Memory surface
- [x] Memory editing
- [x] Personal preferences
- [x] Goal awareness
- [x] Context-aware suggestions
- [x] Proactive insights
- [x] Quiet hours / notification controls

**Done when:** Milo remembers stated facts/preferences in an editable surface, and notification
behavior respects user-set quiet hours everywhere it technically can.

> **Done (2026-08-15).** Quiet hours shipped earlier (Settings screen, `src/lib/settings.ts`),
> disclosed limitation unchanged: it can only mute Milo's in-app foreground alert/sound, not the
> OS notification while backgrounded/killed, since reminders are locally scheduled with no
> server push.
>
> **Memory surface + editing:** new `memories` table (`shared/schema.ts`, applied via
> `npm run db:push`) + `GET/POST/PATCH/DELETE /memories`, and a new "Memory" screen under More
> ("Milo remembers" list — add via text input, inline edit/delete per row, matching the
> blueprint's own §11 mockup). Manual, not auto-extracted from journal entries or conversations —
> that's a fuzzier feature (what counts as a "fact"? how often re-scan? false positives?) left
> for a separate scoping conversation if wanted.
>
> **Personal preferences:** `src/lib/settings.ts` gained `getProfile`/`setProfile` (AsyncStorage,
> `{ name }`), a "Your name" field on the Settings screen, and the Today greeting now reads
> "Good afternoon, {name}" when set — real user-provided data, not a fabricated name.
>
> **Goal awareness / context-aware / proactive insights:** folded into the existing Milo Insights
> engine (no new component) — see Phase 2 above for the two new signals added.

---

Verified via `npx tsc --noEmit` and `npx expo export --platform android` (clean) for everything
above, plus backend `npm run check` (clean) and local `npm run dev` + `curl` smoke tests against
`/digest`, `/memories` (all 4 methods), and `/plan_evening` — all confirmed working against the
live Neon DB and Claude API. No on-device/Expo Go visual check was possible in this sandbox for
any phase. **Not yet pushed** — backend changes are verified locally only; ask before pushing
to Render/git, per this project's standing rule to only commit when asked.

---

# 1. Core Design Direction

Use the following products only as inspiration:

- ChatGPT — conversational simplicity
- Gemini — contextual and dynamic UI
- Nothing OS — typography and restraint
- Apple — hierarchy, motion, polish
- Perplexity — information density
- Modern AI agent interfaces — visible actions, plans, approvals, and execution

Do **not** clone any of these products.

Milo should have its own visual identity.

---

# 2. Milo Core — The Visual Identity

Introduce a distinctive animated **Milo Core** rather than relying on a generic chatbot icon.

The Milo Core is a small glowing orb/fluid gradient element representing the assistant.

## States

### Idle

Simple, subtle glow.

### Listening

Expanding sound-wave rings around the core.

### Thinking

Slow gradient rotation or gentle internal movement.

### Speaking

Subtle pulse synchronized with speech.

### Executing

Small orbiting particles or progress animation.

### Success

Brief expansion followed by a calm confirmation animation.

### Design principle

The animation should communicate state without becoming distracting.

Avoid flashy, excessive AI effects.

---

# 3. Home Screen — Replace the Traditional Dashboard

The current dashboard concept should evolve into a **Today / AI Command Center**.

Instead of making the user navigate through multiple cards and menus, the home screen should immediately answer:

> **What matters to me right now?**

Example structure:

```text
Good afternoon, Kums
Saturday · Aug 15

              ◉
             Milo

       What can I help with?

┌─────────────────────────────┐
│ 🎙  Talk to Milo             │
└─────────────────────────────┘

YOUR DAY

┌──────────────┐ ┌──────────────┐
│ 3 tasks      │ │ 2 reminders  │
└──────────────┘ └──────────────┘

✦ Milo noticed...

Your electricity bill is due
tomorrow.
```

The content should be dynamic rather than permanently hard-coded.

---

# 4. Today View

Create a calm, information-rich timeline.

Example:

```text
TODAY

Good afternoon, Kums

NOW
14:45
Nothing urgent

UP NEXT
16:00  Pick up Giffy

LATER
19:30  Prayer

────────────────────

MILO'S NOTES

💡 Electricity bill
   Due tomorrow

💰 Finance
   ₹4,800 scheduled this week

🔥 Habit
   6 day streak
```

The user should be able to understand their day in seconds.

---

# 5. AI-Native UI — Do Not Make Chat the Entire Product

Milo should not return everything as plain text.

When the user asks:

> What do I have tomorrow?

Milo should generate a structured UI:

```text
Tomorrow

☀️ Morning

08:30
Team standup

10:00
Appointment

🌙 Evening

19:30
Prayer

[ Add reminder ]
```

When the response has useful structured information, render:

- Timeline
- Cards
- Lists
- Action buttons
- Progress indicators
- Calendar-style layouts
- Finance summaries
- Habit summaries
- Confirmation controls

The assistant response should determine the most useful UI.

---

# 6. Milo Bar

Create a persistent but minimal bottom interaction bar.

```text
┌─────────────────────────────────┐
│  +       Ask Milo...       🎙   │
└─────────────────────────────────┘
```

Tapping it expands into an AI interaction sheet.

Example:

```text
          ◉
        Milo

    What do you need?

┌───────────┐ ┌─────────────┐
│ Remind me │ │ Plan my day │
└───────────┘ └─────────────┘

┌───────────┐ ┌─────────────┐
│ Finance   │ │ Something    │
│           │ │ else         │
└───────────┘ └─────────────┘

       🎙 Hold to talk
```

The interaction should feel like opening Milo rather than opening a generic chat screen.

---

# 7. Voice-First Experience

The existing **"Hey Milo"** capability should become a core part of the product identity.

Do not hide voice behind a tiny microphone button.

## Voice flow

### Listening

```text
        ◉

     Listening...

"What would you like?"
```

### Processing

```text
        ◌

     Thinking...
```

### Speaking

```text
        ◉

   Milo is speaking

"You have two reminders
remaining today."
```

Use subtle waveform and pulse animations.

---

# 8. Milo Insights

Introduce proactive but non-intrusive suggestions.

Examples:

### 💡 Milo noticed

> You usually pay your electricity bill around the 15th.

Actions:

- Create reminder
- Not now
- Don't suggest this again

---

### 💰 Spending pattern

> You have 3 scheduled payments this week totaling ₹8,450.

Action:

`View payments`

---

### 🔥 Habit

> You've completed your morning routine 6 days in a row.

Action:

`Keep the streak`

## Important

Insights should always be:

- Understandable
- Dismissible
- Reversible
- User-controlled

Do not silently change user data or behavior.

---

# 9. Agent Activity / Execution UI

When Milo performs multiple steps, show what is happening.

Avoid:

```text
Thinking...
```

Instead:

```text
Milo

Planning your evening

✓ Checked your reminders
✓ Checked your calendar
◉ Looking at your habits
○ Preparing suggestions
```

Then show the result:

```text
Evening plan ready

17:30  Finish work
18:00  Dinner
19:00  Family time
20:00  Personal time

[ Accept ]
[ Change ]
```

This creates trust and makes Milo feel like an agent rather than a chatbot.

---

# 10. Action Receipts

Whenever Milo performs an important action, provide a compact confirmation.

Example:

```text
✓ Reminder created

"Call mom"

Tomorrow · 19:00

[ Undo ]
```

For more complex actions:

```text
✓ Evening plan created

3 reminders added
1 habit scheduled

[ View ]
[ Undo ]
```

The user should always understand what Milo actually changed.

---

# 11. Memory Surface

Add a dedicated **Milo remembers** experience.

Avoid hiding memory completely inside Settings.

Example:

```text
MILO REMEMBERS

💻 Work
Senior Software Engineer

🎯 Goals
...

⚙️ Preferences
...

🧠 Things you've told me
...

────────────────

Manage memory
```

Individual memories should be editable and removable.

Example:

```text
Milo remembers:

"You prefer simple explanations."

[ Edit ]
[ Forget ]
```

Memory should communicate transparency and control.

---

# 12. Modern Visual Language

Use a dark-first design.

Suggested palette:

```text
Background        #08090D
Surface           #111318
Elevated Surface  #181B22
Primary Text      #F5F7FA
Secondary Text    #9AA0AA
Muted Text        #656B76
```

The exact primary/gradient colors can become Milo's signature later.

---

# 13. Glass / Translucent Surfaces

Use glass effects selectively.

Recommended:

- Dark translucent surfaces
- Subtle blur
- Thin borders
- Soft gradients
- Large typography
- Generous spacing

Avoid making every component glassmorphic.

The target is:

> **One elegant glass layer + excellent typography**

rather than dozens of glowing translucent cards.

---

# 14. Typography

Establish a clear hierarchy.

Suggested starting scale:

```text
Hero              32–36 px
Screen title      26–30 px
Section title     20–22 px
Body              15–16 px
Secondary         13–14 px
Caption           12–13 px
```

Typography should do more of the visual work than decoration.

Use:

- Large headings
- Short labels
- Strong spacing
- Minimal unnecessary text
- Clear hierarchy

---

# 15. Spacing and Radius System

Use a consistent 4/8px spacing system.

Suggested radius:

```text
Small controls        12 px
Standard cards        18 px
Large surfaces        24 px
Assistant sheets      32 px
```

Do not use arbitrary corner radii throughout the application.

---

# 16. Navigation Redesign

Reduce the importance of traditional navigation.

Instead of:

```text
Dashboard | Habits | Reminders | Settings
```

move toward:

```text
                     Milo
                      │
             ┌────────┴────────┐
             │                 │
           Today               Me
             │
       ┌─────┼─────┐
       ↓     ↓     ↓
     Tasks Habits Reminders
```

The user should interact with Milo first.

Traditional screens become secondary destinations.

---

# 17. Command Palette

Add a fast command/search interface.

Example:

```text
┌─────────────────────────────────┐
│ 🔍 What do you want to do?      │
└─────────────────────────────────┘

Recent

→ Create reminder
→ Show today's tasks
→ My habits
→ Finance
→ Milo memory
→ Settings
```

Natural language should also work:

```text
remind me to call mom tomorrow at 7
```

The command palette should be fast and keyboard-friendly where appropriate.

---

# 18. Personality

Milo should feel friendly without becoming childish.

Avoid repeatedly saying:

> Hello! 👋 I'm Milo, your AI assistant!

Prefer short contextual responses:

> Afternoon, Kums.

> You're clear for the next two hours.

> One small thing before you forget…

> Nice. Six days in a row.

The personality should emerge through small moments.

---

# 19. Motion Design

Animations should have purpose.

Suggested principles:

- Fast interactions: ~150–250ms
- Standard transitions: ~250–400ms
- Assistant state transitions: ~300–500ms
- Use spring-like movement where appropriate
- Avoid constant movement
- Respect reduced-motion accessibility settings

Use animation to communicate:

- State
- Focus
- Progress
- Completion
- Transition

Never animate simply because animation is available.

---

# 20. Component Ideas

Build reusable components instead of styling individual screens independently.

Recommended component library:

```text
MiloCore
MiloBar
MiloSheet
MiloMessage
MiloInsight
MiloAction
MiloCard
MiloTimeline
MiloProgress
MiloConfirmation
MiloActivity
MiloMemory
MiloCommandPalette
MiloWaveform
MiloEmptyState
MiloToast
MiloBottomSheet
```

All components should consume the same design tokens.

---

# 21. Design Tokens

Create a central design system.

Example categories:

```text
colors
typography
spacing
radius
elevation
blur
animation
iconography
```

Do not scatter raw values throughout screens.

For example:

```text
spacing.sm
spacing.md
spacing.lg

radius.card
radius.sheet

surface.primary
surface.elevated
```

This will make future redesigns much easier.

---

# 22. Empty States

Do not use boring empty states like:

> No reminders found.

Instead:

```text
          ◉

Nothing planned yet.

A quiet day.
Enjoy it. :)

[ Add something ]
```

Empty states are part of Milo's personality.

---

# 23. Loading States

Avoid generic spinners wherever possible.

Use contextual skeletons or Milo activity states.

Instead of:

```text
Loading...
```

prefer:

```text
Milo is preparing your day...
```

or a skeleton representation of the content being loaded.

---

# 24. Error States

Errors should feel calm and actionable.

Avoid:

> Something went wrong.

Prefer:

```text
Milo couldn't complete that.

The reminder service didn't respond.

[ Try again ]
[ Cancel ]
```

For technical errors, keep details available behind an optional "Details" action.

---

# 25. Accessibility

The visual redesign must not sacrifice accessibility.

Include:

- Dynamic font sizing
- Sufficient contrast
- Large touch targets
- Screen reader labels
- Reduced-motion support
- Voice alternatives
- Clear focus states
- No color-only status indicators

---

# 26. Responsive Layout

Design for different Android screen sizes.

The UI should gracefully adapt to:

- Small phones
- Large phones
- Foldables where practical
- Landscape mode where relevant

Do not simply scale everything proportionally.

Use responsive spacing and layout rules.

---

# 27. Suggested Screen Structure

## Primary

### Today

The main AI command center.

### Milo

Expanded conversational / voice interaction.

### Me

Personal context, memory, preferences, and settings.

## Secondary surfaces

- Tasks
- Reminders
- Habits
- Finance
- Memory
- Activity
- Settings

These should be accessible from Milo or contextual actions rather than dominating the primary navigation.

---

# 28. Suggested First-Launch Experience

Do not start with a traditional login/dashboard experience alone.

After onboarding:

```text
          ◉

        I'm Milo.

I can help you remember things,
plan your day, build habits,
and keep track of what matters.

          [ Continue ]
```

Then:

```text
What should Milo help with?

☑ Reminders
☑ Habits
☑ Daily planning
☑ Personal organization
☐ Finance
```

Keep onboarding short.

---

# 29. Future "Proactive Milo" Direction

Long-term, Milo should evolve toward:

```text
                 MILO
                   │
        ┌──────────┼──────────┐
        ↓          ↓          ↓
     Context     Memory      Goals
        │          │          │
        └──────────┼──────────┘
                   ↓
            Personalization
                   ↓
             Proactive Milo
```

The goal is for Milo to eventually understand:

- What is happening
- What matters
- What is coming next
- What the user usually does
- What may require attention
- When to stay quiet

The assistant should become increasingly useful without becoming intrusive.

---

# 30. Implementation Roadmap

> See the **Progress Tracker** near the top of this file (right after the Vision section) for
> the live checklist and status notes — kept in one place to avoid two copies drifting out of
> sync.

---

# 31. Important Engineering Constraint

The redesign should **not require rewriting the entire application**.

First understand the existing architecture and preserve:

- Existing APIs
- Existing backend
- Existing business logic
- Existing authentication
- Existing data model
- Existing AI integration
- Existing wake-word implementation

The first pass should primarily be a **UI/UX transformation**.

Do not mix a visual redesign with an unnecessary backend rewrite.

---

# 32. Recommended Claude Code Instruction

When implementing the redesign, use this overall direction:

> Redesign the existing Friendly Personal Assistant application into a premium, modern, AI-native personal assistant called Milo.
>
> Preserve the existing business logic, APIs, backend contracts, authentication, data models, and working functionality unless a change is explicitly required.
>
> Do not rebuild the project from scratch.
>
> First inspect the existing UI architecture and identify reusable components and existing navigation. Then introduce a cohesive Milo design system with a dark-first visual language, strong typography, generous spacing, subtle glass surfaces, fluid motion, and the animated Milo Core as the central visual identity.
>
> Transform the current Dashboard into a dynamic Today / AI Command Center. Make Milo the primary interaction rather than traditional navigation. Introduce the Milo Bar, assistant bottom sheet, contextual actions, structured AI response components, and polished loading/error/empty states.
>
> The UI should feel calm, premium, intelligent, friendly, and slightly futuristic — not cyberpunk, childish, or overloaded with gradients.
>
> Prioritize visual hierarchy, whitespace, typography, motion, accessibility, and consistency over adding unnecessary features.
>
> Build reusable components and centralized design tokens rather than styling individual screens independently.
>
> Implement the redesign incrementally and verify that existing functionality continues to work after each major change.

---

# 33. Final Product Goal

The transformation should move Milo from:

```text
A personal assistant app
```

to:

```text
A personal AI environment
```

The user should open Milo and feel:

> **"This is my space. Milo already understands what matters."**

That feeling is more important than adding dozens of features.

## Design North Star

**Less dashboard.  
Less menu.  
Less noise.  
More context.  
More personality.  
More intelligence.  
More Milo.**
