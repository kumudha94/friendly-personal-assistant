import { pgTable, serial, text, integer, boolean, date, timestamp } from "drizzle-orm/pg-core";
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

export const insertHabitSchema = createInsertSchema(habits).omit({ id: true, createdAt: true });
export const insertHabitLogSchema = createInsertSchema(habitLogs).omit({ id: true });
export const insertReminderSchema = createInsertSchema(reminders).omit({ id: true, createdAt: true });

export type Habit = typeof habits.$inferSelect;
export type InsertHabit = typeof habits.$inferInsert;
export type HabitLog = typeof habitLogs.$inferSelect;
export type InsertHabitLog = typeof habitLogs.$inferInsert;
export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = typeof reminders.$inferInsert;
