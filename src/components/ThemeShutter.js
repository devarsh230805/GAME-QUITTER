import React, { useEffect, useRef } from "react";
import { Pressable, View, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ThemeShutter({ themeMode, onChange, colors }) {
  const isDark = themeMode === "dark";

  // Animated value for sliding knob (0 = light mode / left, 1 = dark mode / right)
  const slideAnim = useRef(new Animated.Value(isDark ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isDark ? 1 : 0,
      duration: 250,
      useNativeDriver: true, // GPU-accelerated UI-thread animation
    }).start();
  }, [isDark]);

  // Interpolate slideAnim to get translateX value
  // Track width is 76, knob is 26, padding is 4. Slide distance = 76 - 26 - 8 = 42.
  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 42],
  });

  return (
    <Pressable
      onPress={() => onChange(isDark ? "light" : "dark")}
      style={[
        styles.track,
        {
          backgroundColor: isDark
            ? "rgba(30, 41, 59, 0.8)"
            : "rgba(226, 232, 240, 0.8)",
          borderColor: colors.border,
        },
      ]}
    >
      {/* Background Track Icons */}
      <View style={styles.iconContainer}>
        <Ionicons
          name="sunny-outline"
          size={14}
          color={isDark ? "#94A3B8" : "#F59E0B"}
        />
        <Ionicons
          name="moon-outline"
          size={14}
          color={isDark ? "#FFFFFF" : "#94A3B8"}
        />
      </View>

      {/* Sliding Shutter Knob */}
      <Animated.View
        style={[
          styles.knob,
          {
            transform: [{ translateX }],
            backgroundColor: "#FFFFFF", // Clean flat white knob
          },
        ]}
      >
        <Ionicons
          name={isDark ? "moon" : "sunny"}
          size={13}
          color={isDark ? "#0B0F19" : "#F59E0B"}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 76,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    padding: 4,
    justifyContent: "center",
    position: "relative",
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    alignItems: "center",
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  knob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
});
