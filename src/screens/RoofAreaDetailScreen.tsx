import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useInspection } from "../state/InspectionContext";
import { manual } from "../types/inspection";
import { PhotoField } from "../components/PhotoField";
import { AnalyzablePhotoField } from "../components/AnalyzablePhotoField";
import type { MaterialPrimary, MaterialSecondary, InsurableEventType } from "../types/inspection";

const METAL_OPTIONS: MaterialSecondary[] = [
  "custom_orb", "trimdek", "klip_lok_700_hs", "klip_lok_406", "spandek", "longline_305", "other_metal",
];
const TILE_OPTIONS: MaterialSecondary[] = ["concrete", "terracotta", "slate", "other_tile"];
const POLY_OPTIONS: MaterialSecondary[] = ["greca", "corrugated", "five_rib_trimclad", "twinwall_multiwall", "other_poly"];

const EVENT_OPTIONS: InsurableEventType[] = ["hail", "heavy_rain_wind", "impact", "collision", "break_and_enter", "none"];

const tierColor: Record<string, { bg: string; border: string; text: string }> = {
  compliant: { bg: "#f0fdf4", border: "#16a34a", text: "#166534" },
  enquiry_only: { bg: "#fffbeb", border: "#d97706", text: "#92400e" },
  non_compliant: { bg: "#fef2f2", border: "#dc2626", text: "#991b1b" },
  no_minimum: { bg: "#f7f7f8", border: "#d8d8dc", text: "#5a5a60" },
};

function optionsFor(primary: MaterialPrimary): MaterialSecondary[] {
  if (primary === "metal") return METAL_OPTIONS;
  if (primary === "tile") return TILE_OPTIONS;
  return POLY_OPTIONS;
}

