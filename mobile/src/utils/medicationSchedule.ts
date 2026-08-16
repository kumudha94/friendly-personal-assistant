import type { Medication, MedicationTime } from "../types";
import { DAY_LABELS } from "./weekday";

type IntervalFields = Pick<Medication, "interval" | "repeatDays" | "intervalDays" | "daysOfMonth">;

function formatTime12h(time: string): string {
  const [hour, minute] = time.split(":").map(Number);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

export function intervalSummary(medication: IntervalFields): string {
  switch (medication.interval) {
    case "daily":
      return "Every day";
    case "weekly":
      return medication.repeatDays.length > 0
        ? `Weekly · ${medication.repeatDays.map((d) => DAY_LABELS[d]).join(", ")}`
        : "Weekly";
    case "every_x_days":
      return medication.intervalDays ? `Every ${medication.intervalDays} days` : "Every X days";
    case "monthly":
      return medication.daysOfMonth.length > 0 ? `Monthly · ${medication.daysOfMonth.join(", ")}` : "Monthly";
    case "as_needed":
      return "Take as needed";
    default:
      return "";
  }
}

export function formatTimeEntry(entry: MedicationTime): string {
  return `${formatTime12h(entry.time)} · ${entry.dose} dose${entry.dose === 1 ? "" : "s"}`;
}

export function timesSummary(times: MedicationTime[]): string {
  if (times.length === 0) return "No times set";
  return times.map(formatTimeEntry).join(", ");
}
