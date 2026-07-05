import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

interface ToggleGroupProps<T extends string> {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  /** Renders the group with a red "manual only" treatment — use for AI-NEVER fields (Section 2/3 causation fields). */
  manualOnly?: boolean;
}

/**
 * The Yes/No (or small-enum) toggle used throughout the app — Outcome,
 * Roof Access safety toggles, Make Safe, Maintenance, etc. Centralizing
 * this means the manualOnly visual treatment (red border, lock icon) is
 * applied consistently everywhere an AI-NEVER field appears, rather than
 * being reimplemented per-screen and risking drift.
 */
export function ToggleGroup<T extends string>({ options, value, onChange, manualOnly }: ToggleGroupProps<T>) {
  return (
    <View style={styles.row}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.option,
              active && (manualOnly ? styles.activeManual : styles.active),
            ]}
          >
            <Text style={[styles.label, active && styles.activeLabel]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function YesNoToggle({
  value,
  onChange,
  manualOnly,
}: {
  value: boolean | null;
  onChange: (value: boolean) => void;
  manualOnly?: boolean;
}) {
  return (
    <ToggleGroup<"yes" | "no">
      options={[
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ]}
      value={value === null ? null : value ? "yes" : "no"}
      onChange={(v) => onChange(v === "yes")}
      manualOnly={manualOnly}
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  option: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d8d8dc",
    alignItems: "center",
  },
  active: { backgroundColor: "#eef2ff", borderColor: "#6366f1" },
  activeManual: { backgroundColor: "#fef2f2", borderColor: "#ef4444" },
  label: { fontSize: 13, color: "#3a3a3f" },
  activeLabel: { fontWeight: "600", color: "#111114" },
});
