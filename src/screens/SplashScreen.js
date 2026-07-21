import React, { useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { typography, spacing } from "../theme/tokens";

export default function SplashScreen({ onDone, themeColors }) {
  const styles = React.useMemo(() => createStyles(themeColors), [themeColors]);
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.9);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    const t = setTimeout(() => onDone && onDone(), 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.logo}>
          <Text style={styles.logoText}>GQ</Text>
        </View>
      </Animated.View>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.title}>Game Quitter</Text>
        <Text style={styles.tagline}>
          Your coach for controlling gaming urges
        </Text>
      </Animated.View>
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    logoContainer: {
      marginBottom: spacing.xl,
    },
    logo: {
      width: 100,
      height: 100,
      backgroundColor: colors.primary,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
      elevation: 10,
    },
    logoText: {
      color: colors.surface,
      fontSize: 40,
      fontWeight: "900",
    },
    title: {
      ...typography.title,
      color: colors.text,
      textAlign: "center",
    },
    tagline: {
      ...typography.caption,
      color: colors.textDim,
      marginTop: spacing.sm,
      textAlign: "center",
    },
  });
