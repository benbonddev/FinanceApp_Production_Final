import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme, Switch } from 'react-native-paper';

interface SwitchInputProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  description?: string;
  disabled?: boolean;
}

const SwitchInput: React.FC<SwitchInputProps> = ({
  label,
  value,
  onValueChange,
  description,
  disabled = false,
}) => {
  const theme = useTheme();
  
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.textContainer}>
          <Text 
            variant="bodyLarge" 
            style={[
              styles.label, 
              { color: disabled ? theme.colors.onSurfaceDisabled : theme.colors.onSurface }
            ]}
          >
            {label}
          </Text>
          {description && (
            <Text 
              variant="bodySmall" 
              style={[
                styles.description, 
                { color: disabled ? theme.colors.onSurfaceDisabled : theme.colors.onSurfaceVariant }
              ]}
            >
              {description}
            </Text>
          )}
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          color={theme.colors.primary}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  description: {
    marginTop: 2,
  },
  label: {
    fontWeight: '500',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
});

export default SwitchInput;
