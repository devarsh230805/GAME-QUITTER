import React, { useState } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { styles } from './OnboardingWelcome.styles';

export default function OnboardingWelcome({ onSkip, onNext }) {
  const [showHero, setShowHero] = useState(true);

  return (
    <View style={styles.container}>
      
      {/* App icon + name */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/logo.png')} // 👈 replace with your actual app icon path
          style={styles.appIcon}
          resizeMode="contain"
        />
        <Text style={styles.appName}>GameQuitter</Text>
      </View>

      {/* Hero Section */}
      <View style={styles.heroContainer}>
        {showHero && (
          <Image
            source={require('../../pics/WhatsApp Image 2025-09-26 at 1.34.07 AM.jpeg')}
            style={styles.hero}
            resizeMode="cover"
            onError={() => setShowHero(false)}
          />
        )}
      </View>

      {/* Content Section */}
      <View style={styles.bottomContent}>
        <Text
          style={styles.title}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          Life is waiting beyond the screen.
        </Text>

        <Text
          style={styles.body}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          Simple commitment to help you live more, play less.
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.primary,
            pressed && styles.primaryPressed,
          ]}
          onPress={onNext}
        >
          <Text style={styles.primaryText}>Next</Text>
        </Pressable>
       
      </View>
    </View>
  );
}
