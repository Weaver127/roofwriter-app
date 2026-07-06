import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { YesNoToggle } from "./ToggleGroup";
import type { Confirmable } from "../types/inspection";

interface ConfirmableYesNoProps {
  field: Confirmable<boolean>;
  onChange: (confirmedField: Confirmable<boolean>) => void;
}

/**
 * Fixes the specific bug found in testing: the old ConfirmableChip only
 * offered a "Confirm" button for the AI-suggested value, with no way to
 * change it if the AI guessed wrong (e.g. overhead power detected as "No"
 * when it should be "Yes"). This always shows both Yes/No options —
 * whichever the assessor taps becomes the confirmed value, whether that
 * matches the AI's suggestion or overrides it.
 */
export function ConfirmableYesNo({ field, onChange }: ConfirmableYesNoProps) {
  const select = (value: boolean) =>
    onChange({ value, source: field.confirmed ? field.source : "manual", confirmed: true, confirmedAt: new Date().toISOString() });

  return (
    <View>
      {!field.confirmed && (
        <Text style={styles.suggestionLabel}>
          AI suggests: {field.value ? "Yes" : "No"} — tap Yes or No to confirm or change
        </Text>
      )}
      <YesNoToggle value={field.confirmed ? field.value : field.value} onChange={select} />
    </View>
  );
}

const styles = StyleSheet.create({
  suggestionLabel: { fontSize: 10, color: "#c2410c", fontWeight: "600", marginBottom: 6 },
});
