import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme, ProgressBar } from 'react-native-paper';

interface LinearProgressProps {
  progress: number; // 0 to 1
  height?: number;
  showPercentage?: boolean;
  label?: string;
  color?: string;
  backgroundColor?: string;
}

const LinearProgress: React.FC<LinearProgressProps> = ({
  progress,
  height = 8,
  showPercentage = true,
  label,
  color,
  backgroundColor,
}) => {
  const theme = useTheme();
  const progressColor = color || theme.colors.primary;
  const bgColor = backgroundColor || (theme.dark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)');
  const percentage = Math.min(Math.max(progress || 0, 0), 1) * 100;

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text variant="bodyMedium">{label}</Text>
          {showPercentage && (
            <Text variant="bodyMedium">{Math.round(percentage)}%</Text>
          )}
        </View>
      )}
      <ProgressBar
        progress={progress || 0}
        color={progressColor}
        style={[
          styles.progressBar,
          { 
            height,
            backgroundColor: bgColor
          }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressBar: {
    borderRadius: 4,
    width: '100%',
  },
});

export default LinearProgress;
