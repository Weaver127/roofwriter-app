import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useInspection } from "../state/InspectionContext";
import { YesNoToggle } from "../components/ToggleGroup";
import { ConfirmableChip } from "../components/ConfirmableChip";

export default function RoofAccessScreen() {
  const navigation = useNavigation<any>();
  const { inspection, update } = useInspection();
  const ra = inspection.roofAccess;

  const setField = <K extends keyof typeof ra>(key: K, value: (typeof ra)[K]) =>
    update((draft) => ({ ...draft, roofAccess: { ...draft.roofAccess, [key]: value } }));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.dangerBox}>
        <Text style={styles.dangerTitle}>Entering roof space?</Text>
        <Text style={styles.dangerSub}>Power must be isolated at the switchboard, all occupants notified.</Text>
        <YesNoToggle value={ra.enteringRoofSpace} onChange={(v) => setField("enteringRoofSpace", v)} manualOnly />
      </View>

      <Text style={styles.label}>Height greater than 2m? (ladder photo required)</Text>
      <YesNoToggle value={ra.heightGreaterThan2m} onChange={(v) => setField("heightGreaterThan2m", v)} />

      <Text style={styles.label}>Roof harness required?</Text>
      <YesNoToggle value={ra.roofHarnessRequired} onChange={(v) => setField("roofHarnessRequired", v)} />

      <Text style={styles.label}>Overhead power present?</Text>
      <ConfirmableChip
        field={ra.overheadPowerPresent}
        render={(v) => (v ? "Yes" : "No")}
        onConfirm={() =>
          setField("overheadPowerPresent", { ...ra.overheadPowerPresent, confirmed: true, confirmedAt: new Date().toISOString() })
        }
      />

      <Text style={styles.label}>Edge protection or scaffold required?</Text>
      <YesNoToggle
        value={ra.edgeProtectionOrScaffoldRequired}
        onChange={(v) => setField("edgeProtectionOrScaffoldRequired", v)}
      />

      <Pressable style={styles.nextBtn} onPress={() => navigation.navigate("RoofAreasList")}>
        <Text style={styles.nextBtnText}>Next: Roof areas</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16, gap: 10 },
  dangerBox: { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#ef4444", borderRadius: 8, padding: 12, marginBottom: 8 },
  dangerTitle: { fontSize: 13, fontWeight: "600", color: "#b91c1c", marginBottom: 4 },
  dangerSub: { fontSize: 11, color: "#b91c1c", marginBottom: 10 },
  label: { fontSize: 12, color: "#8a8a90", marginTop: 8, marginBottom: 2 },
  nextBtn: { backgroundColor: "#111114", borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 20 },
  nextBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
