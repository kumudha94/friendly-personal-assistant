export type Frequency = "daily" | "weekly" | "custom";

export type Habit = {
  id: number;
  name: string;
  frequency: Frequency;
  targetCount: number;
  createdAt: string;
};

export type HabitLog = {
  id: number;
  habitId: number;
  date: string; // "YYYY-MM-DD"
  completed: boolean;
};

export type WeekDay = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export type Reminder = {
  id: number;
  title: string;
  time: string; // "HH:mm"
  repeatDays: WeekDay[];
  active: boolean;
  createdAt: string;
};

export type WaterLog = {
  id: number;
  date: string; // "YYYY-MM-DD"
  count: number;
  target: number;
};

export type Goal = {
  id: number;
  title: string;
  description: string | null;
  habitId: number | null;
  targetDate: string | null; // "YYYY-MM-DD"
  completed: boolean;
  createdAt: string;
};

export type JournalType = "daily" | "weekly" | "monthly";

export type JournalEntry = {
  id: number;
  type: JournalType;
  date: string; // "YYYY-MM-DD"
  content: string;
  createdAt: string;
};

export type MoodLog = {
  id: number;
  date: string; // "YYYY-MM-DD"
  moodScale: number; // 1-5
  energyLevel: number; // 1-5
  sleepHours: number;
  notes: string | null;
};

export type QuickAddResult =
  | { type: "reminder"; item: Reminder }
  | { type: "habit"; item: Habit }
  | { type: "goal"; item: Goal };

export type WeightUnit = "kg" | "lbs";

export type WeightLog = {
  id: number;
  date: string; // "YYYY-MM-DD"
  weight: number;
  unit: WeightUnit;
  notes: string | null;
};

export type Medication = {
  id: number;
  name: string;
  dosage: string;
  quantityRemaining: number;
  refillThreshold: number;
  active: boolean;
  createdAt: string;
};

export type MedicationLog = {
  id: number;
  medicationId: number;
  date: string; // "YYYY-MM-DD"
  taken: boolean;
};

export type SymptomLog = {
  id: number;
  date: string; // "YYYY-MM-DD"
  symptom: string;
  severity: number; // 1-5
  notes: string | null;
  createdAt: string;
};

export type CycleLog = {
  id: number;
  startDate: string; // "YYYY-MM-DD"
  endDate: string | null;
  notes: string | null;
};

export type Memory = {
  id: number;
  text: string;
  createdAt: string;
};

export type DigestResult = {
  headline: string;
  highlight: string | null;
  sections: { label: string; detail: string }[];
};

export type EveningPlan = {
  summary: string;
  items: { time: string; title: string }[];
};
