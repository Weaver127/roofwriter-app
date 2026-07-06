import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useInspection } from "../state/InspectionContext";
import { SignaturePad } from "../components/SignaturePad";
import { INSPECTION_DISCLAIMER } from "../constants/disclaimer";

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

/**
 * This is the actual "what does the finished report look like" view —
 * previously missing entirely. Review & Submit (the QA/flagged-items
 * screen) checks completeness; this screen is what a reader (insurer,
 * homeowner, agent) would actually see. Reachable only once QA is clean,
 * enforced by ReviewSubmitScreen.
 */
export default function ReportPreviewScreen() {
  const navigation = useNavigation<any>();
  const { inspection, update } = useInspection();
  const [signed, setSigned] = useState(false);

  const jd = inspection.jobDetails;
  const ra = inspection.roofAccess;
  const f = inspection.findings;

  const handleSubmit = () => {
    if (!signed) {
      Alert.alert("Signature required", "Please sign before submitting the report.");
      return;
    }
    update((draft) => ({ ...draft, status: "complete", signedAt: new Date().toISOString() }));
    Alert.alert("Report submitted", "This inspection has been marked complete.");
    navigation.navigate("JobDetails");
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.reportTitle}>Roof Inspection Report</Text>
      <Text style={styles.reportSub}>{jd.siteAddress || "Address not entered"}</Text>

      <SectionTitle>Job details</SectionTitle>
      <Row label="Claim number" value={jd.claimNumber ?? ""} />
      <Row label="Roofing business" value={jd.roofingBusinessName} />
      <Row label="Assessor" value={jd.assessorName} />
      <Row label="Homeowner / rep" value={jd.homeownerRepName ?? ""} />
      <Row label="Inspection date" value={jd.inspectionDate} />
      <Row label="Weather" value={jd.weather.value} />

      <SectionTitle>Roof access</SectionTitle>
      <Row label="Property age" value={ra.approxPropertyAge} />
      <Row label="Property type" value={ra.buildingHeight.value.replace(/_/g, " ")} />
      <Row label="Overhead power present" value={ra.overheadPowerPresent.value ? "Yes" : "No"} />

      <SectionTitle>Roof areas</SectionTitle>
      {inspection.roofAreas.map((area, i) => (
        <View key={area.id} style={styles.areaBlock}>
          <Text style={styles.areaTitle}>{area.label || area.roofType.value || `Roof area ${i + 1}`}</Text>
          <Row label="Material" value={area.materialSecondary.value.replace(/_/g, " ")} />
          <Row label="Pitch" value={area.pitchDegrees.confirmed ? `${area.pitchDegrees.value}°` : "Not recorded"} />
          <Row label="Pitch compliance" value={area.pitchCompliance.message} />
          <Row label="Event type" value={area.eventType.replace(/_/g, " ")} />
          {area.eventType === "hail" && (
            <Row label="Hail damage %" value={area.hailDamagePercent !== undefined ? `${area.hailDamagePercent}%` : "Not recorded"} />
          )}
          <Row label="Outcome" value={area.outcome.replace(/_/g, " ")} />
        </View>
      ))}

      <SectionTitle>Outcome</SectionTitle>
      <Row label="Event type" value={inspection.outcome.eventType.replace(/_/g, " ")} />
      <Row label="Can proceed with repairs" value={inspection.outcome.canProceedWithRepairs ? "Yes" : "No"} />
      {!inspection.outcome.canProceedWithRepairs && (
        <Row label="Reasons" value={inspection.outcome.reasonsIfCannotProceed ?? ""} />
      )}

      <SectionTitle>Findings</SectionTitle>
      <Row label="Overall condition" value={f.overallRoofCondition} />
      <Row label="Insurable external damage" value={f.insurableExternalDamageSummary.value} />
      <Row label="Cause of damage" value={f.whatCausedTheDamage} />
      <Row label="Internal damage" value={f.internalDamageSummary.value} />
      <Row label="Recommendations" value={f.recommendations} />

      <SectionTitle>Make safe</SectionTitle>
      <Row label="Conducted" value={inspection.makeSafe.conducted ? "Yes" : "No"} />
      <Row label="Still needed" value={inspection.makeSafe.stillNeeded ? "Yes" : "No"} />

      {inspection.accessories.length > 0 && (
        <>
          <SectionTitle>Roof-top services</SectionTitle>
          {inspection.accessories.map((a) => (
            <Row key={a.id} label={a.type.value.replace(/_/g, " ")} value={a.damageDescription.value || "Present"} />
          ))}
        </>
      )}

      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerText}>{INSPECTION_DISCLAIMER}</Text>
      </View>

      <SectionTitle>Sign & date</SectionTitle>
      <SignaturePad onChange={setSigned} />
      <Text style={styles.dateText}>{new Date().toLocaleString()}</Text>

      <Pressable style={[styles.submitBtn, !signed && styles.submitBtnDisabled]} onPress={handleSubmit}>
        <Text style={styles.submitBtnText}>{signed ? "Submit report" : "Sign above to submit"}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16, paddingBottom: 40 },
  reportTitle: { fontSize: 20, fontWeight: "700", marginBottom: 2 },
  reportSub: { fontSize: 13, color: "#8a8a90", marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4, color: "#111114", marginTop: 18, marginBottom: 8, borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 14 },
  row: { flexDirection: "row", marginBottom: 6 },
  rowLabel: { fontSize: 12, color: "#8a8a90", width: 140 },
  rowValue: { fontSize: 12, color: "#111114", flex: 1, textTransform: "capitalize" },
  areaBlock: { backgroundColor: "#f7f7f8", borderRadius: 8, padding: 10, marginBottom: 8 },
  areaTitle: { fontSize: 13, fontWeight: "600", marginBottom: 6, textTransform: "capitalize" },
  disclaimerBox: { backgroundColor: "#f7f7f8", borderRadius: 8, padding: 12, marginTop: 20 },
  disclaimerText: { fontSize: 10, color: "#5a5a60", lineHeight: 15 },
  dateText: { fontSize: 11, color: "#8a8a90", marginTop: 6 },
  submitBtn: { backgroundColor: "#111114", borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 20 },
  submitBtnDisabled: { backgroundColor: "#d8d8dc" },
  submitBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
