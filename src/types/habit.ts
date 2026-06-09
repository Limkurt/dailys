export type HabitType = 'boolean' | 'measurable';

export type TargetType = 'at_least' | 'at_most';

export type Frequency = 'daily' | 'weekly' | 'custom';

export interface Habit {
  id: string;
  name: string;
  question: string | null;
  type: HabitType;
  color: string | null;
  frequency: Frequency;
  frequency_days: string | null;
  // measurable only
  unit: string | null;
  target: number | null;
  target_type: TargetType | null;
  // reminders
  reminder_enabled: number;     // 0 | 1
  reminder_time: string | null; // HH:MM
  // meta
  notes: string | null;
  created_at: string;
  archived: number;             // 0 | 1
}

export interface Entry {
  id: string;
  habit_id: string;
  date: string;               // YYYY-MM-DD
  completed: number;          // 0 | 1
  value: number | null;       // measurable only, null for boolean
  notes: string | null;
  created_at: string;
}

export interface NewHabitPayload {
  name: string;
  question?: string;
  type: HabitType;
  color?: string;
  frequency: Frequency;
  frequency_days?: string;
  // measurable
  unit?: string;
  target?: number;
  target_type?: TargetType;
  reminder_enabled?: number;
  reminder_time?: string;
  notes?: string;
}

// Payload types - used in store actions
export type UpdateHabitPayload = Partial<Omit<NewHabitPayload, 'type'>>;  // excludes the type