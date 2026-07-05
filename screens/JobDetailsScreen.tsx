import React from "react";
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useInspection } from "../state/InspectionContext";
import { ConfirmableChip } from "../components/ConfirmableChip";

export default function JobDetailsScreen() {
  const navigation = useNavigation<any>();
  const { inspection, update } = useInspection();
  const jd = inspection.jobDetails;

  const setField = <K extends keyof typeof jd>(key: K, value: (typeof jd)[K]) =>
    update((draft) => ({ ...draft, jobDetails: { ...draft.jobDetails, [key]: value } }));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>References</Text>
      <View style={styles.row2}>
        <TextInput
          style={[styles.input, styles.flex1]}
          placeholder="Claim number"
          value={jd.claimNumber ?? ""}
          onChangeText={(v) => setField("claimNumber", v)}
        />
        <TextInput
          style={[styles.input, styles.flex1]}
          placeholder="Contractor ref."
          value={jd.contractorReference ?? ""}
          onChangeText={(v) => setField("contractorReference", v)}
        />
      </View>

      <Text style={styles.sectionLabel}>Roofer & assessor</Text>
      <TextInput
        style={styles.input}
        placeholder="Roofing business name"
        value={jd.roofingBusinessName}
        onChangeText={(v) => setField("roofingBusinessName", v)}
      />
      <View style={styles.row2}>
        <TextInput
          style={[styles.input, styles.flex1]}
          placeholder="ABN"
          value={jd.abn}
          onChangeText={(v) => setField("abn", v)}
        />
        <TextInput
          style={[styles.input, styles.flex1]}
          placeholder="Licence no. (optional)"
          value={jd.licenceNumber ?? ""}
          onChangeText={(v) => setField("licenceNumber", v)}
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Name of roof assessor"
        value={jd.assessorName}
        onChangeText={(v) => setField("assessorName", v)}
      />

      <Text style={styles.sectionLabel}>Customer & site</Text>
      <TextInput
        style={styles.input}
        placeholder="Homeowner / rep name"
        value={jd.homeownerRepName ?? ""}
        onChangeText={(v) => setField("homeownerRepName", v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Site address"
        value={jd.siteAddress}
        onChangeText={(v) => setField("siteAddress", v)}
      />

      <Text style={styles.sectionLabel}>Conditions</Text>
      <ConfirmableChip
        field={jd.weather}
        render={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
        onConfirm={() => setField("weather", { ...jd.weather, confirmed: true, confirmedAt: new Date().toISOString() })}
      />

      <Pressable style={styles.nextBtn} onPress={() => navigation.navigate("RoofAccess")}>
        <Text style={styles.nextBtnText}>Next: Roof access</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16, gap: 8 },
  sectionLabel: { fontSize: 11, fontWeight: "600", color: "#8a8a90", textTransform: "uppercase", letterSpacing: 0.3, marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: "#d8d8dc", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  row2: { flexDirection: "row", gap: 8 },
  flex1: { flex: 1 },
  nextBtn: { backgroundColor: "#111114", borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 20 },
  nextBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
