import React from "react";
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useInspection } from "../state/InspectionContext";
import { YesNoToggle } from "../components/ToggleGroup";
import { PhotoField } from "../components/PhotoField";

export default function MakeSafeScreen() {
  const navigation = useNavigation<any>();
  const { inspection, update } = useInspection();
  const ms = inspection.makeSafe;

  const setField = <K extends keyof typeof ms>(key: K, value: (typeof ms)[K]) =>
    update((draft) => {
      const nextMakeSafe = { ...draft.makeSafe, [key]: value };
      let actions = draft.actions;
      if (key === "stillNeeded" && value === true && !actions.some((a) => a.trigger === "make_safe_still_needed" && !a.resolved)) {
        actions = [
          ...actions,
          {
            id: Math.random().toString(36).slice(2),
            trigger: "make_safe_still_needed",
            description: "Make safe still needed — escalate to makesafe@homerepair.com.au",
            draftEmailBody: `Claim ${draft.jobDetails.claimNumber ?? "(no claim number)"} — ${draft.jobDetails.siteAddress || "(no address)"} — further make safe required.`,
            resolved: false,
          },
        ];
      }
      return { ...draft, makeSafe: nextMakeSafe, actions };
    });

  const pendingAction = inspection.actions.find((a) => a.trigger === "make_safe_still_needed" && !a.resolved);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Was a make safe conducted?</Text>
      <YesNoToggle value={ms.conducted} onChange={(v) => setField("conducted", v)} />

      {ms.conducted && (
        <>
          <Text style={styles.label}>Describe the works completed</Text>
          <TextInput
            style={styles.textarea}
            multiline
            placeholder="e.g. Tarped the rear roof face over the affected valley..."
            value={ms.worksCompletedDescription?.value ?? ""}
            onChangeText={(v) => setField("worksCompletedDescription", { value: v, source: "manual", confirmed: true })}
          />
          <PhotoField
            label="Before photo"
            photos={ms.beforePhotoUrl ? [ms.beforePhotoUrl] : []}
            onChange={(photos) => setField("beforePhotoUrl", photos[photos.length - 1])}
          />
          <PhotoField
            label="After photo"
            photos={ms.afterPhotoUrl ? [ms.afterPhotoUrl] : []}
            onChange={(photos) => setField("afterPhotoUrl", photos[photos.length - 1])}
          />
        </>
      )}

      <Text style={styles.labelManual}>Is a make safe still needed?</Text>
      <YesNoToggle value={ms.stillNeeded} onChange={(v) => setField("stillNeeded", v)} manualOnly />

      {pendingAction && (
        <View style={styles.escalationBox}>
          <Text style={styles.escalationTitle}>Escalation drafted — review and send</Text>
          <Text style={styles.escalationBody}>{pendingAction.draftEmailBody}</Text>
          <Pressable
            style={styles.sendBtn}
            onPress={() =>
              update((draft) => ({
                ...draft,
                actions: draft.actions.map((a) => (a.id === pendingAction.id ? { ...a, resolved: true } : a)),
              }))
            }
          >
            <Text style={styles.sendBtnText}>Mark sent</Text>
          </Pressable>
        </View>
      )}

      <Pressable style={styles.nextBtn} onPress={() => navigation.navigate("Accessories")}>
        <Text style={styles.nextBtnText}>Next: Roof-top services</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16, gap: 4 },
  label: { fontSize: 12, color: "#8a8a90", marginTop: 14, marginBottom: 6 },
  labelManual: { fontSize: 12, color: "#b91c1c", marginTop: 14, marginBottom: 6 },
  textarea: { borderWidth: 1, borderColor: "#d8d8dc", borderRadius: 8, padding: 10, fontSize: 13, minHeight: 60, textAlignVertical: "top", marginBottom: 8 },
  escalationBox: { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#ef4444", borderRadius: 8, padding: 12, marginTop: 14 },
  escalationTitle: { fontSize: 12, fontWeight: "600", color: "#b91c1c", marginBottom: 6 },
  escalationBody: { fontSize: 11, color: "#b91c1c", marginBottom: 10 },
  sendBtn: { backgroundColor: "#b91c1c", borderRadius: 6, paddingVertical: 8, alignItems: "center" },
  sendBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  nextBtn: { backgroundColor: "#111114", borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 24 },
  nextBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
