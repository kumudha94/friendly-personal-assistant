import type { Express } from "express";
import { createServer, type Server } from "http";
import { eq, and } from "drizzle-orm";
import { db } from "./db";
import {
  habits,
  habitLogs,
  reminders,
  insertHabitSchema,
  insertHabitLogSchema,
  insertReminderSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Habits
  app.post("/habits", async (req, res) => {
    const parsed = insertHabitSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const [habit] = await db.insert(habits).values(parsed.data).returning();
    res.status(201).json(habit);
  });

  app.get("/habits", async (_req, res) => {
    res.json(await db.select().from(habits));
  });

  app.patch("/habits/:id", async (req, res) => {
    const [habit] = await db
      .update(habits)
      .set(req.body)
      .where(eq(habits.id, Number(req.params.id)))
      .returning();
    if (!habit) return res.status(404).json({ message: "Habit not found" });
    res.json(habit);
  });

  app.delete("/habits/:id", async (req, res) => {
    await db.delete(habits).where(eq(habits.id, Number(req.params.id)));
    res.status(204).end();
  });

  // Habit logs
  app.post("/habit_logs", async (req, res) => {
    const parsed = insertHabitLogSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const existing = await db
      .select()
      .from(habitLogs)
      .where(and(eq(habitLogs.habitId, parsed.data.habitId), eq(habitLogs.date, parsed.data.date)));
    if (existing.length > 0) {
      const [log] = await db
        .update(habitLogs)
        .set({ completed: parsed.data.completed })
        .where(eq(habitLogs.id, existing[0].id))
        .returning();
      return res.json(log);
    }
    const [log] = await db.insert(habitLogs).values(parsed.data).returning();
    res.status(201).json(log);
  });

  app.get("/habit_logs", async (req, res) => {
    const { date } = req.query;
    const query = db.select().from(habitLogs);
    res.json(date ? await query.where(eq(habitLogs.date, String(date))) : await query);
  });

  // Reminders
  app.post("/reminders", async (req, res) => {
    const parsed = insertReminderSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
    const [reminder] = await db.insert(reminders).values(parsed.data).returning();
    res.status(201).json(reminder);
  });

  app.get("/reminders", async (_req, res) => {
    res.json(await db.select().from(reminders));
  });

  app.patch("/reminders/:id", async (req, res) => {
    const [reminder] = await db
      .update(reminders)
      .set(req.body)
      .where(eq(reminders.id, Number(req.params.id)))
      .returning();
    if (!reminder) return res.status(404).json({ message: "Reminder not found" });
    res.json(reminder);
  });

  app.delete("/reminders/:id", async (req, res) => {
    await db.delete(reminders).where(eq(reminders.id, Number(req.params.id)));
    res.status(204).end();
  });

  return createServer(app);
}
