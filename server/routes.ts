import type { Express } from "express";
import { createServer, type Server } from "http";
import { eq, and } from "drizzle-orm";
import { db } from "./db";
import {
  habits,
  habitLogs,
  reminders,
  waterLogs,
  goals,
  journalEntries,
  moodLogs,
  weightLogs,
  medications,
  medicationLogs,
  symptomLogs,
  cycleLogs,
  insertHabitSchema,
  insertHabitLogSchema,
  insertReminderSchema,
  insertWaterLogSchema,
  insertGoalSchema,
  insertJournalEntrySchema,
  insertMoodLogSchema,
  insertWeightLogSchema,
  insertMedicationSchema,
  insertMedicationLogSchema,
  insertSymptomLogSchema,
  insertCycleLogSchema,
} from "@shared/schema";
import { generateDigest } from "./digest";
import { parseQuickAdd } from "./quickAdd";
import { asyncHandler } from "./asyncHandler";

const FK_VIOLATION = "23503";

export async function registerRoutes(app: Express): Promise<Server> {
  // Habits
  app.post(
    "/habits",
    asyncHandler(async (req, res) => {
      const parsed = insertHabitSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      const [habit] = await db.insert(habits).values(parsed.data).returning();
      res.status(201).json(habit);
    }),
  );

  app.get(
    "/habits",
    asyncHandler(async (_req, res) => {
      res.json(await db.select().from(habits));
    }),
  );

  app.patch(
    "/habits/:id",
    asyncHandler(async (req, res) => {
      const [habit] = await db
        .update(habits)
        .set(req.body)
        .where(eq(habits.id, Number(req.params.id)))
        .returning();
      if (!habit) return res.status(404).json({ message: "Habit not found" });
      res.json(habit);
    }),
  );

  app.delete(
    "/habits/:id",
    asyncHandler(async (req, res) => {
      try {
        await db.delete(habits).where(eq(habits.id, Number(req.params.id)));
        res.status(204).end();
      } catch (err: any) {
        if (err.code === FK_VIOLATION) {
          return res
            .status(409)
            .json({ message: "Can't delete this habit while it has logs or linked goals." });
        }
        throw err;
      }
    }),
  );

  // Habit logs
  app.post(
    "/habit_logs",
    asyncHandler(async (req, res) => {
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
    }),
  );

  app.get(
    "/habit_logs",
    asyncHandler(async (req, res) => {
      const { date } = req.query;
      const query = db.select().from(habitLogs);
      res.json(date ? await query.where(eq(habitLogs.date, String(date))) : await query);
    }),
  );

  // Reminders
  app.post(
    "/reminders",
    asyncHandler(async (req, res) => {
      const parsed = insertReminderSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      const [reminder] = await db.insert(reminders).values(parsed.data).returning();
      res.status(201).json(reminder);
    }),
  );

  app.get(
    "/reminders",
    asyncHandler(async (_req, res) => {
      res.json(await db.select().from(reminders));
    }),
  );

  app.patch(
    "/reminders/:id",
    asyncHandler(async (req, res) => {
      const [reminder] = await db
        .update(reminders)
        .set(req.body)
        .where(eq(reminders.id, Number(req.params.id)))
        .returning();
      if (!reminder) return res.status(404).json({ message: "Reminder not found" });
      res.json(reminder);
    }),
  );

  app.delete(
    "/reminders/:id",
    asyncHandler(async (req, res) => {
      await db.delete(reminders).where(eq(reminders.id, Number(req.params.id)));
      res.status(204).end();
    }),
  );

  // Water logs
  app.post(
    "/water_logs",
    asyncHandler(async (req, res) => {
      const parsed = insertWaterLogSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      const existing = await db.select().from(waterLogs).where(eq(waterLogs.date, parsed.data.date));
      if (existing.length > 0) {
        const [log] = await db
          .update(waterLogs)
          .set({ count: parsed.data.count, target: parsed.data.target })
          .where(eq(waterLogs.id, existing[0].id))
          .returning();
        return res.json(log);
      }
      const [log] = await db.insert(waterLogs).values(parsed.data).returning();
      res.status(201).json(log);
    }),
  );

  app.get(
    "/water_logs",
    asyncHandler(async (req, res) => {
      const { date } = req.query;
      const query = db.select().from(waterLogs);
      res.json(date ? await query.where(eq(waterLogs.date, String(date))) : await query);
    }),
  );

  // Goals
  app.post(
    "/goals",
    asyncHandler(async (req, res) => {
      const parsed = insertGoalSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      const [goal] = await db.insert(goals).values(parsed.data).returning();
      res.status(201).json(goal);
    }),
  );

  app.get(
    "/goals",
    asyncHandler(async (_req, res) => {
      res.json(await db.select().from(goals));
    }),
  );

  app.patch(
    "/goals/:id",
    asyncHandler(async (req, res) => {
      const [goal] = await db
        .update(goals)
        .set(req.body)
        .where(eq(goals.id, Number(req.params.id)))
        .returning();
      if (!goal) return res.status(404).json({ message: "Goal not found" });
      res.json(goal);
    }),
  );

  app.delete(
    "/goals/:id",
    asyncHandler(async (req, res) => {
      await db.delete(goals).where(eq(goals.id, Number(req.params.id)));
      res.status(204).end();
    }),
  );

  // Journal entries
  app.post(
    "/journal_entries",
    asyncHandler(async (req, res) => {
      const parsed = insertJournalEntrySchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      const [entry] = await db.insert(journalEntries).values(parsed.data).returning();
      res.status(201).json(entry);
    }),
  );

  app.get(
    "/journal_entries",
    asyncHandler(async (req, res) => {
      const { type } = req.query;
      const query = db.select().from(journalEntries);
      res.json(type ? await query.where(eq(journalEntries.type, String(type))) : await query);
    }),
  );

  app.patch(
    "/journal_entries/:id",
    asyncHandler(async (req, res) => {
      const [entry] = await db
        .update(journalEntries)
        .set(req.body)
        .where(eq(journalEntries.id, Number(req.params.id)))
        .returning();
      if (!entry) return res.status(404).json({ message: "Journal entry not found" });
      res.json(entry);
    }),
  );

  app.delete(
    "/journal_entries/:id",
    asyncHandler(async (req, res) => {
      await db.delete(journalEntries).where(eq(journalEntries.id, Number(req.params.id)));
      res.status(204).end();
    }),
  );

  // Mood logs
  app.post(
    "/mood_logs",
    asyncHandler(async (req, res) => {
      const parsed = insertMoodLogSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      const existing = await db.select().from(moodLogs).where(eq(moodLogs.date, parsed.data.date));
      if (existing.length > 0) {
        const [log] = await db
          .update(moodLogs)
          .set({
            moodScale: parsed.data.moodScale,
            energyLevel: parsed.data.energyLevel,
            sleepHours: parsed.data.sleepHours,
            notes: parsed.data.notes,
          })
          .where(eq(moodLogs.id, existing[0].id))
          .returning();
        return res.json(log);
      }
      const [log] = await db.insert(moodLogs).values(parsed.data).returning();
      res.status(201).json(log);
    }),
  );

  app.get(
    "/mood_logs",
    asyncHandler(async (req, res) => {
      const { date } = req.query;
      const query = db.select().from(moodLogs);
      res.json(date ? await query.where(eq(moodLogs.date, String(date))) : await query);
    }),
  );

  // Claude-powered digest
  app.get(
    "/digest",
    asyncHandler(async (req, res) => {
      const period = req.query.period === "weekly" ? "weekly" : "daily";
      try {
        const text = await generateDigest(period);
        res.json({ text });
      } catch (err: any) {
        res.status(502).json({ message: err.message });
      }
    }),
  );

  // Natural language quick-add
  app.post(
    "/quick_add",
    asyncHandler(async (req, res) => {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({ message: "text is required" });
      }
      try {
        const result = await parseQuickAdd(text);

        if (result.type === "reminder") {
          const [reminder] = await db
            .insert(reminders)
            .values({ title: result.title, time: result.time, repeatDays: result.repeatDays, active: true })
            .returning();
          return res.status(201).json({ type: "reminder", item: reminder });
        }

        if (result.type === "habit") {
          const [habit] = await db
            .insert(habits)
            .values({ name: result.title, frequency: result.frequency })
            .returning();
          return res.status(201).json({ type: "habit", item: habit });
        }

        const [goal] = await db
          .insert(goals)
          .values({ title: result.title, targetDate: result.targetDate })
          .returning();
        return res.status(201).json({ type: "goal", item: goal });
      } catch (err: any) {
        res.status(502).json({ message: err.message });
      }
    }),
  );

  // Weight logs
  app.post(
    "/weight_logs",
    asyncHandler(async (req, res) => {
      const parsed = insertWeightLogSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      const existing = await db.select().from(weightLogs).where(eq(weightLogs.date, parsed.data.date));
      if (existing.length > 0) {
        const [log] = await db
          .update(weightLogs)
          .set({ weight: parsed.data.weight, unit: parsed.data.unit, notes: parsed.data.notes })
          .where(eq(weightLogs.id, existing[0].id))
          .returning();
        return res.json(log);
      }
      const [log] = await db.insert(weightLogs).values(parsed.data).returning();
      res.status(201).json(log);
    }),
  );

  app.get(
    "/weight_logs",
    asyncHandler(async (req, res) => {
      const { date } = req.query;
      const query = db.select().from(weightLogs);
      res.json(date ? await query.where(eq(weightLogs.date, String(date))) : await query);
    }),
  );

  // Medications
  app.post(
    "/medications",
    asyncHandler(async (req, res) => {
      const parsed = insertMedicationSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      const [medication] = await db.insert(medications).values(parsed.data).returning();
      res.status(201).json(medication);
    }),
  );

  app.get(
    "/medications",
    asyncHandler(async (_req, res) => {
      res.json(await db.select().from(medications));
    }),
  );

  app.patch(
    "/medications/:id",
    asyncHandler(async (req, res) => {
      const [medication] = await db
        .update(medications)
        .set(req.body)
        .where(eq(medications.id, Number(req.params.id)))
        .returning();
      if (!medication) return res.status(404).json({ message: "Medication not found" });
      res.json(medication);
    }),
  );

  app.delete(
    "/medications/:id",
    asyncHandler(async (req, res) => {
      try {
        await db.delete(medications).where(eq(medications.id, Number(req.params.id)));
        res.status(204).end();
      } catch (err: any) {
        if (err.code === FK_VIOLATION) {
          return res.status(409).json({ message: "Can't delete this medication while it has logs." });
        }
        throw err;
      }
    }),
  );

  // Medication logs — taking a dose decrements the medication's quantityRemaining;
  // un-taking restores it, so quantity stays accurate regardless of toggle direction.
  app.post(
    "/medication_logs",
    asyncHandler(async (req, res) => {
      const parsed = insertMedicationLogSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });

      const existing = await db
        .select()
        .from(medicationLogs)
        .where(
          and(
            eq(medicationLogs.medicationId, parsed.data.medicationId),
            eq(medicationLogs.date, parsed.data.date),
          ),
        );
      const wasTaken = existing.length > 0 ? existing[0].taken : false;
      const nowTaken = parsed.data.taken;

      const log =
        existing.length > 0
          ? (
              await db
                .update(medicationLogs)
                .set({ taken: nowTaken })
                .where(eq(medicationLogs.id, existing[0].id))
                .returning()
            )[0]
          : (await db.insert(medicationLogs).values(parsed.data).returning())[0];

      let medication;
      if (wasTaken !== nowTaken) {
        const [med] = await db.select().from(medications).where(eq(medications.id, parsed.data.medicationId));
        const newQuantity = Math.max(0, med.quantityRemaining + (nowTaken ? -1 : 1));
        [medication] = await db
          .update(medications)
          .set({ quantityRemaining: newQuantity })
          .where(eq(medications.id, parsed.data.medicationId))
          .returning();
      } else {
        [medication] = await db.select().from(medications).where(eq(medications.id, parsed.data.medicationId));
      }

      res.status(existing.length > 0 ? 200 : 201).json({ log, medication });
    }),
  );

  app.get(
    "/medication_logs",
    asyncHandler(async (req, res) => {
      const { date } = req.query;
      const query = db.select().from(medicationLogs);
      res.json(date ? await query.where(eq(medicationLogs.date, String(date))) : await query);
    }),
  );

  // Symptom logs (insert-only — multiple symptoms can be logged per day)
  app.post(
    "/symptom_logs",
    asyncHandler(async (req, res) => {
      const parsed = insertSymptomLogSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      const [log] = await db.insert(symptomLogs).values(parsed.data).returning();
      res.status(201).json(log);
    }),
  );

  app.get(
    "/symptom_logs",
    asyncHandler(async (_req, res) => {
      res.json(await db.select().from(symptomLogs));
    }),
  );

  app.delete(
    "/symptom_logs/:id",
    asyncHandler(async (req, res) => {
      await db.delete(symptomLogs).where(eq(symptomLogs.id, Number(req.params.id)));
      res.status(204).end();
    }),
  );

  // Cycle logs
  app.post(
    "/cycle_logs",
    asyncHandler(async (req, res) => {
      const parsed = insertCycleLogSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
      const [log] = await db.insert(cycleLogs).values(parsed.data).returning();
      res.status(201).json(log);
    }),
  );

  app.get(
    "/cycle_logs",
    asyncHandler(async (_req, res) => {
      res.json(await db.select().from(cycleLogs));
    }),
  );

  app.patch(
    "/cycle_logs/:id",
    asyncHandler(async (req, res) => {
      const [log] = await db
        .update(cycleLogs)
        .set(req.body)
        .where(eq(cycleLogs.id, Number(req.params.id)))
        .returning();
      if (!log) return res.status(404).json({ message: "Cycle log not found" });
      res.json(log);
    }),
  );

  app.delete(
    "/cycle_logs/:id",
    asyncHandler(async (req, res) => {
      await db.delete(cycleLogs).where(eq(cycleLogs.id, Number(req.params.id)));
      res.status(204).end();
    }),
  );

  return createServer(app);
}
