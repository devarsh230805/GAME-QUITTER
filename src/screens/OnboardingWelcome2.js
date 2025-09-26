import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { styles } from './OnboardingWelcome2.styles';

/**
 * OnboardingWelcome2
 * Second onboarding screen with hero, title/subtitle and Next button.
 * Styles moved to OnboardingWelcome2.styles.js (no visual changes).
 */
export default function OnboardingWelcome2({ onNext }) {
  return (
    <View style={styles.container}>
      <View style={styles.spacer} />
      <View style={styles.bottomContent}>
        <Image
          source={require('../../pics/welcome2.jpeg')}
          style={styles.hero}
          resizeMode="contain"
        />
        <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.9}>
          Don’t let the game play you.
        </Text>
        <Text style={styles.body} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.9}>
          Take back control before you hit “Play.”
        </Text>
        <Pressable style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed]} onPress={onNext}>
          <Text style={styles.primaryText}>Next</Text>
        </Pressable>
      </View>
    </View>
  );
}

// styles imported from './OnboardingWelcome2.styles'