export default function RoofAreaDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { roofAreaId } = route.params;
  const { inspection, updateRoofArea, update } = useInspection();

  const area = inspection.roofAreas.find((a) => a.id === roofAreaId);

  const [pitchText, setPitchText] = useState(area?.pitchDegrees.confirmed ? String(area.pitchDegrees.value) : "");
  const [labelText, setLabelText] = useState(area?.label ?? "");

  useEffect(() => {
    if (area?.pitchDegrees.confirmed) setPitchText(String(area.pitchDegrees.value));
  }, [area?.id]);

  if (!area) return null;

  const setPrimary = (primary: MaterialPrimary) =>
    updateRoofArea(roofAreaId, (a) => ({
      ...a,
      materialPrimary: manual(primary),
      materialSecondary: manual(optionsFor(primary)[0]),
    }));

  const setSecondary = (secondary: MaterialSecondary) =>
    updateRoofArea(roofAreaId, (a) => ({ ...a, materialSecondary: manual(secondary) }));

  const handlePitchChange = (text: string) => {
    setPitchText(text);
    const num = parseFloat(text);
    if (!isNaN(num)) {
      updateRoofArea(roofAreaId, (a) => ({ ...a, pitchDegrees: manual(num) }));
    }
  };

  const handleLabelChange = (text: string) => {
    setLabelText(text);
    updateRoofArea(roofAreaId, (a) => ({ ...a, label: text }));
  };

  const setEventType = (eventType: InsurableEventType) =>
    updateRoofArea(roofAreaId, (a) => ({ ...a, eventType }));

  const setHailPercent = (text: string) => {
    const num = parseInt(text, 10);
    updateRoofArea(roofAreaId, (a) => ({ ...a, hailDamagePercent: isNaN(num) ? undefined : num }));
  };

  const tier = tierColor[area.pitchCompliance.tier];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Area name (e.g. "Main house", "Rear shed")</Text>
      <TextInput
        style={styles.input}
        placeholder="Optional label for this roof area"
        value={labelText}
        onChangeText={handleLabelChange}
      />

      <Text style={styles.label}>Material — primary</Text>
      <View style={styles.chipRow}>
        {(["metal", "tile", "polycarbonate"] as MaterialPrimary[]).map((p) => (
          <Pressable
            key={p}
            style={[styles.chip, area.materialPrimary.value === p && styles.chipActive]}
            onPress={() => setPrimary(p)}
          >
            <Text style={[styles.chipText, area.materialPrimary.value === p && styles.chipTextActive]}>{p}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Material — secondary</Text>
      <View style={styles.chipRowWrap}>
        {optionsFor(area.materialPrimary.value).map((s) => (
          <Pressable
            key={s}
            style={[styles.chipSmall, area.materialSecondary.value === s && styles.chipActive]}
            onPress={() => setSecondary(s)}
          >
            <Text style={[styles.chipTextSmall, area.materialSecondary.value === s && styles.chipTextActive]}>
              {s.replace(/_/g, " ")}
            </Text>
          </Pressable>
        ))}
      </View>

      {area.materialPrimary.value === "tile" && (
        <PhotoField
          label="Back-of-tile photo"
          photos={area.materialPhotoUrl ? [area.materialPhotoUrl] : []}
          onChange={(photos) => updateRoofArea(roofAreaId, (a) => ({ ...a, materialPhotoUrl: photos[photos.length - 1] }))}
          required
        />
      )}

      <Text style={styles.label}>Pitch (degrees)</Text>
      <TextInput
        style={styles.input}
        keyboardType="decimal-pad"
        placeholder="e.g. 22.5"
        value={pitchText}
        onChangeText={handlePitchChange}
      />

      {area.pitchDegrees.confirmed && (
        <View style={[styles.flagBox, { backgroundColor: tier.bg, borderColor: tier.border }]}>
          <Text style={[styles.flagText, { color: tier.text }]}>{area.pitchCompliance.message}</Text>
        </View>
      )}

      <Text style={styles.label}>Event type for this roof area</Text>
      <View style={styles.chipRowWrap}>
        {EVENT_OPTIONS.map((e) => (
          <Pressable
            key={e}
            style={[styles.chipSmall, area.eventType === e && styles.chipActive]}
            onPress={() => setEventType(e)}
          >
            <Text style={[styles.chipTextSmall, area.eventType === e && styles.chipTextActive]}>
              {e.replace(/_/g, " ")}
            </Text>
          </Pressable>
        ))}
      </View>

      {area.eventType === "hail" && (
        <>
          <Text style={styles.label}>Hail damage % (this roof area)</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            placeholder="0-100"
            value={area.hailDamagePercent !== undefined ? String(area.hailDamagePercent) : ""}
            onChangeText={setHailPercent}
          />
        </>
      )}

      <AnalyzablePhotoField
        label="Damage photos for this roof area"
        photos={area.damagePhotoUrls}
        onChange={(photos) => updateRoofArea(roofAreaId, (a) => ({ ...a, damagePhotoUrls: photos }))}
        context={`Roof area: ${area.label || area.roofType.value}. Material: ${area.materialSecondary.value.replace(/_/g, " ")}. Pitch: ${area.pitchDegrees.confirmed ? area.pitchDegrees.value + "°" : "not recorded"}.`}
        onAnalysisResult={(result) => {
          update((draft) => ({
            ...draft,
            findings: {
              ...draft.findings,
              insurableExternalDamageSummary: {
                value: draft.findings.insurableExternalDamageSummary.confirmed
                  ? `${draft.findings.insurableExternalDamageSummary.value}\n\n${result.description}`
                  : result.description,
                source: "ai-draft",
                confirmed: false,
              },
            },
          }));
        }}
      />

      <Pressable style={styles.nextBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.nextBtnText}>Done</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16, gap: 4 },
  label: { fontSize: 12, color: "#8a8a90", marginTop: 14, marginBottom: 6 },
  chipRow: { flexDirection: "row", gap: 8 },
  chipRowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { flex: 1, borderWidth: 1, borderColor: "#d8d8dc", borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  chipSmall: { borderWidth: 1, borderColor: "#d8d8dc", borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12 },
  chipActive: { backgroundColor: "#eef2ff", borderColor: "#6366f1" },
  chipText: { fontSize: 13, textTransform: "capitalize" },
  chipTextSmall: { fontSize: 12, textTransform: "capitalize" },
  chipTextActive: { fontWeight: "600", color: "#111114" },
  input: { borderWidth: 1, borderColor: "#d8d8dc", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  flagBox: { borderWidth: 1, borderRadius: 8, padding: 10, marginTop: 10 },
  flagText: { fontSize: 12, lineHeight: 17 },
  nextBtn: { backgroundColor: "#111114", borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 24 },
  nextBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
