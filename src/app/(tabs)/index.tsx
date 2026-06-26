import HabitRow from "@/components/HabitRow";
import { useHabitStore } from "@/store/habitStore";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { ActivityIndicator, FAB, Text } from "react-native-paper";

const today = () => new Date().toISOString().split('T')[0];

export default function HomeScreen() {
  const habits = useHabitStore(state => state.habits);
  const todayEntries = useHabitStore(state => state.todayEntries);
  const isLoading = useHabitStore(state => state.isLoading);
  const loadHabits = useHabitStore(state => state.loadHabits);
  const toggleEntry = useHabitStore(state => state.toggleEntry);

  // Reload every time screen gains focus - catches adds/edits from modals
  useFocusEffect(
    useCallback(() => {
      loadHabits(today());
    }, [])
  );

  const handleToggle = useCallback((habitId: string) => {
    toggleEntry(habitId, today());
  }, [])

  const handlePress = useCallback((habitId: string) => {
    router.push(`/habit/${habitId}`);
  }, [])

  const renderItem = useCallback(
    ({ item }: { item: typeof habits[0] }) => (
      <HabitRow
        habit={item}
        entry={todayEntries.find(e => e.habit_id === item.id)}
        onToggle={handleToggle}
        onPress={handlePress}
      />
    ),
    [todayEntries, handleToggle, handlePress]
  );

  // Loading state - only show spinner on first load (list is empty)
  if (isLoading && habits.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1D9E75" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {habits.length === 0 ? (
        // Empty state
        <View style={styles.centered}>
          <Text variant="bodyLarge" style={styles.emptyText}>No habits yet.</Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            Tap + to add your first habit.
          </Text>
        </View>
      ) : (
        <FlatList
          data={habits}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        color="#ffffff"
        onPress={() => router.push('/habit/new')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  centered:     { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText:    { color: '#888', marginBottom: 4 },
  emptySubtext: { color: '#aaa' },
  list:         { paddingBottom: 80 }, // clearance so FAB doesn't overlap last row
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#1D9E75',
  },
});
