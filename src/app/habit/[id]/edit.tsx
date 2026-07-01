import { useHabitStore } from "@/store/habitStore";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

export default function EditHabitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const habits = useHabitStore(s => s.habits);
  const editHabit = useHabitStore(s => s.editHabit);

  const habit = habits.find(h => h.id === id);

  const [name, setName] = useState('');
  const [question, setQuestion] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setQuestion(habit.question ?? '');
      // set other fields
    }
  }, [habit?.id]);

  async function handleSave() {
    if (!name.trim()) { setError('Name is required'); return; }
    if (!habit) return;

    setIsSaving(true);
    try {
      await editHabit(habit.id, {
        name: name.trim(),
        question: question.trim() || undefined,
        // other fields
      });
      router.back();
    } catch (e) {
      setError('Failed to save. Please try again');
    } finally {
      setIsSaving(false);
    }
  }

  if (!habit) {
    return (
      <View style = {{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Habit not found</Text>
        <Button onPress={() => router.back()}>Go back</Button>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <TextInput
        label="Habit name"
        value={name}
        onChangeText={t => { setName(t); setError(''); }}
        mode="outlined"
        style={{ marginBottom: 8 }}
        autoFocus
      />
      {!!error && <Text style={{ color: '#E53935', fontSize: 12, marginBottom: 8 }}>{error}</Text>}

      <TextInput
        label="Habit question (optional)"
        value={question}
        onChangeText={setQuestion}
        mode="outlined"
        style={{ marginBottom: 8 }}
      />

      <Button
        mode="contained"
        onPress={handleSave}
        loading={isSaving}
        disabled={isSaving}
        style={{ marginTop: 24 }}
        buttonColor="#1D9E75"
      >
        Save Changes
      </Button>
    </ScrollView>
  )
}