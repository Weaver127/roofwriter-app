import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import type { Confirmable } from "../types/inspection";

interface ConfirmableChipProps<T> {
  field: Confirmable<T>;
  render: (value: T) => string;
  onConfirm: () => void;
  onReject?: () => void;
}

/**
 * Renders an [AI-DRAFT] field per the product spec: unconfirmed values get
 * the amber "suggested" treatment and a Confirm button; confirmed values
 * get a plain neutral treatment. This is the single place that visual
 * distinction lives, so it can't drift between screens — every AI-DRAFT
 * field in the app (weather, building height, overhead power, material
 * suggestions, drafted paragraphs) should render through this component
 * rather than each screen inventing its own "is this confirmed" styling.
 */
export function ConfirmableChip<T>({ field, render, onConfirm, onReject }: ConfirmableChipProps<T>) {
  if (field.confirmed) {
    return (
      <View style={styles.confirmedRow}>
        <Text style={styles.confirmedText}>{render(field.value)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.draftBox}>
      <Text style={styles.draftLabel}>
        {field.source === "ai-draft" ? "AI suggestion" : field.source === "ocr-gauge" ? "Auto-read from photo" : "Suggested"}
        {" — tap to confirm"}
      </Text>
      <View style={styles.draftRow}>
        <Text style={styles.draftValue}>{render(field.value)}</Text>
        <Pressable onPress={onConfirm} style={styles.confirmBtn}>
          <Text style={styles.confirmBtnText}>Confirm</Text>
        </Pressable>
        {onReject && (
          <Pressable onPress={onReject} style={styles.rejectBtn}>
            <Text style={styles.rejectBtnText}>Edit</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  draftBox: {
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fdba74",
    borderRadius: 8,
    padding: 10,
  },
  draftLabel: { fontSize: 10, color: "#c2410c", fontWeight: "600", marginBottom: 6 },
  draftRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  draftValue: { flex: 1, fontSize: 14, fontWeight: "500", color: "#111114" },
  confirmBtn: { backgroundColor: "#111114", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  confirmBtnText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  rejectBtn: { paddingVertical: 6, paddingHorizontal: 8 },
  rejectBtnText: { color: "#c2410c", fontSize: 11 },
  confirmedRow: { paddingVertical: 4 },
  confirmedText: { fontSize: 14, color: "#111114" },
});
