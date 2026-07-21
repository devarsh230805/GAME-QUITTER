import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";

// Colorful animated background blobs (no images)
// Usage: <AnimatedBlobs /> placed inside a screen container; it's absolute-positioned behind content.
export default function AnimatedBlobs({ intensity = 1 }) {
  const s1 = useRef(new Animated.Value(0)).current;
  const s2 = useRef(new Animated.Value(0)).current;
  const s3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const mkLoop = (val, delay, amp) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, {
            toValue: amp,
            duration: 4000,
            delay,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: -amp,
            duration: 4000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      );
    const l1 = mkLoop(s1, 0, 8 * intensity);
    const l2 = mkLoop(s2, 600, 10 * intensity);
    const l3 = mkLoop(s3, 1200, 12 * intensity);
    l1.start();
    l2.start();
    l3.start();
    return () => {
      l1.stop();
      l2.stop();
      l3.stop();
    };
  }, [s1, s2, s3, intensity]);

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Animated.View
        style={[
          styles.blob,
          styles.b1,
          {
            transform: [
              { translateX: s1 },
              { translateY: Animated.multiply(s1, 0.6) },
              { scale: 1.05 },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.blob,
          styles.b2,
          {
            transform: [
              { translateX: s2 },
              { translateY: Animated.multiply(s2, -0.4) },
              { scale: 1.08 },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.blob,
          styles.b3,
          {
            transform: [
              { translateX: s3 },
              { translateY: Animated.multiply(s3, 0.3) },
              { scale: 1.02 },
            ],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
  blob: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 180,
    opacity: 0.25,
  },
  b1: { backgroundColor: "#60A5FA", top: -40, left: -40 }, // blue
  b2: { backgroundColor: "#34D399", top: 80, right: -60 }, // green
  b3: { backgroundColor: "#F59E0B", bottom: -40, left: 40 }, // amber
});
