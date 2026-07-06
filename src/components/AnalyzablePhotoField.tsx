import React, { useState } from "react";
import { View, Text, Image, Pressable, StyleSheet, Alert, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { API_BASE_URL } from "../constants/api";

interface AnalysisResult {
  description: string;
  suggestedDefectType: string | null;
  confidence: "low" | "medium" | "high";
}

interface AnalyzablePhotoFieldProps {
  label: string;
  photos: string[];
  onChange: (photos: string[]) => void;
  context: string;
  onAnalysisResult: (result: AnalysisResult, photoUri: string) => void;
  required?: boolean;
}

export function AnalyzablePhotoField({
  label,
  photos,
  onChange,
  context,
  onAnalysisResult,
  required,
}: AnalyzablePhotoFieldProps) {
  const [analyzingUri, setAnalyzingUri] = useState<string | null>(null);
  const [base64Map, setBase64Map] = useState<Record<string, string>>({});

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Camera permission needed", "RoofWriter needs camera access to attach inspection photos.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.6, base64: true });
    if (!result.canceled && result.assets?.[0]?.uri) {
      const asset = result.assets[0];
      if (asset.base64) setBase64Map((prev) => ({ ...prev, [asset.uri]: asset.base64! }));
      onChange([...photos, asset.uri]);
    }
  };

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Photo library permission needed", "RoofWriter needs photo library access to attach existing photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.6, allowsMultipleSelection: true, base64: true });
    if (!result.canceled && result.assets?.length) {
      const newBase64: Record<string, string> = {};
      result.assets.forEach((a) => {
        if (a.base64) newBase64[a.uri] = a.base64;
      });
      setBase64Map((prev) => ({ ...prev, ...newBase64 }));
      onChange([...photos, ...result.assets.map((a) => a.uri)]);
    }
  };

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  const analyzePhoto = async (uri: string) => {
    const base64 = base64Map[uri];
    if (!base64) {
      Alert.alert("Can't analyze this photo", "This photo's data isn't available for analysis (it may have been added before this feature was enabled). Try removing and re-adding it.");
      return;
    }

    setAnalyzingUri(uri);
    try {
      const response = await fetch(`${API_BASE_URL}/analyze-photo`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mediaType: "image/jpeg", context }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Server responded ${response.status}: ${errBody.slice(0, 200)}`);
      }

      const result: AnalysisResult = await response.json();
      onAnalysisResult(result, uri);
    } catch (err) {
      Alert.alert(
        "Analysis failed",
        `Couldn't reach the AI analysis service. This can happen on the first request after the server has been idle (it takes 30-60 seconds to wake up on the free tier) — try again in a moment.\n\nDetails: ${(err as Error).message}`
      );
    } finally {
      setAnalyzingUri(null);
    }
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
            {analyzingUri === uri ? (
              <View style={styles.analyzeOverlay}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            ) : (
              <Pressable style={styles.analyzeBtn} onPress={() => analyzePhoto(uri)}>
                <Text style={styles.analyzeBtnText}>Analyze</Text>
              </Pressable>
            )}
          </View>
        ))}
        <Pressable style={styles.addBtn} onPress={takePhoto}>
          <Text style={styles.addBtnText}>Camera</Text>
        </Pressable>
        <Pressable style={styles.addBtn} onPress={pickFromLibrary}>
          <Text style={styles.addBtnText}>Gallery</Text>
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
  thumb: { width: 76, height: 76, borderRadius: 8, backgroundColor: "#f0f0f0" },
  removeBtn: {
    position: "absolute", top: -6, right: -6, backgroundColor: "#111114",
    width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", zIndex: 2,
  },
  removeBtnText: { color: "#fff", fontSize: 13, lineHeight: 14 },
  analyzeBtn: {
    position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(17,17,20,0.85)",
    paddingVertical: 3, alignItems: "center", borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
  },
  analyzeBtnText: { color: "#fff", fontSize: 9, fontWeight: "600" },
  analyzeOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(17,17,20,0.55)",
    alignItems: "center", justifyContent: "center", borderRadius: 8,
  },
  addBtn: {
    width: 76, height: 76, borderRadius: 8, borderWidth: 1, borderColor: "#d8d8dc", borderStyle: "dashed",
    alignItems: "center", justifyContent: "center",
  },
  addBtnText: { fontSize: 10, color: "#5a5a60", textAlign: "center" },
});
