import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors } from '../constants/colors';

interface WaveVisualizationProps {
  isRecording: boolean;
  isPlaying: boolean;
  duration?: number;
}

const barCount = 24;
const barWidth = 3;
const barSpacing = 2;
const maxHeight = 40;
const minHeight = 4;

export default function WaveVisualization({ 
  isRecording, 
  isPlaying, 
  duration = 0
}: WaveVisualizationProps) {
  const animatedValues = useRef(
    Array.from({ length: barCount }, () => new Animated.Value(minHeight))
  ).current;

  useEffect(() => {
    if (isRecording || isPlaying) {
      const animations = animatedValues.map((value) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(value, {
              toValue: minHeight + Math.random() * (maxHeight - minHeight),
              duration: 200 + Math.random() * 200,
              useNativeDriver: false,
            }),
            Animated.timing(value, {
              toValue: minHeight + Math.random() * (maxHeight - minHeight),
              duration: 200 + Math.random() * 200,
              useNativeDriver: false,
            }),
          ])
        );
      });
      Animated.stagger(50, animations).start();
    } else {
      // Reset to baseline when not active
      const resetAnimations = animatedValues.map(value =>
        Animated.timing(value, {
          toValue: minHeight,
          duration: 300,
          useNativeDriver: false,
        })
      );
      Animated.parallel(resetAnimations).start();
    }
  }, [isRecording, isPlaying, animatedValues]);

  // Audio data visualization removed for optimization

  const getBarColor = () => {
    if (isRecording) return Colors.sunsetRed;
    if (isPlaying) return Colors.riverBlue;
    return Colors.textMedium;
  };

  return (
    <View style={styles.container}>
      <View style={styles.waveContainer}>
        {animatedValues.map((animatedValue, index) => (
          <Animated.View
            key={index}
            style={[
              styles.bar,
              {
                height: animatedValue,
                backgroundColor: getBarColor(),
              },
            ]}
          />
        ))}
      </View>
      {duration > 0 && (
        <View style={styles.durationContainer}>
          <View style={[styles.durationLine, { backgroundColor: getBarColor() }]} />
        </View>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: maxHeight + 10,
    gap: barSpacing,
  },
  bar: {
    width: barWidth,
    borderRadius: barWidth / 2,
    minHeight: minHeight,
  },
  durationContainer: {
    marginTop: 12,
    width: '80%',
    height: 3,
    backgroundColor: Colors.softGrey,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  durationLine: {
    height: '100%',
    borderRadius: 1.5,
    width: '30%', // This would be dynamic based on playback progress
  },
});
