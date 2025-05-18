import React, { useState } from 'react';
import { StyleSheet, View, Platform, GestureResponderEvent } from 'react-native';
import { Text, useTheme, TouchableRipple } from 'react-native-paper';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format, parseISO } from 'date-fns';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { logger } from '../../utils/logger';

interface DatePickerProps {
  label: string;
  value: string | Date | null; // ISO string or Date object
  onChange: (date: Date) => void;
  error?: string;
  disabled?: boolean;
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  maximumDate?: Date;
}

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  error,
  disabled = false,
  mode = 'date',
  minimumDate,
  maximumDate,
}) => {
  const theme = useTheme();
  const [show, setShow] = useState(false);
  
  // Convert value to Date object if it's a string
  const dateValue = React.useMemo(() => {
    if (!value) return new Date();
    
    if (typeof value === 'string') {
      try {
        return parseISO(value);
      } catch (err) {
        logger.error(`Error parsing date string: ${err}`);
        return new Date();
      }
    }
    
    return value;
  }, [value]);
  
  // Format the date for display
  const displayFormat = mode === 'time' 
    ? 'h:mm a' 
    : mode === 'datetime' 
      ? 'MMM d, yyyy h:mm a' 
      : 'MMM d, yyyy';
  
  const formattedDate = React.useMemo(() => {
    try {
      return format(dateValue, displayFormat);
    } catch (err) {
      logger.error(`Error formatting date: ${err}`);
      return 'Invalid date';
    }
  }, [dateValue, displayFormat]);
  
  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text 
        variant="bodyMedium" 
        style={[
          styles.label, 
          { color: error ? theme.colors.error : theme.colors.onSurface }
        ]}
      >
        {label}
      </Text>
      <TouchableRipple
        onPress={() => !disabled && setShow(true)}
        disabled={disabled}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.surface,
            borderColor: error 
              ? theme.colors.error 
              : theme.colors.outline,
            borderRadius: theme.roundness,
          },
          disabled && styles.disabled
        ]}
      >
        <View style={styles.inputContent}>
          <Text 
            variant="bodyLarge" 
            style={[
              styles.dateText,
              { color: disabled ? theme.colors.onSurfaceDisabled : theme.colors.onSurface }
            ]}
          >
            {formattedDate}
          </Text>
          <MaterialCommunityIcons 
            name="calendar" 
            size={24} 
            color={disabled ? theme.colors.onSurfaceDisabled : theme.colors.onSurfaceVariant} 
          />
        </View>
      </TouchableRipple>
      {error && (
        <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={dateValue}
          mode={mode}
          is24Hour={false}
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  dateText: {
    flex: 1,
  },
  disabled: {
    opacity: 0.6,
  },
  errorText: {
    marginLeft: 12,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    padding: 12,
  },
  inputContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    marginBottom: 4,
  },
});

export default DatePicker;
