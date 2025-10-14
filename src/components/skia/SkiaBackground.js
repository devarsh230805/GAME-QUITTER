import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Canvas, Rect, LinearGradient, vec, Circle, Blur, Group } from '@shopify/react-native-skia';

const { width, height } = Dimensions.get('window');

export default function SkiaBackground({ variant = 'default', colors }) {
  const isGameMode = variant === 'game';

  // Color schemes
  const bgColors = isGameMode
    ? [colors.background, '#0a0a0a', '#050505']
    : ['#FFFFFF', '#F9F9F9', '#F5F5F5'];
    
  const glow1Color = isGameMode ? colors.primary : '#E0E0E0';
  const glow2Color = isGameMode ? colors.warning : '#D0D0D0';

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Base gradient background */}
      <Rect x={0} y={0} width={width} height={height}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(width, height)}
          colors={bgColors}
        />
      </Rect>

      {isGameMode && (
        <>
          {/* Static glow orbs */}
          <Group>
            <Circle 
              cx={width * 0.85} 
              cy={height * 0.15} 
              r={100} 
              color={glow1Color} 
              opacity={0.25} 
            />
            <Blur blur={60} />
          </Group>

          <Group>
            <Circle 
              cx={width * 0.2} 
              cy={height * 0.75} 
              r={140} 
              color={glow2Color} 
              opacity={0.2} 
            />
            <Blur blur={70} />
          </Group>

          {/* Accent glow in center */}
          <Group>
            <Circle 
              cx={width * 0.5} 
              cy={height * 0.45} 
              r={100} 
              color={colors.primary} 
              opacity={0.08} 
            />
            <Blur blur={80} />
          </Group>

          {/* Diagonal accent lines */}
          <Group>
            <Rect 
              x={-width * 0.2} 
              y={height * 0.3} 
              width={width * 1.4} 
              height={2} 
              color={colors.primary} 
              opacity={0.15} 
            />
            <Blur blur={8} />
          </Group>

          <Group>
            <Rect 
              x={-width * 0.2} 
              y={height * 0.7} 
              width={width * 1.4} 
              height={2} 
              color={colors.warning} 
              opacity={0.12} 
            />
            <Blur blur={6} />
          </Group>
        </>
      )}

      {!isGameMode && (
        <>
          {/* Subtle vignette for default mode */}
          <Group>
            <Circle cx={width * 0.5} cy={height * 0.5} r={width * 0.8} color="#000000" opacity={0.02} />
            <Blur blur={100} />
          </Group>
        </>
      )}
    </Canvas>
  );
}
