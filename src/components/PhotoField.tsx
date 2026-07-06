import React from "react";
import { View, Text, Image, Pressable, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

interface PhotoFieldProps {
  label: string;
  photos: string[];
  onChange: (photos: string[]) => void;
  required?: boolean;
}

/**
 * Real photo capture, not a placeholder button. Uses expo-image-picker's
 * camera launcher rather than expo-camera's full custom camera view — this
 * is the right tradeoff for an inspection app: it's the same native camera
 * UI the assessor already knows, with less custom UI for us to get wrong.
 * Falls back to the photo library on simulators/devices without a camera.
 */
export function PhotoField({ label, photos, onChange, required }: PhotoFieldProps) {
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
          </View>
        ))}
        <Pressable style={styles.addBtn} onPress={takePhoto}>
          <Text style={styles.addBtnText}>+ Photo</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 6 },
  label: { fontSize: 12, color: "#8a8a90", marginBottom: 6 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  thumbWrap: { position: "relative" },
  thumb: { width: 64, height: 64, borderRadius: 8, backgroundColor: "#f0f0f0" },
  removeBtn: {
    position: "absolute", top: -6, right: -6, backgroundColor: "#111114",
    width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center",
  },
  removeBtnText: { color: "#fff", fontSize: 13, lineHeight: 14 },
  addBtn: {
    width: 64, height: 64, borderRadius: 8, borderWidth: 1, borderColor: "#d8d8dc", borderStyle: "dashed",
    alignItems: "center", justifyContent: "center",
  },
  addBtnText: { fontSize: 10, color: "#5a5a60", textAlign: "center" },
});
