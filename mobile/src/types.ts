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
