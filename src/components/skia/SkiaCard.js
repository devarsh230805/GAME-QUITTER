import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas, RoundedRect, LinearGradient, vec, Shadow, Blur, Group } from '@shopify/react-native-skia';

export default function SkiaCard({ children, colors, variant = 'default', style, width = 350, height = 200 }) {
  const isGameMode = variant === 'game';

  return (
    <View style={[styles.container, style, { width, height }]}>
      <Canvas style={[styles.canvas, { width, height }]} pointerEvents="none">
        {isGameMode && (
          <>
            {/* Outer glow */}
            <Group>
              <RoundedRect
                x={0}
                y={0}
                width={width}
                height={height}
                r={16}
                color={colors.primary}
                opacity={0.2}
              />
              <Blur blur={16} />
            </Group>

            {/* Neon border */}
            <RoundedRect
              x={1}
              y={1}
              width={width - 2}
              height={height - 2}
              r={16}
              color={colors.border}
              style="stroke"
              strokeWidth={2}
              opacity={0.6}
            />
          </>
        )}

        {/* Card background */}
        <RoundedRect
          x={2}
          y={2}
          width={width - 4}
          height={height - 4}
          r={15}
        >
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, height)}
            colors={isGameMode 
              ? [colors.surface, colors.background] 
              : ['#FFFFFF', '#F9F9F9']
            }
          />
          {!isGameMode && <Shadow dx={0} dy={4} blur={12} color="rgba(0,0,0,0.1)" />}
        </RoundedRect>

        {isGameMode && (
          <>
            {/* Top highlight */}
            <RoundedRect
              x={6}
              y={6}
              width={width - 12}
              height={2}
              r={8}
              color={colors.primary}
              opacity={0.15}
            />
          </>
        )}
      </Canvas>
      
      <View style={styles.content} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  canvas: {
    position: 'absolute',
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
