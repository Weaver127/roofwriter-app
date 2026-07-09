import React, { useState } from "react";
import { Modal, View, Text, Image, Pressable, StyleSheet, TextInput, useWindowDimensions } from "react-native";

export interface PhotoMarker {
  id: string;
  type: "circle" | "line" | "text";
  x: number;
  y: number;
  x2?: number;
  y2?: number;
  text?: string;
}

interface PhotoAnnotationModalProps {
  visible: boolean;
  photoUri: string;
  initialMarkers: PhotoMarker[];
  onSave: (markers: PhotoMarker[]) => void;
  onClose: () => void;
}

type Tool = "circle" | "line" | "text";

export function PhotoAnnotationModal({ visible, photoUri, initialMarkers, onSave, onClose }: PhotoAnnotationModalProps) {
  const { width } = useWindowDimensions();
  const imageHeight = (width * 3) / 4;

  const [markers, setMarkers] = useState<PhotoMarker[]>(initialMarkers);
  const [tool, setTool] = useState<Tool>("circle");
  const [pendingLineStart, setPendingLineStart] = useState<{ x: number; y: number } | null>(null);
  const [textPrompt, setTextPrompt] = useState<{ x: number; y: number } | null>(null);
  const [textInput, setTextInput] = useState("");

  const handleTap = (evt: any) => {
    const { locationX, locationY } = evt.nativeEvent;

    if (tool === "circle") {
      setMarkers((prev) => [...prev, { id: Math.random().toString(36).slice(2), type: "circle", x: locationX, y: locationY }]);
      return;
    }

    if (tool === "line") {
      if (!pendingLineStart) {
        setPendingLineStart({ x: locationX, y: locationY });
      } else {
        setMarkers((prev) => [
          ...prev,
          { id: Math.random().toString(36).slice(2), type: "line", x: pendingLineStart.x, y: pendingLineStart.y, x2: locationX, y2: locationY },
        ]);
        setPendingLineStart(null);
      }
      return;
    }

    if (tool === "text") {
      setTextPrompt({ x: locationX, y: locationY });
    }
  };

  const confirmText = () => {
    if (textPrompt && textInput.trim()) {
      setMarkers((prev) => [
        ...prev,
        { id: Math.random().toString(36).slice(2), type: "text", x: textPrompt.x, y: textPrompt.y, text: textInput.trim() },
      ]);
    }
    setTextPrompt(null);
    setTextInput("");
  };

  const undo = () => setMarkers((prev) => prev.slice(0, -1));

  const dotsBetween = (x1: number, y1: number, x2: number, y2: number, keyPrefix: string) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(2, Math.floor(distance / 4));
    const dots = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      dots.push(
        <View key={`${keyPrefix}-${i}`} style={[styles.lineDot, { left: x1 + dx * t - 2, top: y1 + dy * t - 2 }]} />
      );
    }
    return dots;
  };

  const renderArrow = (m: PhotoMarker) => {
    if (m.x2 === undefined || m.y2 === undefined) return null;
    const dx = m.x2 - m.x;
    const dy = m.y2 - m.y;
    const angle = Math.atan2(dy, dx);
    const headLength = 14;
    const headAngle = 0.45;
    const wing1x = m.x2 - headLength * Math.cos(angle - headAngle);
    const wing1y = m.y2 - headLength * Math.sin(angle - headAngle);
    const wing2x = m.x2 - headLength * Math.cos(angle + headAngle);
    const wing2y = m.y2 - headLength * Math.sin(angle + headAngle);
    return (
      <React.Fragment>
        {dotsBetween(m.x, m.y, m.x2, m.y2, `${m.id}-shaft`)}
        {dotsBetween(m.x2, m.y2, wing1x, wing1y, `${m.id}-w1`)}
        {dotsBetween(m.x2, m.y2, wing2x, wing2y, `${m.id}-w2`)}
      </React.Fragment>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose}>
            <Text style={styles.headerBtn}>Cancel</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Annotate photo</Text>
          <Pressable onPress={() => onSave(markers)}>
            <Text style={[styles.headerBtn, styles.saveBtn]}>Save</Text>
          </Pressable>
        </View>

        <Pressable onPress={handleTap} style={{ width, height: imageHeight }}>
          <Image source={{ uri: photoUri }} style={{ width, height: imageHeight }} resizeMode="cover" />
          {markers.map((m) => {
            if (m.type === "circle") {
              return <View key={m.id} style={[styles.circleMarker, { left: m.x - 22, top: m.y - 22 }]} />;
            }
            if (m.type === "line") {
              return <React.Fragment key={m.id}>{renderArrow(m)}</React.Fragment>;
            }
            return (
              <View key={m.id} style={[styles.textMarker, { left: m.x, top: m.y }]}>
                <Text style={styles.textMarkerLabel}>{m.text}</Text>
              </View>
            );
          })}
          {pendingLineStart && (
            <View style={[styles.circleMarker, styles.pendingDot, { left: pendingLineStart.x - 5, top: pendingLineStart.y - 5 }]} />
          )}
        </Pressable>

        {tool === "line" && pendingLineStart && (
          <Text style={styles.hint}>Tap the end point to finish the line</Text>
        )}

        <View style={styles.toolbar}>
          <Pressable style={[styles.toolBtn, tool === "circle" && styles.toolBtnActive]} onPress={() => { setTool("circle"); setPendingLineStart(null); }}>
            <Text style={[styles.toolBtnText, tool === "circle" && styles.toolBtnTextActive]}>Circle</Text>
          </Pressable>
          <Pressable style={[styles.toolBtn, tool === "line" && styles.toolBtnActive]} onPress={() => setTool("line")}>
            <Text style={[styles.toolBtnText, tool === "line" && styles.toolBtnTextActive]}>Arrow</Text>
          </Pressable>
          <Pressable style={[styles.toolBtn, tool === "text" && styles.toolBtnActive]} onPress={() => { setTool("text"); setPendingLineStart(null); }}>
            <Text style={[styles.toolBtnText, tool === "text" && styles.toolBtnTextActive]}>Text</Text>
          </Pressable>
          <Pressable style={styles.toolBtn} onPress={undo}>
            <Text style={styles.toolBtnText}>Undo</Text>
          </Pressable>
        </View>

        {textPrompt && (
          <View style={styles.textPromptOverlay}>
            <View style={styles.textPromptBox}>
              <Text style={styles.textPromptLabel}>Add label</Text>
              <TextInput
                style={styles.textPromptInput}
                autoFocus
                value={textInput}
                onChangeText={setTextInput}
                placeholder="e.g. cracked ridge cap"
              />
              <View style={styles.textPromptRow}>
                <Pressable onPress={() => { setTextPrompt(null); setTextInput(""); }}>
                  <Text style={styles.textPromptCancel}>Cancel</Text>
                </Pressable>
                <Pressable onPress={confirmText}>
                  <Text style={styles.textPromptConfirm}>Add</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, paddingTop: 50 },
  headerBtn: { color: "#fff", fontSize: 14 },
  saveBtn: { fontWeight: "700" },
  headerTitle: { color: "#fff", fontSize: 14, fontWeight: "600" },
  circleMarker: {
    position: "absolute", width: 44, height: 44, borderRadius: 22,
    borderWidth: 3, borderColor: "#ffd166",
  },
  pendingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#ffd166", borderWidth: 0 },
  lineDot: { position: "absolute", width: 4, height: 4, borderRadius: 2, backgroundColor: "#ffd166" },
  textMarker: {
    position: "absolute", backgroundColor: "rgba(17,17,20,0.85)",
    paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, maxWidth: 160,
  },
  textMarkerLabel: { color: "#fff", fontSize: 11 },
  hint: { color: "#ffd166", textAlign: "center", fontSize: 12, paddingVertical: 8 },
  toolbar: { flexDirection: "row", padding: 12, gap: 8 },
  toolBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: "center", backgroundColor: "#222" },
  toolBtnActive: { backgroundColor: "#ffd166" },
  toolBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  toolBtnTextActive: { color: "#111114" },
  textPromptOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center",
  },
  textPromptBox: { backgroundColor: "#fff", borderRadius: 10, padding: 16, width: "80%" },
  textPromptLabel: { fontSize: 12, color: "#5a5a60", marginBottom: 8 },
  textPromptInput: { borderWidth: 1, borderColor: "#d8d8dc", borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 12 },
  textPromptRow: { flexDirection: "row", justifyContent: "flex-end", gap: 16 },
  textPromptCancel: { color: "#8a8a90", fontSize: 13 },
  textPromptConfirm: { color: "#111114", fontSize: 13, fontWeight: "700" },
});
