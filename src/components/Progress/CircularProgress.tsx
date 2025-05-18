import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import CircularProgressIndicator from 'react-native-circular-progress-indicator';

interface CircularProgressProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  showPercentage?: boolean;
  label?: string;
  color?: string;
  children?: React.ReactNode;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 80,
  strokeWidth = 8,
  showPercentage = true,
  label,
  color,
  children,
}) => {
  const theme = useTheme();
  const progressColor = color || theme.colors.primary;
  const percentage = Math.min(Math.max(progress || 0, 0), 1) * 100;

  return (
    <View style={styles.container}>
      <CircularProgressIndicator
        value={percentage}
        radius={size / 2}
        activeStrokeWidth={strokeWidth}
        inActiveStrokeWidth={strokeWidth}
        activeStrokeColor={progressColor}
        inActiveStrokeColor={theme.dark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}
        duration={1000}
        maxValue={100}
      >
        {children}
      </CircularProgressIndicator>
      {showPercentage && !children && (
        <View style={styles.percentageContainer}>
          <Text variant="bodyLarge" style={[styles.percentageText, { color: theme.colors.text }]}>
            {Math.round(percentage)}%
          </Text>
        </View>
      )}
      {label && <Text variant="bodyMedium" style={styles.label}>{label}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 8,
    textAlign: 'center',
  },
  percentageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  percentageText: {
    fontWeight: 'bold',
  },
});

export default CircularProgress;
