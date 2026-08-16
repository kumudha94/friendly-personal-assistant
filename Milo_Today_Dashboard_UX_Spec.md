# Milo Today Dashboard — UX Enhancement Specification

## 1. Goal

Improve the **Today dashboard** so Milo feels like a personal assistant rather than a collection of navigation cards.

The dashboard should answer one question immediately:

> **“What is important for me right now?”**

The existing **Personal, Finance, and Kitchen detail screens should remain intact**. This change focuses on making the Today screen more useful, dynamic, and action-oriented.

---

## 2. Current Problem

The current dashboard is clean, but mostly acts as a menu:

- My Personal
- My Finance
- My Kitchen
- Talk to Milo

The user has to open each section to understand what needs attention.

### Desired experience

The dashboard should:

1. Understand the user's current day.
2. Surface the most important information.
3. Recommend one useful action.
4. Allow simple actions directly from the dashboard.
5. Let the user open the existing detailed screens when they need more information.

---

## 3. New Today Dashboard Structure

Use this order:

```text
Greeting
↓
Milo Brief
↓
Today Summary
↓
Milo Insight
↓
Finance Summary
↓
Kitchen Summary
↓
Quick Actions
↓
Ask Milo
↓
Bottom Navigation
```

Keep the screen visually calm. Do not turn it into a dense dashboard.

---

## 4. Milo Brief

Replace the current:

> YOUR DAY → NOW → Nothing urgent

with a more useful contextual message.

### Example

```text
Good evening

Saturday, Aug 15

        Milo

You have 2 things worth your attention.
```

If there is nothing important:

```text
You're all caught up ✨

Nothing needs your attention right now.
```

### UX rules

- Keep it short.
- Use natural language.
- Avoid unnecessary notifications.
- The message should change based on the user's actual data.
- Never create urgency when nothing is urgent.

---

## 5. Today Summary

Create one compact visual summary of the most important areas.

Example:

```text
TODAY

💧 Water
6 / 11

✓ Habits
1 / 5

💰 Finance
₹68,090 due

🍽 Kitchen
Dinner not planned
```

### Design

Use compact cards/chips rather than four large navigation cards.

The user should understand their day within **2–3 seconds**.

Each item may be tappable and should navigate to the appropriate existing detail screen.

---

## 6. Milo Insight

This should be the most important interactive element on the dashboard.

Show **one contextual recommendation at a time**.

Example:

```text
✨ MILO SUGGESTS

Dinner isn't planned yet.

Want something quick tonight?

[ Plan Dinner ]
```

Another example:

```text
✨ MILO SUGGESTS

You're at 6 of 11 glasses today.

Five more to reach your goal.

[ + Log Water ]
```

### Rules for point6

- Show only the most relevant suggestion.
- Do not show multiple competing recommendations.
- The recommendation must come from real application data.
- Prefer an actionable button.
- If there is nothing useful to suggest, hide the section.

The goal is:

> **Milo tells the user what matters instead of making the user search for it.**

---

## 7. Finance Summary

Do not reproduce the full FinanceTracker screen.

Show only the information that matters on the Today dashboard.

Example:

```text
💰 FINANCE

₹1,92,018
Current balance

₹68,090 due this month

Next
IndusInd Bank PL       ₹63,897

[ View Finance ]
```

### Rules for point7

- Keep it compact.
- Show balance.
- Show total amount due.
- Show the next/most important payment.
- Clicking the card opens the existing Finance screen.
- Do not display a full transaction list on Today.

---

## 8. Kitchen Summary

Use KitchenPlanner data to answer:

> **“What are we eating next?”**

Example:

```text
🍽 TONIGHT

Dinner

Nothing planned yet.

[ Plan Dinner ]
```

When a meal exists:

```text
🍽 TONIGHT

Creamy Garlic Prawns
Garlic Butter Rice

⏱ 35 min

[ View Meal ]
```

### Rules for point8

- Show the next relevant meal.
- Prefer dinner when it is evening.
- Keep detailed meal planning inside KitchenPlanner.
- Dashboard should provide context and a quick entry point.

---

## 9. Quick Actions

