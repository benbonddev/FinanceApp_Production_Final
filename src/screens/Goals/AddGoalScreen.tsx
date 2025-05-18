import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { addGoal } from '../../store/slices/goalsSlice';
import TextInput from '../../components/Form/TextInput';
import DatePicker from '../../components/Form/DatePicker';
import Dropdown from '../../components/Form/Dropdown';
import SwitchInput from '../../components/Form/SwitchInput';
import { Goal, RootStackParamList } from '../../types';
import { addMonths } from 'date-fns';

type AddGoalNavigationProp = StackNavigationProp<RootStackParamList>;

const AddGoalScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<AddGoalNavigationProp>();
  
  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<'emergency_fund' | 'travel' | 'large_purchase' | 'debt_payoff' | 'retirement' | 'custom'>(
    'emergency_fund'
  );
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [targetDate, setTargetDate] = useState(addMonths(new Date(), 12));
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'>(
    'monthly'
  );
  const [notes, setNotes] = useState('');
  
  // Validation state
  const [errors, setErrors] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
  });
  
  // Handle save
  const handleSave = () => {
    // Validate form
    const newErrors = {
      name: name.trim() === '' ? 'Goal name is required' : '',
      targetAmount: targetAmount.trim() === '' || isNaN(parseFloat(targetAmount)) || parseFloat(targetAmount) <= 0 
        ? 'Valid target amount is required' 
        : '',
      currentAmount: currentAmount.trim() === '' || isNaN(parseFloat(currentAmount)) || parseFloat(currentAmount) < 0
        ? 'Valid current amount is required'
        : parseFloat(currentAmount) > parseFloat(targetAmount)
          ? 'Current amount cannot exceed target amount'
          : '',
    };
    
    setErrors(newErrors);
    
    // Check if there are any errors
    if (Object.values(newErrors).some(error => error !== '')) {
      return;
    }
    
    // Create new goal
    const newGoal: Goal = {
      id: Date.now().toString(), // Simple ID generation for demo
      name,
      type,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount),
      targetDate: targetDate.toISOString(),
      priority,
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
      contributionHistory: currentAmount && parseFloat(currentAmount) > 0 
        ? [{ amount: parseFloat(currentAmount), date: new Date().toISOString() }]
        : [],
      notes: notes.trim() !== '' ? notes : undefined,
    };
    
    dispatch(addGoal(newGoal));
    navigation.goBack();
  };
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>Add New Goal</Text>
      
      <TextInput
        label="Goal Name"
        value={name}
        onChangeText={setName}
        placeholder="Enter goal name"
        error={errors.name}
      />
      
      <Dropdown
        label="Goal Type"
        value={type}
        options={[
          { label: 'Emergency Fund', value: 'emergency_fund' },
          { label: 'Travel', value: 'travel' },
          { label: 'Large Purchase', value: 'large_purchase' },
          { label: 'Debt Payoff', value: 'debt_payoff' },
          { label: 'Retirement', value: 'retirement' },
          { label: 'Custom', value: 'custom' },
        ]}
        onSelect={(option) => setType(option.value as any)}
      />
      
      <TextInput
        label="Target Amount"
        value={targetAmount}
        onChangeText={setTargetAmount}
        placeholder="Enter target amount"
        keyboardType="numeric"
        leftIcon="currency-usd"
        error={errors.targetAmount}
      />
      
      <TextInput
        label="Current Amount (if any)"
        value={currentAmount}
        onChangeText={setCurrentAmount}
        placeholder="Enter current amount"
        keyboardType="numeric"
        leftIcon="currency-usd"
        error={errors.currentAmount}
      />
      
      <DatePicker
        label="Target Date"
        value={targetDate}
        onChange={setTargetDate}
        minimumDate={new Date()}
      />
      
      <Dropdown
        label="Priority"
        value={priority}
        options={[
          { label: 'High', value: 'high' },
          { label: 'Medium', value: 'medium' },
          { label: 'Low', value: 'low' },
        ]}
        onSelect={(option) => setPriority(option.value as any)}
      />
      
      <SwitchInput
        label="Recurring Goal"
        value={isRecurring}
        onValueChange={setIsRecurring}
        description="This goal repeats on a regular schedule"
      />
      
      {isRecurring && (
        <Dropdown
          label="Frequency"
          value={recurringFrequency}
          options={[
            { label: 'Weekly', value: 'weekly' },
            { label: 'Bi-weekly', value: 'biweekly' },
            { label: 'Monthly', value: 'monthly' },
            { label: 'Quarterly', value: 'quarterly' },
            { label: 'Yearly', value: 'yearly' },
          ]}
          onSelect={(option) => setRecurringFrequency(option.value as any)}
        />
      )}
      
      <TextInput
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        placeholder="Add notes (optional)"
        multiline
        numberOfLines={3}
      />
      
      <View style={styles.actions}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.button}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.button}
        >
          Save
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
});

export default AddGoalScreen;
