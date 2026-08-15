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
