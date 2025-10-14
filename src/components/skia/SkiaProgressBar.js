import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas, RoundedRect, LinearGradient, vec, Blur, Group } from '@shopify/react-native-skia';

export default function SkiaProgressBar({ 
  progress = 0, // 0 to 1
  colors, 
  variant = 'default',
  width = 300,
  height = 12
}) {
  const isGameMode = variant === 'game';
  const fillWidth = width * Math.min(1, Math.max(0, progress));

  return (
    <View style={[styles.container, { width, height }]}>
      <Canvas style={[styles.canvas, { width, height }]} pointerEvents="none">
        {/* Background track */}
        <RoundedRect
          x={0}
          y={0}
          width={width}
          height={height}
          r={height / 2}
          color={isGameMode ? colors.border : '#E5E7EB'}
        />

        {fillWidth > 0 && (
          <>
            {isGameMode && (
              /* Glow effect for game mode */
              <Group>
                <RoundedRect
                  x={0}
                  y={0}
                  width={fillWidth}
                  height={height}
                  r={height / 2}
                  color={colors.primary}
                  opacity={0.5}
                />
                <Blur blur={12} />
              </Group>
            )}

            {/* Progress fill */}
            <RoundedRect
              x={0}
              y={0}
              width={fillWidth}
              height={height}
              r={height / 2}
            >
              <LinearGradient
                start={vec(0, 0)}
                end={vec(fillWidth, 0)}
                colors={isGameMode 
                  ? [colors.primary, colors.warning]
                  : [colors.primary, colors.primary]
                }
              />
            </RoundedRect>

            {/* Highlight on top */}
            <RoundedRect
              x={2}
              y={2}
              width={Math.max(0, fillWidth - 4)}
              height={height / 3}
              r={height / 2}
              color="#FFFFFF"
              opacity={0.3}
            />
          </>
        )}
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  canvas: {
    position: 'absolute',
  },
});
