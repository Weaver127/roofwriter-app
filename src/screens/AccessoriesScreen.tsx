import React from "react";
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useInspection } from "../state/InspectionContext";
import { manual } from "../types/inspection";
import { PhotoField } from "../components/PhotoField";
import type { AccessoryType } from "../types/inspection";

/**
 * Reworked per testing feedback: this used to be a generic "add/remove
 * damage line item" repeater. In practice, what assessors actually need
 * at this point is a quick checklist confirming which rooftop services
 * are present (solar, hot water, etc.) — not a blank list they have to
 * populate from scratch. Checking "Yes" creates the underlying Accessory
 * record; unchecking removes it. The data model (Accessory[]) is
 * unchanged — only the interaction pattern is different.
 */
const CHECKLIST: { type: AccessoryType; label: string }[] = [
  { type: "solar_panel", label: "Solar PV panels" },
  { type: "solar_hot_water", label: "Solar hot water system" },
  { type: "skylight", label: "Skylight dome" },
  { type: "whirlybird_ventilator", label: "Whirlybird / roof ventilator" },
  { type: "antenna", label: "TV antenna / satellite dish" },
  { type: "gutter_mesh", label: "Gutter leaf guard / mesh" },
];

export default function AccessoriesScreen() {
  const navigation = useNavigation<any>();
  const { inspection, update } = useInspection();

  const findAccessory = (type: AccessoryType) => inspection.accessories.find((a) => a.type.value === type);

  const toggle = (type: AccessoryType, present: boolean) =>
    update((draft) => {
      if (present) {
        if (draft.accessories.some((a) => a.type.value === type)) return draft;
        return {
          ...draft,
          accessories: [
            ...draft.accessories,
            {
              id: Math.random().toString(36).slice(2),
              type: manual(type),
              quantityAffected: 1,
              unit: "count" as const,
              damageDescription: manual(""),
              requiresSpecialistInspection: type === "solar_panel" || type === "solar_hot_water",
              photoUrls: [],
            },
          ],
        };
      }
      return { ...draft, accessories: draft.accessories.filter((a) => a.type.value !== type) };
    });

  const updateAccessory = (type: AccessoryType, patch: (a: ReturnType<typeof findAccessory>) => any) =>
    update((draft) => ({
      ...draft,
      accessories: draft.accessories.map((a) => (a.type.value === type ? patch(a) : a)),
    }));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.intro}>Confirm which rooftop services are present, then add notes or photos for any of them.</Text>

      {CHECKLIST.map(({ type, label }) => {
        const existing = findAccessory(type);
        const present = !!existing;
        return (
          <View key={type} style={styles.item}>
            <Pressable style={styles.checkRow} onPress={() => toggle(type, !present)}>
              <View style={[styles.checkbox, present && styles.checkboxActive]}>
                {present && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkLabel}>{label}</Text>
            </Pressable>

            {present && existing && (
              <View style={styles.detailBox}>
                {existing.requiresSpecialistInspection && (
                  <Text style={styles.specialistNote}>Requires specialist inspection</Text>
                )}
                <TextInput
                  style={styles.input}
                  placeholder="Notes (condition, damage, etc.)"
                  value={existing.damageDescription.value}
                  onChangeText={(v) =>
                    updateAccessory(type, (a) => ({ ...a, damageDescription: { ...a.damageDescription, value: v } }))
                  }
                />
                <PhotoField
                  label="Photos"
                  photos={existing.photoUrls}
                  onChange={(photos) => updateAccessory(type, (a) => ({ ...a, photoUrls: photos }))}
                />
              </View>
            )}
          </View>
        );
      })}

      <Pressable style={styles.nextBtn} onPress={() => navigation.navigate("ReviewSubmit")}>
        <Text style={styles.nextBtnText}>Next: Review & submit</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16 },
  intro: { fontSize: 12, color: "#8a8a90", marginBottom: 14, lineHeight: 17 },
  item: { marginBottom: 10, borderBottomWidth: 1, borderBottomColor: "#f0f0f0", paddingBottom: 10 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: "#d8d8dc", alignItems: "center", justifyContent: "center" },
  checkboxActive: { backgroundColor: "#111114", borderColor: "#111114" },
  checkmark: { color: "#fff", fontSize: 13, fontWeight: "700" },
  checkLabel: { fontSize: 14 },
  detailBox: { marginLeft: 32, marginTop: 6, gap: 8 },
  specialistNote: { fontSize: 10, color: "#d97706" },
  input: { borderWidth: 1, borderColor: "#d8d8dc", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13 },
  nextBtn: { backgroundColor: "#111114", borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 16 },
  nextBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
