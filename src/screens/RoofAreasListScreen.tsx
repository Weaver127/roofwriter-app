import React from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useInspection } from "../state/InspectionContext";
import type { RoofArea } from "../types/inspection";

const tierColor: Record<string, string> = {
  compliant: "#16a34a",
  enquiry_only: "#d97706",
  non_compliant: "#dc2626",
  no_minimum: "#8a8a90",
};

function summaryLine(area: RoofArea): string {
  if (!area.materialSecondary.confirmed || !area.pitchDegrees.confirmed) return "Material and pitch not yet entered";
  return `${area.materialSecondary.value.replace(/_/g, " ")} · ${area.pitchDegrees.value}°`;
}

export default function RoofAreasListScreen() {
  const navigation = useNavigation<any>();
  const { inspection, addRoofArea, duplicateRoofArea, removeRoofArea } = useInspection();

  const complete = inspection.roofAreas.filter((a) => a.materialSecondary.confirmed && a.pitchDegrees.confirmed).length;

  return (
    <View style={styles.screen}>
      <Text style={styles.completion}>{complete} of {inspection.roofAreas.length} complete</Text>
      <FlatList
        contentContainerStyle={styles.list}
        data={inspection.roofAreas}
        keyExtractor={(a) => a.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Pressable onPress={() => navigation.navigate("RoofAreaDetail", { roofAreaId: item.id })}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.roofType.value}</Text>
                <Text style={[styles.tierLabel, { color: tierColor[item.pitchCompliance.tier] }]}>
                  {item.pitchCompliance.tier.replace(/_/g, " ")}
                </Text>
              </View>
              <Text style={styles.cardSub}>{summaryLine(item)}</Text>
            </Pressable>
            <View style={styles.cardActions}>
              <Pressable style={styles.actionBtn} onPress={() => duplicateRoofArea(item.id)}>
                <Text style={styles.actionBtnText}>Duplicate</Text>
              </Pressable>
              <Pressable style={styles.actionBtn} onPress={() => removeRoofArea(item.id)}>
                <Text style={styles.actionBtnText}>Remove</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
      <Pressable style={styles.addBtn} onPress={addRoofArea}>
        <Text style={styles.addBtnText}>+ Add roof area</Text>
      </Pressable>
      <Pressable style={styles.nextBtn} onPress={() => navigation.navigate("Outcome")}>
        <Text style={styles.nextBtnText}>Next: Outcome</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff", padding: 16 },
  completion: { fontSize: 12, color: "#8a8a90", marginBottom: 8 },
  list: { gap: 8 },
  card: { backgroundColor: "#f7f7f8", borderRadius: 8, padding: 12 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  cardTitle: { fontSize: 14, fontWeight: "600", textTransform: "capitalize" },
  tierLabel: { fontSize: 10, fontWeight: "600", textTransform: "capitalize" },
  cardSub: { fontSize: 12, color: "#8a8a90", textTransform: "capitalize" },
  cardActions: { flexDirection: "row", gap: 8, marginTop: 8 },
  actionBtn: { flex: 1, borderWidth: 1, borderColor: "#d8d8dc", borderRadius: 6, paddingVertical: 6, alignItems: "center" },
  actionBtnText: { fontSize: 11 },
  addBtn: { borderWidth: 1, borderColor: "#d8d8dc", borderStyle: "dashed", borderRadius: 8, paddingVertical: 12, alignItems: "center", marginTop: 12 },
  addBtnText: { fontSize: 13, color: "#111114" },
  nextBtn: { backgroundColor: "#111114", borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 12 },
  nextBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
