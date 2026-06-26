import React, { memo } from 'react'
import type { Entry, Habit } from "@/types/habit";
import { View, Pressable, StyleSheet } from "react-native";
import { Checkbox, Text, List } from "react-native-paper";

interface Props {
  habit: Habit
  entry: Entry | undefined
  onToggle: (habitId: string) => void;
  onPress: (habitId: string) => void;
}

function HabitRow({ habit, entry, onToggle, onPress}: Props) {
  const isCompleted = entry?.completed === 1;

  return (
    <Pressable onPress={() => onPress(habit.id)}>
      <List.Item
        title = {habit.name}
        description = {habit.question ?? undefined}
        left={() => (
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{habit.color ?? '📋'}</Text>
          </View>
        )}
        right={() => (
          <Checkbox
            status={isCompleted ? 'checked' : 'unchecked'}
            onPress={() => onToggle(habit.id)}
            color="#1D9E75"
          />
        )}
      />  
    </Pressable>
  );
}

export default memo(HabitRow)

const styles = StyleSheet.create({
  iconContainer: { justifyContent: 'center', paddingLeft: 8 },
  icon: { fontSize: 22 },
})