Add a small contextual action row.

Example:

```text
QUICK ACTIONS

+ Water     ✓ Habit     🍽 Dinner     ⏰ Reminder
```

Keep it to **3–4 actions maximum**.

Actions should perform simple tasks directly when possible.

Examples:

- `+ Water` → log one glass immediately.
- `✓ Habit` → open/complete today's habit.
- `🍽 Dinner` → open dinner planning.
- `⏰ Reminder` → create a reminder.

Avoid turning this into a large feature menu.

---

## 10. Visual / UI UX Direction

The existing dark theme and purple accent should remain.

Improve the visual hierarchy rather than redesigning everything.

### Use

- Large readable primary numbers.
- Clear section labels.
- Soft elevated cards.
- Subtle borders.
- Purple only for important actions/highlights.
- Small contextual icons.
- Generous spacing.
- Consistent corner radius.
- Smooth transitions.
- Lightweight progress indicators.
- Strong typography hierarchy.

### Avoid

- Too many cards.
- Too many colors.
- Excessive gradients.
- Large empty areas.
- Long paragraphs.
- Multiple competing CTAs.
- Making every piece of information look equally important.

The UI should feel **premium, calm, modern, and personal**.

---

## 11. Information Priority

The dashboard must follow this hierarchy:

### Priority 1 — What needs attention?

Example:

> Dinner isn't planned.

### Priority 2 — What changed / what matters today?

Example:

> ₹68,090 due this month.

### Priority 3 — Progress

Example:

> Water 6/11  
> Habits 1/5

### Priority 4 — Navigation

Example:

> View Finance  
> View Kitchen

The dashboard should **not** give equal visual weight to everything.

---

## 12. Interaction Principles

### Dashboard

Understand → Decide → Act

### Detail screens

Explore → Manage → Complete

Do not duplicate the detailed functionality of FinanceTracker or KitchenPlanner inside Milo.

Milo is the **orchestrator**.

FinanceTracker and KitchenPlanner remain the **detailed experiences**.

---

## 13. Keep Existing Screens

Do NOT redesign these as part of this change:

- Personal screen
- Finance screen
- Kitchen screen
- Habits screen
- Reminders screen
- Bottom navigation
- Existing FinanceTracker integration
- Existing KitchenPlanner integration

The existing click behavior should continue to work.

---

## 14. Responsive / Mobile UX

The primary target is a mobile phone.

Ensure:

- Important information is visible without excessive scrolling.
- Primary actions are easy to reach.
- Touch targets are comfortably sized.
- Text does not become cramped.
- Cards do not become unnecessarily tall.
- The dashboard works on different phone sizes.

The user should be able to understand the important parts of the day without scrolling through a long feed.

---

## 15. Example Final Dashboard

```text
Good evening

Saturday, Aug 15

        Milo

You have 2 things worth your attention.


TODAY

💧 6/11 Water
✓ 1/5 Habits
💰 ₹68,090 Due
🍽 Dinner not planned


✨ MILO SUGGESTS

Dinner isn't planned yet.

Want something quick tonight?

[ Plan Dinner ]


💰 FINANCE

₹1,92,018
Current balance

₹68,090 due this month

IndusInd Bank PL       ₹63,897

[ View Finance ]


🍽 TONIGHT

Dinner
Nothing planned yet

[ Plan Dinner ]


QUICK ACTIONS

+ Water    ✓ Habit    🍽 Dinner    ⏰ Reminder


        Ask Milo...
```

---

## 16. Success Criteria

The redesign is successful when a user can open Milo and immediately understand:

- **What needs my attention?**
- **How am I doing today?**
- **What is happening with my money?**
- **What am I eating next?**
- **What should I do next?**

The dashboard should feel like:

> **“Milo already looked at my day and knows what I need to see.”**

Not:

> **“Here are three sections. Go check them yourself.”**

---

## Implementation Principle

This is a **Today dashboard enhancement**, not a complete application rewrite.

Reuse the existing data, integrations, navigation, and detail screens wherever possible.

Focus the development effort on:

**better information hierarchy + contextual insights + quick actions + polished mobile UI.**
