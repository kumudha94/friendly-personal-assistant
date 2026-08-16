import { pgTable, serial, text, integer, real, boolean, date, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  frequency: text("frequency").notNull(), // "daily" | "weekly" | "custom"
  targetCount: integer("target_count").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const habitLogs = pgTable("habit_logs", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull().references(() => habits.id),
  date: date("date").notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  time: text("time").notNull(), // "HH:mm"
  repeatDays: text("repeat_days").array().notNull().default([]), // ["mon","tue",...]
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const waterLogs = pgTable("water_logs", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  count: integer("count").notNull().default(0),
  target: integer("target").notNull().default(8),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  habitId: integer("habit_id").references(() => habits.id),
  targetDate: date("target_date"),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "daily" | "weekly" | "monthly"
  date: date("date").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const moodLogs = pgTable("mood_logs", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  moodScale: integer("mood_scale").notNull(), // 1-5
  energyLevel: integer("energy_level").notNull(), // 1-5
  sleepHours: real("sleep_hours").notNull(),
  notes: text("notes"),
});

export const weightLogs = pgTable("weight_logs", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  weight: real("weight").notNull(),
  unit: text("unit").notNull().default("kg"), // "kg" | "lbs"
  notes: text("notes"),
});

export type MedicationTime = { time: string; dose: number }; // time: "HH:mm"
export type MedicationInterval = "daily" | "weekly" | "every_x_days" | "monthly" | "as_needed";

export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  active: boolean("active").notNull().default(true),
  reminderEnabled: boolean("reminder_enabled").notNull().default(false),
  startDate: date("start_date"),
  interval: text("interval").$type<MedicationInterval>().notNull().default("daily"),
  intervalDays: integer("interval_days"), // used when interval = "every_x_days"
  repeatDays: text("repeat_days").array().notNull().default([]), // used when interval = "weekly"
  daysOfMonth: integer("days_of_month").array().notNull().default([]), // used when interval = "monthly"
  times: jsonb("times").$type<MedicationTime[]>().notNull().default([]),
  message: text("message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const medicationLogs = pgTable("medication_logs", {
  id: serial("id").primaryKey(),
  medicationId: integer("medication_id").notNull().references(() => medications.id),
  date: date("date").notNull(),
  taken: boolean("taken").notNull().default(false),
});

export const symptomLogs = pgTable("symptom_logs", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  symptom: text("symptom").notNull(),
  severity: integer("severity").notNull(), // 1-5
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const cycleLogs = pgTable("cycle_logs", {
  id: serial("id").primaryKey(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  notes: text("notes"),
});

export const memories = pgTable("memories", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Milo's own account (independent login — not shared with FinanceTracker/KitchenPlanner).
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Used both for Milo's own login OTP and (transiently, not persisted long-term) nothing
// else — the "Connected Apps" OTP round-trip is verified by the *other* app's own backend,
// not stored here.
export const emailOtps = pgTable("email_otps", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

// One row per connected app (FinanceTracker, KitchenPlanner, future ones) — generalizes the
// old FinanceTracker-only financeLink table. externalUserId is only meaningful for apps that
// are actually multi-tenant under the hood (FinanceTracker); null for single-tenant ones
// (KitchenPlanner) where it's not needed to scope any query.
export const appConnections = pgTable("app_connections", {
  id: serial("id").primaryKey(),
  appId: text("app_id").notNull(),
  email: text("email").notNull(),
  externalUserId: integer("external_user_id"),
  verifiedAt: timestamp("verified_at").notNull().defaultNow(),
});

export const insertHabitSchema = createInsertSchema(habits).omit({ id: true, createdAt: true });
export const insertHabitLogSchema = createInsertSchema(habitLogs).omit({ id: true });
export const insertReminderSchema = createInsertSchema(reminders).omit({ id: true, createdAt: true });
export const insertWaterLogSchema = createInsertSchema(waterLogs).omit({ id: true });
export const insertGoalSchema = createInsertSchema(goals).omit({ id: true, createdAt: true });
export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
});
export const insertMoodLogSchema = createInsertSchema(moodLogs).omit({ id: true });
export const insertWeightLogSchema = createInsertSchema(weightLogs).omit({ id: true });
export const insertMedicationSchema = createInsertSchema(medications, {
  interval: z.enum(["daily", "weekly", "every_x_days", "monthly", "as_needed"]),
  times: z.array(z.object({ time: z.string(), dose: z.number() })),
}).omit({ id: true, createdAt: true });
export const insertMedicationLogSchema = createInsertSchema(medicationLogs).omit({ id: true });
export const insertSymptomLogSchema = createInsertSchema(symptomLogs).omit({ id: true, createdAt: true });
export const insertCycleLogSchema = createInsertSchema(cycleLogs).omit({ id: true });
export const insertMemorySchema = createInsertSchema(memories).omit({ id: true, createdAt: true });
export const insertEmailOtpSchema = createInsertSchema(emailOtps).omit({ id: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertAppConnectionSchema = createInsertSchema(appConnections).omit({ id: true, verifiedAt: true });

export type Habit = typeof habits.$inferSelect;
export type InsertHabit = typeof habits.$inferInsert;
export type HabitLog = typeof habitLogs.$inferSelect;
export type InsertHabitLog = typeof habitLogs.$inferInsert;
export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = typeof reminders.$inferInsert;
export type WaterLog = typeof waterLogs.$inferSelect;
export type InsertWaterLog = typeof waterLogs.$inferInsert;
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = typeof goals.$inferInsert;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = typeof journalEntries.$inferInsert;
export type MoodLog = typeof moodLogs.$inferSelect;
export type InsertMoodLog = typeof moodLogs.$inferInsert;
export type WeightLog = typeof weightLogs.$inferSelect;
export type InsertWeightLog = typeof weightLogs.$inferInsert;
export type Medication = typeof medications.$inferSelect;
export type InsertMedication = typeof medications.$inferInsert;
export type MedicationLog = typeof medicationLogs.$inferSelect;
export type InsertMedicationLog = typeof medicationLogs.$inferInsert;
export type SymptomLog = typeof symptomLogs.$inferSelect;
export type InsertSymptomLog = typeof symptomLogs.$inferInsert;
export type CycleLog = typeof cycleLogs.$inferSelect;
export type InsertCycleLog = typeof cycleLogs.$inferInsert;
export type Memory = typeof memories.$inferSelect;
export type InsertMemory = typeof memories.$inferInsert;
export type EmailOtp = typeof emailOtps.$inferSelect;
export type InsertEmailOtp = typeof emailOtps.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type AppConnection = typeof appConnections.$inferSelect;
export type InsertAppConnection = typeof appConnections.$inferInsert;
