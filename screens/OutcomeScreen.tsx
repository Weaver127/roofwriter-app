import React from "react";
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useInspection } from "../state/InspectionContext";
import { YesNoToggle } from "../components/ToggleGroup";
import type { InsurableEventType } from "../types/inspection";

const EVENT_OPTIONS: InsurableEventType[] = ["hail", "heavy_rain_wind", "impact", "collision", "break_and_enter"];

export default function OutcomeScreen() {
  const navigation = useNavigation<any>();
  const { inspection, update } = useInspection();
  const outcome = inspection.outcome;

  const setField = <K extends keyof typeof outcome>(key: K, value: (typeof outcome)[K]) =>
    update((draft) => ({ ...draft, outcome: { ...draft.outcome, [key]: value } }));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.testBox}>
        <Text style={styles.testText}>
          Damage is insurable when the event caused damage that would still have occurred on a properly maintained roof.
        </Text>
      </View>

      <Text style={styles.label}>Is the damage the result of a single cause/event?</Text>
      <YesNoToggle value={outcome.isSingleCauseEvent} onChange={(v) => setField("isSingleCauseEvent", v)} manualOnly />

      <Text style={styles.label}>Event type</Text>
      <View style={styles.chipRowWrap}>
        {EVENT_OPTIONS.map((e) => (
          <Pressable
            key={e}
            style={[styles.chipSmall, outcome.eventType === e && styles.chipActive]}
            onPress={() => setField("eventType", e)}
          >
            <Text style={[styles.chipTextSmall, outcome.eventType === e && styles.chipTextActive]}>
              {e.replace(/_/g, " ")}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Can we proceed with repairs to this damage?</Text>
      <YesNoToggle value={outcome.canProceedWithRepairs} onChange={(v) => setField("canProceedWithRepairs", v)} manualOnly />

      {!outcome.canProceedWithRepairs && (
        <TextInput
          style={styles.textarea}
          placeholder="Reasons why..."
          multiline
          value={outcome.reasonsIfCannotProceed ?? ""}
          onChangeText={(v) => setField("reasonsIfCannotProceed", v)}
        />
      )}

      <Text style={styles.label}>Is the roof compliant with current building guidelines?</Text>
      <YesNoToggle
        value={outcome.isCompliantWithCurrentGuidelines}
        onChange={(v) => setField("isCompliantWithCurrentGuidelines", v)}
        manualOnly
      />

      {!outcome.isCompliantWithCurrentGuidelines && (
        <>
          <TextInput
            style={styles.textarea}
            placeholder="Reasons why (reference relevant code)..."
            multiline
            value={outcome.complianceReasons ?? ""}
            onChangeText={(v) => setField("complianceReasons", v)}
          />
          <Text style={styles.label}>Was it compliant at time of build?</Text>
          <YesNoToggle
            value={outcome.wasCompliantAtTimeOfBuild ?? null}
            onChange={(v) => setField("wasCompliantAtTimeOfBuild", v)}
            manualOnly
          />
        </>
      )}

      <Pressable style={styles.nextBtn} onPress={() => navigation.navigate("Maintenance")}>
        <Text style={styles.nextBtnText}>Next: Maintenance</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16, gap: 4 },
  testBox: { backgroundColor: "#eef2ff", borderWidth: 1, borderColor: "#6366f1", borderRadius: 8, padding: 12, marginBottom: 12 },
  testText: { fontSize: 12, color: "#3730a3", lineHeight: 17 },
  label: { fontSize: 12, color: "#8a8a90", marginTop: 14, marginBottom: 6 },
  chipRowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chipSmall: { borderWidth: 1, borderColor: "#d8d8dc", borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12 },
  chipActive: { backgroundColor: "#eef2ff", borderColor: "#6366f1" },
  chipTextSmall: { fontSize: 12, textTransform: "capitalize" },
  chipTextActive: { fontWeight: "600", color: "#111114" },
  textarea: { borderWidth: 1, borderColor: "#d8d8dc", borderRadius: 8, padding: 10, fontSize: 13, minHeight: 60, marginTop: 6, textAlignVertical: "top" },
  nextBtn: { backgroundColor: "#111114", borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 24 },
  nextBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
