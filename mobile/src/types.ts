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

export type MedicationInterval = "daily" | "weekly" | "every_x_days" | "monthly" | "as_needed";

export type MedicationTime = { time: string; dose: number }; // time: "HH:mm"

export type Medication = {
  id: number;
  name: string;
  dosage: string;
  active: boolean;
  reminderEnabled: boolean;
  startDate: string | null; // "YYYY-MM-DD"
  interval: MedicationInterval;
  intervalDays: number | null;
  repeatDays: WeekDay[];
  daysOfMonth: number[];
  times: MedicationTime[];
  message: string | null;
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

export type FinanceBillStatus = "paid" | "pending" | "overdue" | "skipped";

export type FinanceBillItem = {
  label: string;
  amount: number;
  dueDate: string | null; // "YYYY-MM-DD"
  isPaid: boolean;
  status: FinanceBillStatus;
};

export type FinanceBillCategory = {
  paidCount: number;
  totalCount: number;
  pendingAmount: number;
  items: FinanceBillItem[];
};

export type FinanceAccount = {
  name: string;
  bankName: string | null;
  balance: number;
};

export type FinanceSnapshot =
  | { linked: false }
  | {
      linked: true;
      email: string;
      balance: number;
      accounts: FinanceAccount[];
      cycleLabel: string;
      totalDue: number;
      categories: {
        scheduledPayments: FinanceBillCategory;
        creditCardBills: FinanceBillCategory;
        loans: FinanceBillCategory;
        insurance: FinanceBillCategory;
      };
    };

export type KitchenMealSlot = "breakfast" | "lunch" | "snack" | "dinner";

export type KitchenRecipe = {
  id: number;
  name: string;
  ingredients: { name: string; quantity: string }[];
  prepTimeMinutes: number | null;
  servings: number;
};

export type KitchenMealEntry = {
  slot: KitchenMealSlot;
  note: string | null;
  recipeNameSnapshot: string | null;
  recipe: KitchenRecipe | null;
};

export type KitchenSnapshot =
  | { configured: false }
  | { connected: false }
  | { configured: true; connected: true; date: string; meals: KitchenMealEntry[] };

export type WeatherSnapshot =
  | { configured: false }
  | {
      configured: true;
      tempC: number;
      condition: string; // OpenWeatherMap "main", e.g. "Rain", "Clear", "Clouds"
      description: string; // e.g. "light rain"
      locationName: string;
    };
