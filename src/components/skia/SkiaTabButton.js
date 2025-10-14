import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Canvas, RoundedRect, Circle, Blur, Group, LinearGradient, vec } from '@shopify/react-native-skia';

export default function SkiaTabButton({ 
  icon, 
  active, 
  onPress, 
  colors,
  variant = 'default'
}) {
  const isGameMode = variant === 'game';

  return (
    <Pressable onPress={onPress} style={styles.container}>
      {({ pressed }) => (
        <>
          <Canvas style={styles.canvas} pointerEvents="none">
            {active && isGameMode && (
              <>
                {/* Active glow */}
                <Group>
                  <Circle
                    cx={40}
                    cy={20}
                    r={20}
                    color={colors.primary}
                    opacity={0.4}
                  />
                  <Blur blur={16} />
                </Group>
              </>
            )}

            {/* Button background */}
            {active && (
              <RoundedRect
                x={8}
                y={4}
                width={64}
                height={32}
                r={12}
                opacity={pressed ? 0.8 : 1}
              >
                <LinearGradient
                  start={vec(0, 0)}
                  end={vec(0, 32)}
                  colors={isGameMode 
                    ? [colors.primary, colors.primaryDim]
                    : ['#F0F0F0', '#E5E5E5']
                  }
                />
              </RoundedRect>
            )}

            {/* Pressed state */}
            {!active && pressed && (
              <RoundedRect
                x={8}
                y={4}
                width={64}
                height={32}
                r={12}
                color={isGameMode ? colors.border : '#E5E5E5'}
                opacity={0.5}
              />
            )}
          </Canvas>

          <View style={styles.iconContainer} pointerEvents="none">
            {React.cloneElement(icon, {
              color: active 
                ? (isGameMode ? colors.background : colors.primary)
                : (isGameMode ? colors.textDim : '#666'),
              weight: active ? 'fill' : 'regular'
            })}
          </View>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvas: {
    position: 'absolute',
    width: 80,
    height: 40,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
