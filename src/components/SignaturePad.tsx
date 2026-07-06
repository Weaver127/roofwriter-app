import React, { useRef, useState } from "react";
import { View, PanResponder, StyleSheet, Text, Pressable } from "react-native";

interface Point {
  x: number;
  y: number;
}

interface SignaturePadProps {
  onChange: (signed: boolean) => void;
}

/**
 * Deliberately dependency-free. A proper signature library (e.g. one
 * rendering a smooth SVG/canvas path) would look better, but every new
 * dependency added this session has cost real debugging time on version
 * mismatches — this trades a bit of visual polish (renders as closely-
 * spaced dots rather than a continuous smooth line) for zero new native
 * dependencies and zero new version-compatibility risk. Worth revisiting
 * with a real drawing library once the app is on more stable footing.
 */
export function SignaturePad({ onChange }: SignaturePadProps) {
  const [points, setPoints] = useState<Point[]>([]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setPoints((prev) => {
          const next = [...prev, { x: locationX, y: locationY }];
          return next;
        });
      },
      onPanResponderRelease: () => {
        setPoints((current) => {
          onChange(current.length > 5);
          return current;
        });
      },
    })
  ).current;

  const clear = () => {
    setPoints([]);
    onChange(false);
  };

  return (
    <View>
      <View style={styles.pad} {...panResponder.panHandlers}>
        {points.length === 0 && <Text style={styles.placeholder}>Sign here with your finger</Text>}
        {points.map((p, i) => (
          <View key={i} style={[styles.dot, { left: p.x - 2, top: p.y - 2 }]} />
        ))}
      </View>
      <Pressable style={styles.clearBtn} onPress={clear}>
        <Text style={styles.clearBtnText}>Clear signature</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: {
    height: 150,
    borderWidth: 1,
    borderColor: "#d8d8dc",
    borderRadius: 8,
    backgroundColor: "#fafafa",
    overflow: "hidden",
  },
  placeholder: { textAlign: "center", marginTop: 65, color: "#c0c0c5", fontSize: 13 },
  dot: { position: "absolute", width: 4, height: 4, borderRadius: 2, backgroundColor: "#111114" },
  clearBtn: { alignSelf: "flex-end", marginTop: 6 },
  clearBtnText: { fontSize: 11, color: "#8a8a90" },
});
