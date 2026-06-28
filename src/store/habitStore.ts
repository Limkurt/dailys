import { create } from 'zustand'
import { Habit, Entry, NewHabitPayload, UpdateHabitPayload } from "@/types/habit";
import { archiveHabit, getAllHabits, getEntriesForDate, insertHabit, updateHabit, upsertBooleanEntry } from '@/db/habitQueries';

interface HabitState {
  habits: Habit[];
  todayEntries: Entry[];
  isLoading: boolean;

  // Actions
  loadHabits: (date: string) => Promise<void>;
  addHabit: (payload: NewHabitPayload) => Promise<void>;
  editHabit: (id: string, payload: UpdateHabitPayload) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleEntry: (habitId: string, date: string) => Promise<void>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  todayEntries: [],
  isLoading: false,

  loadHabits: async (date: string) => {
    set({ isLoading: true });
    const [habits, todayEntries] = await Promise.all([
      getAllHabits(),
      getEntriesForDate(date),
    ]);
    set({ habits, todayEntries, isLoading: false});
  },

  addHabit: async (payload) => {
    await insertHabit(payload);
    await get().loadHabits(new Date().toISOString().split('T')[0]);
  },

  editHabit: async (id, payload) => {
    await updateHabit(id, payload);
    await get().loadHabits(new Date().toISOString().split('T')[0])
  },

  deleteHabit: async (id) => {
    // a soft delete - archive the habit, entries are kept for historical stats
    await archiveHabit(id);
    await get().loadHabits(new Date().toISOString().split('T')[0])
  },

  toggleEntry: async (habitId, date) => {
    const { todayEntries } = get();
    const existing = todayEntries.find(e => e.habit_id === habitId);
    const nextCompleted = existing ? existing.completed === 0 : true;
    await upsertBooleanEntry(habitId, date, nextCompleted);
    await get().loadHabits(date);
  },
}));