import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { styles } from './OnboardingWelcome3.styles';

/**
 * OnboardingWelcome3
 * Third onboarding screen with hero, title/subtitle and Get Started button.
 * Styles moved to OnboardingWelcome3.styles.js (no visual changes).
 */
export default function OnboardingWelcome3({ onNext }) {
  return (
    <View style={styles.container}>
      <View style={styles.heroContainer}>
        <Image
          source={require('../../pics/welcome3.jpeg')}
          style={styles.hero}
          resizeMode="contain"
        />
      </View>
      <View style={styles.bottomContent}>
        <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.9}>
          Game over. Life on.
        </Text>
        <Text style={styles.body} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.9}>
          End the game. Start living.
        </Text>
        <Pressable style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed]} onPress={onNext}>
          <Text style={styles.primaryText}>Get Started</Text>
        </Pressable>
      </View>
    </View>
  );
}

// styles imported from './OnboardingWelcome3.styles'

