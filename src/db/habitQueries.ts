import { Entry, Habit, NewHabitPayload, UpdateHabitPayload } from "@/types/habit";
import { getDB } from "./database";

export async function getAllHabits(): Promise<Habit[]> {
  const db = await getDB();
  return db.getAllAsync<Habit>(
    'SELECT * FROM habits WHERE archived = 0 ORDER BY created_at ASC'
  );
}

export async function insertHabit(payload: NewHabitPayload): Promise<string> {
  const db = await getDB();

  const result = await db.getFirstAsync<{ id: string }>(
    `INSERT INTO habits
      (name, question, type, color, frequency, frequency_days,
      unit, target, target_type, reminder_enabled, reminder_time,
      notes, archived)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,0)
    RETURNING id`,
    [
      payload.name,
      payload.question ?? null,
      payload.type,
      payload.color ?? null,
      payload.frequency,
      payload.frequency_days ?? null,
      payload.unit ?? null,
      payload.target ?? null,
      payload.target_type ?? null,
      payload.reminder_enabled ?? 0,
      payload.reminder_time ?? null,
      payload.notes ?? null,
    ]
  );

  // SQLite automatically gives us back the generated ID!
  if (!result) throw new Error("Failed to insert habit and retrieve ID");
  return result.id;
}

export async function updateHabit(id: string, payload: UpdateHabitPayload): Promise<void> {
  const db = await getDB();
  // Build SET clause dynamically from provided fields only
  const fields = Object.keys(payload) as (keyof UpdateHabitPayload)[]; // Extract keys
  if (fields.length === 0) return; // Do notion if payload is empty
  const setClauses = fields.map(f => `${f} = ?`).join(', ');
  const values = fields.map(f => payload[f] ?? null);
  await db.runAsync(
    `UPDATE habits SET ${setClauses} WHERE id = ?`,
    [...values, id]
  );
}

export async function archiveHabit(id: string): Promise<void> {
  const db = await getDB();
  await db.runAsync('UPDATE habits SET archived = 1 WHERE id = ?', [id]);
}

export async function getEntriesForDate(date: string): Promise<Entry[]> {
  const db = await getDB();
  return db.getAllAsync<Entry>(
    'SELECT * FROM entries WHERE date = ?',
    [date]
  );
}

export async function getAllEntries(): Promise<Entry[]> {
  const db = await getDB();
  return db.getAllAsync<Entry>(
    'SELECT * FROM entries ORDER BY date DESC'
  );
}

export async function upsertBooleanEntry(habitId: string, date: string, completed: boolean): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `INSERT INTO entries (id, habit_id, date, completed, value)
    VALUES (lower(hex(randomblob(4))), ?, ?, ?, NULL)
    ON CONFLICT(habit_id, date) DO UPDATE SET completed = excluded.completed`,
    [habitId, date, completed ? 1 : 0]
  );
}

export async function upsertMeasurableEntry(habitId: string, date: string, value: number): Promise<void> {
  const db = await getDB();
  const completed = value > 0 ? 1 : 0;
  await db.runAsync(
    `INSERT INTO entries (id, habit_id, date, completed, value)
    VALUES (lower(hex(randomblob(4))), ?, ?, ?, ?)
    ON CONFLICT(habit_id, date) DO UPDATE SET value = excluded.value, completed = excluded.completed`,
    [habitId, date, completed, value]
  );
}

export async function deleteEntriesForHabit(habitId: string): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    'DELETE FROM entries WHERE habit_id = ?', [habitId]
  );
}