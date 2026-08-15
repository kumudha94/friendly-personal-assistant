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
