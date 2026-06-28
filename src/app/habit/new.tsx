import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import {
  TextInput, Button, Text, Snackbar, SegmentedButtons
} from 'react-native-paper';
import { router } from 'expo-router';
import { useHabitStore } from '@/store/habitStore';
import type { HabitType } from '@/types/habit';

const PRESET_ICONS = ['💪', '📚', '🏃', '💧', '🧘', '🌱'];
const PRESET_COLORS = ['#1D9E75', '#E57373', '#64B5F6', '#FFB74D', '#BA68C8', '#A1887F'];

export default function NewHabitScreen() {
  const addHabit = useHabitStore(state => state.addHabit);

  // Form state
  const [name, setName] = useState('');
  const [question, setQuestion] = useState('');
  const [type, setType] = useState<HabitType>('boolean');
  const [selectedIcon,  setSelectedIcon]  = useState(PRESET_ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [unit,          setUnit]          = useState('');
  const [target,        setTarget]        = useState('');

  // UI state
  const [nameError,    setNameError]    = useState('');
  const [questionError, setQuestionError] = useState('');
  const [isSaving,     setIsSaving]     = useState(false);
  const [snackVisible, setSnackVisible] = useState(false);

  const validate = (): boolean => {
    let isValid = true;
    
    if (!name.trim()) {
      setNameError('Habit name is required.');
      isValid = false;
    } else {
    setNameError('');
    };

    if (!question.trim()) {
      setQuestionError('Habit question is required.');
      isValid = false;
    } else {
      setQuestionError('')
    };

    return isValid;
  };

  const handleSave = async () => {
    if (!validate() || isSaving) return;
    setIsSaving(true);
    try {
      await addHabit({
        name: name.trim(),
        question: question.trim(),
        type,
        color: selectedIcon, // for now
        frequency: 'daily',
        // Measurable only fields - only passed when type is measurable
        ...(type === 'measurable' && {
          unit: unit.trim() || undefined,
          target: target ? Number(target) : undefined,
          target_type: 'at_least' as const,
        }),
      });
      router.back();
    } catch {
      setSnackVisible(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

      {/* Habit name */}
      <TextInput
        label="Habit name"
        value={name}
        onChangeText={t => {setName(t); setNameError(''); }}
        mode="outlined"
        error={!!nameError}
        style={styles.input}
        autoFocus
      />
      {!!nameError && (
        <Text style={styles.errorText}>{nameError}</Text>
      )}

      {/* Habit Question */}
      <TextInput
        label="Habit Question"
        value={question}
        onChangeText={t => {setQuestion(t); setQuestionError(''); }}
        mode="outlined"
        error={!!questionError}
        style={styles.input}
      />
      {!!questionError && (
        <Text style={styles.errorText}>{questionError}</Text>
      )}

      {/* Habit Type */}
      <Text style={styles.label}>Type</Text>
      <SegmentedButtons
        value={type}
        onValueChange={v => setType(v as HabitType)}
        buttons={[
          { value: 'boolean', label: 'Yes / No'},
          { value: 'measurable', label: 'Measurable'}
        ]}
        style={styles.segment}
      />

            {/* Measurable-only fields */}
      {type === 'measurable' && (
        <>
          <TextInput
            label="Unit  (e.g. glasses, km, pages)"
            value={unit}
            onChangeText={setUnit}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Daily target"
            value={target}
            onChangeText={setTarget}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />
        </>
      )}

            {/* Icon picker */}
      <Text style={styles.label}>Icon</Text>
      <View style={styles.row}>
        {PRESET_ICONS.map(icon => (
          <Pressable
            key={icon}
            onPress={() => setSelectedIcon(icon)}
            style={[
              styles.iconBtn,
              selectedIcon === icon && styles.iconBtnSelected,
            ]}
          >
            <Text style={styles.iconText}>{icon}</Text>
          </Pressable>
        ))}
      </View>

      {/* Color picker */}
      <Text style={styles.label}>Color</Text>
      <View style={styles.row}>
        {PRESET_COLORS.map(color => (
          <Pressable
            key={color}
            onPress={() => setSelectedColor(color)}
            style={[
              styles.colorSwatch,
              { backgroundColor: color },
              selectedColor === color && styles.swatchSelected,
            ]}
          />
        ))}
      </View>

      <Button
        mode="contained"
        onPress={handleSave}
        loading={isSaving}
        disabled={isSaving}
        style={styles.saveBtn}
        buttonColor="#1D9E75"
      >
        Save Habit
      </Button>

      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={3000}
      >
        Something went wrong. Please try again.
      </Snackbar>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container:       { padding: 20, paddingBottom: 60 },
  input:           { marginBottom: 8 },
  label:           { fontSize: 13, color: '#888', marginTop: 16, marginBottom: 8 },
  segment:         { marginBottom: 8 },
  errorText:       { color: '#E53935', fontSize: 12, marginBottom: 8 },
  row:             { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 8 },
  iconBtn:         {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'transparent',
    backgroundColor: '#f0f0f0',
  },
  iconBtnSelected: { borderColor: '#1D9E75' },
  iconText:        { fontSize: 22 },
  colorSwatch:     { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: 'transparent' },
  swatchSelected:  { borderColor: '#000', transform: [{ scale: 1.15 }] },
  saveBtn:         { marginTop: 32 },
});