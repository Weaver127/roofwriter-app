import React, { useState } from "react";
import { View, Text, Image, Pressable, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { PhotoAnnotationModal, PhotoMarker } from "./PhotoAnnotationModal";

interface PhotoFieldProps {
  label: string;
  photos: string[];
  onChange: (photos: string[]) => void;
  required?: boolean;
}

export function PhotoField({ label, photos, onChange, required }: PhotoFieldProps) {
  const [annotatingUri, setAnnotatingUri] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<Record<string, PhotoMarker[]>>({});

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Camera permission needed", "RoofWriter needs camera access to attach inspection photos.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled && result.assets?.[0]?.uri) {
      onChange([...photos, result.assets[0].uri]);
    }
  };

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Photo library permission needed", "RoofWriter needs photo library access to attach existing photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsMultipleSelection: true });
    if (!result.canceled && result.assets?.length) {
      onChange([...photos, ...result.assets.map((a) => a.uri)]);
    }
  };

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required ? " *" : ""}
      </Text>
      <View style={styles.row}>
        {photos.map((uri, i) => (
          <View key={uri + i} style={styles.thumbWrap}>
            <Image source={{ uri }} style={styles.thumb} />
            <Pressable style={styles.removeBtn} onPress={() => removePhoto(i)}>
              <Text style={styles.removeBtnText}>×</Text>
            </Pressable>
            <Pressable style={styles.annotateBtn} onPress={() => setAnnotatingUri(uri)}>
              <Text style={styles.annotateBtnText}>{annotations[uri]?.length ? "Edit marks" : "Annotate"}</Text>
            </Pressable>
          </View>
        ))}
        <Pressable style={styles.addBtn} onPress={takePhoto}>
          <Text style={styles.addBtnText}>Camera</Text>
        </Pressable>
        <Pressable style={styles.addBtn} onPress={pickFromLibrary}>
          <Text style={styles.addBtnText}>Gallery</Text>
        </Pressable>
      </View>

      {annotatingUri && (
        <PhotoAnnotationModal
          visible={!!annotatingUri}
          photoUri={annotatingUri}
          initialMarkers={annotations[annotatingUri] ?? []}
          onSave={(markers) => {
            setAnnotations((prev) => ({ ...prev, [annotatingUri]: markers }));
            setAnnotatingUri(null);
          }}
          onClose={() => setAnnotatingUri(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 6 },
  label: { fontSize: 12, color: "#8a8a90", marginBottom: 6 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  thumbWrap: { position: "relative" },
  thumb: { width: 76, height: 76, borderRadius: 8, backgroundColor: "#f0f0f0" },
  removeBtn: {
    position: "absolute", top: -6, right: -6, backgroundColor: "#111114",
    width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", zIndex: 2,
  },
  removeBtnText: { color: "#fff", fontSize: 13, lineHeight: 14 },
  annotateBtn: {
    position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(17,17,20,0.85)",
    paddingVertical: 3, alignItems: "center", borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
  },
  annotateBtnText: { color: "#fff", fontSize: 8, fontWeight: "600" },
  addBtn: {
    width: 76, height: 76, borderRadius: 8, borderWidth: 1, borderColor: "#d8d8dc", borderStyle: "dashed",
    alignItems: "center", justifyContent: "center",
  },
  addBtnText: { fontSize: 10, color: "#5a5a60", textAlign: "center" },
});
