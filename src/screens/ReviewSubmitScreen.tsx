import React, { useMemo } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useInspection } from "../state/InspectionContext";
import { computeQASummary } from "../lib/qa";

const severityStyle: Record<string, { bg: string; border: string; text: string }> = {
  error: { bg: "#fef2f2", border: "#ef4444", text: "#b91c1c" },
  warning: { bg: "#fffbeb", border: "#d97706", text: "#92400e" },
};

export default function ReviewSubmitScreen() {
  const navigation = useNavigation<any>();
  const { inspection } = useInspection();

  // Real call to the same computeQASummary() used by the API scaffold's
  // GET /inspections/:id/qa route — this is the actual Section 4 logic,
  // not a mockup restating what it would do.
  const qa = useMemo(() => computeQASummary(inspection), [inspection]);

  const errorCount = qa.flaggedItems.filter((f) => f.severity === "error").length;
  const canSubmit = errorCount === 0;

  return (
    <View style={styles.screen}>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{qa.score.complete}/{qa.score.total}</Text>
          <Text style={styles.statLabel}>Score</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: errorCount > 0 ? "#b91c1c" : "#111114" }]}>
            {qa.flaggedItems.length}
          </Text>
          <Text style={styles.statLabel}>Flagged items</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{inspection.actions.filter((a) => !a.resolved).length}</Text>
          <Text style={styles.statLabel}>Actions</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Flagged items</Text>
      <FlatList
        contentContainerStyle={styles.list}
        data={qa.flaggedItems}
        keyExtractor={(f) => f.id}
        ListEmptyComponent={<Text style={styles.empty}>No flagged items — ready to submit.</Text>}
        renderItem={({ item }) => {
          const s = severityStyle[item.severity];
          return (
            <View style={[styles.flagCard, { backgroundColor: s.bg, borderColor: s.border }]}>
              <Text style={[styles.flagText, { color: s.text }]}>{item.message}</Text>
            </View>
          );
        }}
      />

      <Pressable
        disabled={!canSubmit}
        style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
        onPress={() => navigation.navigate("ReportPreview")}
      >
        <Text style={styles.submitBtnText}>{canSubmit ? "Preview & sign report" : `Resolve ${errorCount} error(s) to continue`}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff", padding: 16 },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: "#f7f7f8", borderRadius: 8, padding: 10, alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "600" },
  statLabel: { fontSize: 10, color: "#8a8a90", marginTop: 2 },
  sectionLabel: { fontSize: 11, fontWeight: "600", color: "#8a8a90", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 8 },
  list: { gap: 8, flexGrow: 1 },
  empty: { fontSize: 13, color: "#8a8a90", textAlign: "center", marginTop: 20 },
  flagCard: { borderWidth: 1, borderRadius: 8, padding: 10 },
  flagText: { fontSize: 12, lineHeight: 17 },
  submitBtn: { backgroundColor: "#111114", borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 12 },
  submitBtnDisabled: { backgroundColor: "#d8d8dc" },
  submitBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
