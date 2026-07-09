import React from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useInspection } from "../state/InspectionContext";

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { inspections, loadingSavedReports, startNewInspection, loadInspection, deleteInspection } = useInspection();

  const openNew = () => {
    startNewInspection();
    navigation.navigate("JobDetails");
  };

  const openExisting = (id: string) => {
    loadInspection(id);
    navigation.navigate("JobDetails");
  };

  const sorted = [...inspections].sort((a, b) => (b.jobDetails.inspectionDate ?? "").localeCompare(a.jobDetails.inspectionDate ?? ""));

  if (loadingSavedReports) {
    return (
      <View style={styles.screen}>
        <Text style={styles.loadingText}>Loading saved reports…</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        contentContainerStyle={styles.list}
        data={sorted}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={<Text style={styles.empty}>No reports yet — tap "+ New inspection" below to start.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Pressable style={styles.cardMain} onPress={() => openExisting(item.id)}>
              <Text style={styles.cardTitle}>{item.jobDetails.siteAddress || "(no address entered)"}</Text>
              <Text style={styles.cardSub}>
                {item.jobDetails.inspectionDate} · {item.status === "complete" ? "Complete" : "Draft"}
              </Text>
            </Pressable>
            <Pressable style={styles.deleteBtn} onPress={() => deleteInspection(item.id)}>
              <Text style={styles.deleteBtnText}>Delete</Text>
            </Pressable>
          </View>
        )}
      />
      <Pressable style={styles.newBtn} onPress={openNew}>
        <Text style={styles.newBtnText}>+ New inspection</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff", padding: 16 },
  loadingText: { fontSize: 13, color: "#8a8a90", textAlign: "center", marginTop: 40 },
  list: { gap: 8, flexGrow: 1 },
  empty: { fontSize: 13, color: "#8a8a90", textAlign: "center", marginTop: 40 },
  card: { backgroundColor: "#f7f7f8", borderRadius: 8, padding: 12, flexDirection: "row", alignItems: "center" },
  cardMain: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: "600" },
  cardSub: { fontSize: 11, color: "#8a8a90", marginTop: 2, textTransform: "capitalize" },
  deleteBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  deleteBtnText: { fontSize: 11, color: "#b91c1c" },
  newBtn: { backgroundColor: "#111114", borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 12 },
  newBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
