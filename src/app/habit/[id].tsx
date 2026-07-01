import { getEntriesForHabit } from "@/db/habitQueries";
import { useHabitStore } from "@/store/habitStore";
import { Entry } from "@/types/habit";
import { router, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { SectionList, View } from "react-native";
import { ActivityIndicator, Checkbox, IconButton, Text } from "react-native-paper";

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const habits = useHabitStore(s => s.habits);
  const deleteHabit = useHabitStore(s => s.deleteHabit)
  const toggleEntry = useHabitStore(s => s.toggleEntry);

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const habit = habits.find(h => h.id === id) ?? null;

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        setLoading(true);
        const rows = await getEntriesForHabit(id);
        if (active) {
          setEntries(rows);
          setLoading(false);
        }
      })();
      return () => { active = false; };
    }, [id])
  );

  // ── helper function — also inside the component ───────────────────────
  function groupByMonth(entries: Entry[]): { title: string; data: Entry[] }[] {
    const map: Record<string, Entry[]> = {};
    const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
    for (const entry of sorted) {
      const [year, month] = entry.date.split('-');
      const label = new Date(`${year}-${month}-01T12:00:00`).toLocaleString('default', {
        month: 'long', year: 'numeric'
      });
      if (!map[label]) map[label] = [];
      map[label].push(entry);
    }
    return Object.entries(map).map(([title, data]) => ({ title, data }));
  }

  const sections = groupByMonth(entries);

  // ── return is the last thing inside the function ──────────────────────
  return (
    <>
      <Stack.Screen
        options={{
          title: habit?.name ?? 'Habit',
          headerRight: () => (
            <View style={{ flexDirection: 'row' }}>
              <IconButton
                icon="pencil"
                onPress={() => router.push(`/habit/${id}/edit`)}
              />
              <IconButton
                icon="delete"
                onPress={async () => {
                  await deleteHabit(id);
                  router.back();
                }}
              />
            </View>
          ),
        }}
      />
      {loading ? (
        <ActivityIndicator style={{ marginTop: 32 }} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.date}
          renderSectionHeader={({ section }) => (
            <Text variant="labelMedium" style={{ padding: 12, opacity: 0.6 }}>
              {section.title}
            </Text>
          )}
          renderItem={({ item }) => (
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 4 }}>
              <Text style={{ flex: 1 }}>{item.date}</Text>
              <Checkbox
                status={item.completed ? 'checked' : 'unchecked'}
                onPress={() => toggleEntry(id, item.date)}
              />
            </View>
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 48, opacity: 0.5 }}>
              No entries yet. Start tracking today.
            </Text>
          }
        />
      )}
    </>
  );
}