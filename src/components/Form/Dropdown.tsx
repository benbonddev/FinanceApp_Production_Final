import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface DropdownOption {
  label: string;
  value: string | number;
}

interface DropdownProps {
  label?: string;
  value?: string | number;
  options: DropdownOption[];
  onSelect: (option: DropdownOption) => void;
  error?: string;
  placeholder?: string;
  containerStyle?: object;
  onPress?: () => void; // To open custom dropdown modal
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  value,
  options,
  onSelect,
  error,
  placeholder = 'Select an option',
  containerStyle,
  onPress,
}) => {
  const theme = useTheme();

  // Find the selected option
  const selectedOption = options.find(option => option.value === value);

  // Handle press - either use the provided onPress or implement default behavior
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Default behavior would be implemented here
      // For a real implementation, we would show a modal with options
      // In production, we'll use a no-op as placeholder
      options.length > 0 && onSelect(options[0]);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>}
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.inputContainer,
          {
            borderColor: error ? theme.colors.error : theme.colors.disabled,
            backgroundColor: theme.dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          },
        ]}
      >
        <Text 
          style={[
            styles.valueText, 
            { 
              color: selectedOption ? theme.colors.text : theme.colors.placeholder 
            }
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <MaterialCommunityIcons
          name="chevron-down"
          size={20}
          color={theme.colors.text}
          style={styles.icon}
        />
      </TouchableOpacity>
      {error && <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
  icon: {
    marginLeft: 8,
  },
  inputContainer: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    height: 48,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  valueText: {
    flex: 1,
    fontSize: 16,
  },
});

export default Dropdown;
