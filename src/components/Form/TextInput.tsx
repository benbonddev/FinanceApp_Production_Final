import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, useTheme, TextInput as PaperTextInput } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
  icon?: string;
  leftIcon?: string;
  rightIcon?: string;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  disabled?: boolean;
  right?: React.ReactNode;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  icon,
  leftIcon,
  rightIcon,
  error,
  multiline = false,
  numberOfLines = 1,
  disabled = false,
  right,
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  
  // Use leftIcon if provided, otherwise fall back to icon
  const iconToUse = leftIcon || icon;
  
  return (
    <View style={styles.container}>
      <PaperTextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        mode="outlined"
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : undefined}
        disabled={disabled}
        error={!!error}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        left={iconToUse ? (
          <PaperTextInput.Icon 
            icon={() => (
              <MaterialCommunityIcons 
                name={iconToUse} 
                size={24} 
                color={
                  error 
                    ? theme.colors.error 
                    : isFocused 
                      ? theme.colors.primary 
                      : theme.colors.onSurfaceVariant
                } 
              />
            )} 
          />
        ) : undefined}
        right={rightIcon ? (
          <PaperTextInput.Icon 
            icon={() => (
              <MaterialCommunityIcons 
                name={rightIcon} 
                size={24} 
                color={
                  error 
                    ? theme.colors.error 
                    : isFocused 
                      ? theme.colors.primary 
                      : theme.colors.onSurfaceVariant
                } 
              />
            )} 
          />
        ) : right}
        style={styles.input}
        outlineStyle={{ borderRadius: theme.roundness }}
      />
      {error && (
        <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  errorText: {
    marginLeft: 12,
    marginTop: 4,
  },
  input: {
    width: '100%',
  },
});

export default TextInput;
