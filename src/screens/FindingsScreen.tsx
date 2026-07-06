import React from "react";
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useInspection } from "../state/InspectionContext";
import { PhotoField } from "../components/PhotoField";
import { YesNoToggle } from "../components/ToggleGroup";
import type { OverallRoofCondition } from "../types/inspection";

const CONDITIONS: OverallRoofCondition[] = ["poor", "fair", "good", "excellent"];

export default function FindingsScreen() {
  const navigation = useNavigation<any>();
  const { inspection, update } = useInspection();
  const f = inspection.findings;

  const setField = <K extends keyof typeof f>(key: K, value: (typeof f)[K]) =>
    update((draft) => ({ ...draft, findings: { ...draft.findings, [key]: value } }));

  const draft = f.insurableExternalDamageSummary;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Overall roof condition</Text>
      <View style={styles.chipRow}>
        {CONDITIONS.map((c) => (
          <Pressable
            key={c}
            style={[styles.chip, f.overallRoofCondition === c && styles.chipActive]}
            onPress={() => setField("overallRoofCondition", c)}
          >
            <Text style={[styles.chipText, f.overallRoofCondition === c && styles.chipTextActive]}>{c}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionHeader}>External</Text>

      <Text style={styles.label}>Insurable external damage</Text>
      {!draft.confirmed && draft.value ? (
        <View style={styles.draftBox}>
          <Text style={styles.draftLabel}>AI-drafted from tagged photos — review before accepting</Text>
          <TextInput
            style={styles.draftTextArea}
            multiline
            value={draft.value}
            onChangeText={(v) => setField("insurableExternalDamageSummary", { ...draft, value: v })}
          />
          <Pressable
            style={styles.confirmBtn}
            onPress={() =>
              setField("insurableExternalDamageSummary", { ...draft, confirmed: true, confirmedAt: new Date().toISOString() })
            }
          >
            <Text style={styles.confirmBtnText}>Accept</Text>
          </Pressable>
        </View>
      ) : (
        <TextInput
          style={styles.textarea}
          multiline
          placeholder="Describe insurable external damage..."
          value={draft.value}
          onChangeText={(v) => setField("insurableExternalDamageSummary", { value: v, source: "manual", confirmed: true })}
        />
      )}

      <PhotoField
        label="External damage photos"
        photos={f.externalDamagePhotoUrls}
        onChange={(photos) => setField("externalDamagePhotoUrls", photos)}
      />

      <Text style={styles.labelManual}>What caused that damage? — manual, specific cause</Text>
      <TextInput
        style={styles.textarea}
        multiline
        placeholder="Please provide specifically what the specific cause was..."
        value={f.whatCausedTheDamage}
        onChangeText={(v) => setField("whatCausedTheDamage", v)}
      />

      <Text style={styles.sectionHeader}>Internal</Text>

      <Text style={styles.label}>Is there damage as a result of water entry through the roof?</Text>
      <YesNoToggle value={f.waterEntryThroughRoof} onChange={(v) => setField("waterEntryThroughRoof", v)} />

      <Text style={styles.label}>Internal damage summary</Text>
      <TextInput
        style={styles.textarea}
        multiline
        placeholder="Describe internal damage (staining, water marks, etc.)..."
        value={f.internalDamageSummary.value}
        onChangeText={(v) => setField("internalDamageSummary", { value: v, source: "manual", confirmed: true })}
      />

      <PhotoField
        label="Internal damage photos"
        photos={f.internalDamagePhotoUrls}
        onChange={(photos) => setField("internalDamagePhotoUrls", photos)}
      />

      <Text style={styles.label}>Works required before internal repair?</Text>
      <YesNoToggle
        value={f.worksRequiredBeforeInternalRepair}
        onChange={(v) => setField("worksRequiredBeforeInternalRepair", v)}
      />
      {f.worksRequiredBeforeInternalRepair && (
        <TextInput
          style={styles.textarea}
          multiline
          placeholder="Details of required prior works..."
          value={f.detailsOfRequiredPriorWorks?.value ?? ""}
          onChangeText={(v) => setField("detailsOfRequiredPriorWorks", { value: v, source: "manual", confirmed: true })}
        />
      )}

      <Text style={styles.sectionHeader}>Conclusion</Text>

      <Text style={styles.label}>Recommendations</Text>
      <TextInput
        style={styles.textarea}
        multiline
        placeholder="Recommendations..."
        value={f.recommendations}
        onChangeText={(v) => setField("recommendations", v)}
      />

      <Pressable style={styles.nextBtn} onPress={() => navigation.navigate("MakeSafe")}>
        <Text style={styles.nextBtnText}>Next: Make safe</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16, gap: 4 },
  sectionHeader: { fontSize: 11, fontWeight: "700", color: "#111114", textTransform: "uppercase", letterSpacing: 0.4, marginTop: 20, marginBottom: 4, borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 14 },
  label: { fontSize: 12, color: "#8a8a90", marginTop: 14, marginBottom: 6 },
  labelManual: { fontSize: 12, color: "#b91c1c", marginTop: 14, marginBottom: 6 },
  chipRow: { flexDirection: "row", gap: 8 },
  chip: { flex: 1, borderWidth: 1, borderColor: "#d8d8dc", borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  chipActive: { backgroundColor: "#eef2ff", borderColor: "#6366f1" },
  chipText: { fontSize: 12, textTransform: "capitalize" },
  chipTextActive: { fontWeight: "600", color: "#111114" },
  draftBox: { backgroundColor: "#fff7ed", borderWidth: 1, borderColor: "#fdba74", borderRadius: 8, padding: 10 },
  draftLabel: { fontSize: 10, color: "#c2410c", fontWeight: "600", marginBottom: 6 },
  draftTextArea: { fontSize: 13, lineHeight: 19, minHeight: 80, textAlignVertical: "top" },
  confirmBtn: { backgroundColor: "#111114", borderRadius: 6, paddingVertical: 8, alignItems: "center", marginTop: 8 },
  confirmBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  textarea: { borderWidth: 1, borderColor: "#d8d8dc", borderRadius: 8, padding: 10, fontSize: 13, minHeight: 70, textAlignVertical: "top" },
  nextBtn: { backgroundColor: "#111114", borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 20 },
  nextBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
