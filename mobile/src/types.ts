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
