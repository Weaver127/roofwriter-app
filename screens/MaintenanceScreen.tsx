import React from "react";
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useInspection } from "../state/InspectionContext";
import { YesNoToggle } from "../components/ToggleGroup";

export default function MaintenanceScreen() {
  const navigation = useNavigation<any>();
  const { inspection, update } = useInspection();
  const m = inspection.maintenance;

  const setField = <K extends keyof typeof m>(key: K, value: (typeof m)[K]) =>
    update((draft) => ({ ...draft, maintenance: { ...draft.maintenance, [key]: value } }));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.dangerBox}>
        <Text style={styles.dangerTitle}>Maintenance required to prevent further damage</Text>
        <Text style={styles.dangerSub}>Claim-relevant — may block repairs from proceeding until resolved.</Text>
        <YesNoToggle
          value={m.requiredToPreventFurtherDamage}
          onChange={(v) => setField("requiredToPreventFurtherDamage", v)}
          manualOnly
        />
        {m.requiredToPreventFurtherDamage && (
          <TextInput
            style={styles.textarea}
            placeholder="Describe what's required..."
            multiline
            value={m.requiredDescription ?? ""}
            onChangeText={(v) => setField("requiredDescription", v)}
          />
        )}
      </View>

      <View style={styles.neutralBox}>
        <Text style={styles.neutralTitle}>Maintenance recommended for the future</Text>
        <Text style={styles.neutralSub}>Advisory only — not claim-related, doesn't block anything.</Text>
        <YesNoToggle value={m.recommendedForFutureDamage} onChange={(v) => setField("recommendedForFutureDamage", v)} />
        {m.recommendedForFutureDamage && (
          <TextInput
            style={styles.textarea}
            placeholder="Describe what's recommended..."
            multiline
            value={m.recommendedDescription ?? ""}
            onChangeText={(v) => setField("recommendedDescription", v)}
          />
        )}
      </View>

      <Pressable style={styles.nextBtn} onPress={() => navigation.navigate("Findings")}>
        <Text style={styles.nextBtnText}>Next: Findings</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16, gap: 12 },
  dangerBox: { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#ef4444", borderRadius: 8, padding: 12 },
  dangerTitle: { fontSize: 13, fontWeight: "600", color: "#b91c1c", marginBottom: 4 },
  dangerSub: { fontSize: 11, color: "#b91c1c", marginBottom: 10 },
  neutralBox: { backgroundColor: "#f7f7f8", borderWidth: 1, borderColor: "#d8d8dc", borderRadius: 8, padding: 12 },
  neutralTitle: { fontSize: 13, fontWeight: "600", marginBottom: 4 },
  neutralSub: { fontSize: 11, color: "#8a8a90", marginBottom: 10 },
  textarea: { borderWidth: 1, borderColor: "#d8d8dc", borderRadius: 8, padding: 10, fontSize: 13, minHeight: 60, marginTop: 8, backgroundColor: "#fff", textAlignVertical: "top" },
  nextBtn: { backgroundColor: "#111114", borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  nextBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
