import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useInspection } from "../state/InspectionContext";
import { YesNoToggle } from "../components/ToggleGroup";
import { ConfirmableYesNo } from "../components/ConfirmableYesNo";
import { PhotoField } from "../components/PhotoField";
import { manual } from "../types/inspection";
import type { PropertyAge, BuildingHeight } from "../types/inspection";

const AGE_OPTIONS: PropertyAge[] = ["1-5", "5-10", "10-20", "20-30", "30-40", "40+"];
const HEIGHT_OPTIONS: { value: BuildingHeight; label: string }[] = [
  { value: "single_storey", label: "Single storey" },
  { value: "double_storey", label: "Double storey" },
  { value: "multi_storey", label: "Multi storey" },
  { value: "other", label: "Other" },
];

export default function RoofAccessScreen() {
  const navigation = useNavigation<any>();
  const { inspection, update } = useInspection();
  const ra = inspection.roofAccess;

  const setField = <K extends keyof typeof ra>(key: K, value: (typeof ra)[K]) =>
    update((draft) => ({ ...draft, roofAccess: { ...draft.roofAccess, [key]: value } }));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Approximate or exact age of property</Text>
      <View style={styles.chipRowWrap}>
        {AGE_OPTIONS.map((age) => (
          <Pressable
            key={age}
            style={[styles.chipSmall, ra.approxPropertyAge === age && styles.chipActive]}
            onPress={() => setField("approxPropertyAge", age)}
          >
            <Text style={[styles.chipTextSmall, ra.approxPropertyAge === age && styles.chipTextActive]}>
              {age} yrs
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Property type</Text>
      <View style={styles.chipRowWrap}>
        {HEIGHT_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            style={[styles.chipSmall, ra.buildingHeight.value === opt.value && styles.chipActive]}
            onPress={() => setField("buildingHeight", manual(opt.value))}
          >
            <Text style={[styles.chipTextSmall, ra.buildingHeight.value === opt.value && styles.chipTextActive]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.dangerBox}>
        <Text style={styles.dangerTitle}>Entering roof space?</Text>
        <Text style={styles.dangerSub}>Power must be isolated at the switchboard, all occupants notified.</Text>
        <YesNoToggle value={ra.enteringRoofSpace} onChange={(v) => setField("enteringRoofSpace", v)} manualOnly />
      </View>

      <Text style={styles.label}>Height greater than 2m? (ladder photo required)</Text>
      <YesNoToggle value={ra.heightGreaterThan2m} onChange={(v) => setField("heightGreaterThan2m", v)} />

      {ra.heightGreaterThan2m && (
        <PhotoField
          label="Ladder access point"
          photos={ra.ladderAccessPhotoUrl ? [ra.ladderAccessPhotoUrl] : []}
          onChange={(photos) => setField("ladderAccessPhotoUrl", photos[photos.length - 1])}
          required
        />
      )}

      <Text style={styles.label}>Roof harness required?</Text>
      <YesNoToggle value={ra.roofHarnessRequired} onChange={(v) => setField("roofHarnessRequired", v)} />

      <Text style={styles.label}>Overhead power present?</Text>
      <ConfirmableYesNo field={ra.overheadPowerPresent} onChange={(f) => setField("overheadPowerPresent", f)} />

      {ra.overheadPowerPresent.confirmed && ra.overheadPowerPresent.value && (
        <PhotoField
          label="Overhead power / OHS measures"
          photos={ra.overheadPowerPhotoUrl ? [ra.overheadPowerPhotoUrl] : []}
          onChange={(photos) => setField("overheadPowerPhotoUrl", photos[photos.length - 1])}
        />
      )}

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
  dangerBox: { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#ef4444", borderRadius: 8, padding: 12, marginBottom: 8, marginTop: 8 },
  dangerTitle: { fontSize: 13, fontWeight: "600", color: "#b91c1c", marginBottom: 4 },
  dangerSub: { fontSize: 11, color: "#b91c1c", marginBottom: 10 },
  label: { fontSize: 12, color: "#8a8a90", marginTop: 8, marginBottom: 6 },
  chipRowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chipSmall: { borderWidth: 1, borderColor: "#d8d8dc", borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12 },
  chipActive: { backgroundColor: "#eef2ff", borderColor: "#6366f1" },
  chipTextSmall: { fontSize: 12 },
  chipTextActive: { fontWeight: "600", color: "#111114" },
  nextBtn: { backgroundColor: "#111114", borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 20 },
  nextBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
