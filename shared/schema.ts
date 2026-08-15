import { pgTable, serial, text, integer, real, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

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

export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  quantityRemaining: integer("quantity_remaining").notNull().default(0),
  refillThreshold: integer("refill_threshold").notNull().default(5),
  active: boolean("active").notNull().default(true),
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

export const emailOtps = pgTable("email_otps", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const financeLink = pgTable("finance_link", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  financeUserId: integer("finance_user_id").notNull(),
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
export const insertMedicationSchema = createInsertSchema(medications).omit({ id: true, createdAt: true });
export const insertMedicationLogSchema = createInsertSchema(medicationLogs).omit({ id: true });
export const insertSymptomLogSchema = createInsertSchema(symptomLogs).omit({ id: true, createdAt: true });
export const insertCycleLogSchema = createInsertSchema(cycleLogs).omit({ id: true });
export const insertMemorySchema = createInsertSchema(memories).omit({ id: true, createdAt: true });
export const insertEmailOtpSchema = createInsertSchema(emailOtps).omit({ id: true });
export const insertFinanceLinkSchema = createInsertSchema(financeLink).omit({ id: true, verifiedAt: true });

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
export type FinanceLink = typeof financeLink.$inferSelect;
export type InsertFinanceLink = typeof financeLink.$inferInsert;
