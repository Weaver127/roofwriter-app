import React from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useInspection } from "../state/InspectionContext";
import { manual } from "../types/inspection";
import type { AccessoryType } from "../types/inspection";

const LABELS: Record<AccessoryType, string> = {
  skylight: "Skylight dome",
  whirlybird_ventilator: "Whirlybird ventilator",
  solar_panel: "Solar panel",
  gutter_mesh: "Gutter mesh",
  flashing_dektite: "Flashing / dektite",
  ridge_capping: "Ridge capping",
  antenna: "Antenna",
  other: "Other",
};

export default function AccessoriesScreen() {
  const navigation = useNavigation<any>();
  const { inspection, update } = useInspection();

  const addAccessory = () =>
    update((draft) => ({
      ...draft,
      accessories: [
        ...draft.accessories,
        {
          id: Math.random().toString(36).slice(2),
          type: manual<AccessoryType>("other"),
          quantityAffected: 1,
          unit: "count" as const,
          damageDescription: manual(""),
          requiresSpecialistInspection: false,
          photoUrls: [],
        },
      ],
    }));

  const removeAccessory = (id: string) =>
    update((draft) => ({ ...draft, accessories: draft.accessories.filter((a) => a.id !== id) }));

  return (
    <View style={styles.screen}>
      <FlatList
        contentContainerStyle={styles.list}
        data={inspection.accessories}
        keyExtractor={(a) => a.id}
        ListEmptyComponent={<Text style={styles.empty}>No accessories added yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.cardTitle}>{LABELS[item.type.value]}</Text>
              <Text style={styles.cardQty}>
                {item.quantityAffected}
                {item.unit === "linear_metres" ? "Lm" : "x"}
              </Text>
            </View>
            <Text style={styles.cardDesc}>{item.damageDescription.value || "Add description"}</Text>
            {item.requiresSpecialistInspection && (
              <Text style={styles.specialistNote}>Requires specialist inspection</Text>
            )}
            <Pressable onPress={() => removeAccessory(item.id)} style={styles.removeBtn}>
              <Text style={styles.removeBtnText}>Remove</Text>
            </Pressable>
          </View>
        )}
      />
      <Pressable style={styles.addBtn} onPress={addAccessory}>
        <Text style={styles.addBtnText}>+ Add accessory</Text>
      </Pressable>
      <Pressable style={styles.nextBtn} onPress={() => navigation.navigate("ReviewSubmit")}>
        <Text style={styles.nextBtnText}>Next: Review & submit</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff", padding: 16 },
  list: { gap: 8 },
  empty: { fontSize: 13, color: "#8a8a90", textAlign: "center", marginTop: 20 },
  card: { backgroundColor: "#f7f7f8", borderRadius: 8, padding: 12 },
  cardRow: { flexDirection: "row", justifyContent: "space-between" },
  cardTitle: { fontSize: 13, fontWeight: "600" },
  cardQty: { fontSize: 12, color: "#8a8a90" },
  cardDesc: { fontSize: 12, color: "#5a5a60", marginTop: 4 },
  specialistNote: { fontSize: 10, color: "#d97706", marginTop: 6 },
  removeBtn: { alignSelf: "flex-start", marginTop: 8 },
  removeBtnText: { fontSize: 11, color: "#b91c1c" },
  addBtn: { borderWidth: 1, borderColor: "#d8d8dc", borderStyle: "dashed", borderRadius: 8, paddingVertical: 12, alignItems: "center", marginTop: 12 },
  addBtnText: { fontSize: 13, color: "#111114" },
  nextBtn: { backgroundColor: "#111114", borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 12 },
  nextBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
