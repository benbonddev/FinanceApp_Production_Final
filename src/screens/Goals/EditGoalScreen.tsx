import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { selectGoalById, updateGoal } from '../../store/slices/goalsSlice';
import TextInput from '../../components/Form/TextInput';
import DatePicker from '../../components/Form/DatePicker';
import Dropdown from '../../components/Form/Dropdown';
import SwitchInput from '../../components/Form/SwitchInput';
import { Goal, RootStackParamList } from '../../types';

type EditGoalRouteProp = RouteProp<RootStackParamList, 'EditGoal'>;
type EditGoalNavigationProp = StackNavigationProp<RootStackParamList>;

const EditGoalScreen: React.FC = () => {
  const theme = useTheme();
  const route = useRoute<EditGoalRouteProp>();
  const navigation = useNavigation<EditGoalNavigationProp>();
  const dispatch = useAppDispatch();
  const { goalId } = route.params;
  
  const existingGoal = useAppSelector(state => selectGoalById(state, goalId));
  
  // Form state
  const [name, setName] = useState(existingGoal?.name || '');
  const [type, setType] = useState<'emergency_fund' | 'travel' | 'large_purchase' | 'debt_payoff' | 'retirement' | 'custom'>(
    existingGoal?.type || 'emergency_fund'
  );
  const [targetAmount, setTargetAmount] = useState(existingGoal?.targetAmount.toString() || '');
  const [targetDate, setTargetDate] = useState(existingGoal ? new Date(existingGoal.targetDate) : new Date());
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>(existingGoal?.priority || 'medium');
  const [isRecurring, setIsRecurring] = useState(existingGoal?.isRecurring || false);
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'>(
    existingGoal?.recurringFrequency || 'monthly'
  );
  const [notes, setNotes] = useState(existingGoal?.notes || '');
  
  // Validation state
  const [errors, setErrors] = useState({
    name: '',
    targetAmount: '',
  });
  
  // Handle save
  const handleSave = () => {
    // Validate form
    const newErrors = {
      name: name.trim() === '' ? 'Goal name is required' : '',
      targetAmount: targetAmount.trim() === '' || isNaN(parseFloat(targetAmount)) || parseFloat(targetAmount) <= 0 
        ? 'Valid target amount is required' 
        : existingGoal && parseFloat(targetAmount) < existingGoal.currentAmount
          ? 'Target amount cannot be less than current amount'
          : '',
    };
    
    setErrors(newErrors);
    
    // Check if there are any errors
    if (Object.values(newErrors).some(error => error !== '')) {
      return;
    }
    
    if (!existingGoal) {
      navigation.goBack();
      return;
    }
    
    // Update goal
    const updatedGoal: Goal = {
      ...existingGoal,
      name,
      type,
      targetAmount: parseFloat(targetAmount),
      targetDate: targetDate.toISOString(),
      priority,
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
      notes: notes.trim() !== '' ? notes : undefined,
    };
    
    dispatch(updateGoal(updatedGoal));
    navigation.goBack();
  };
  
  if (!existingGoal) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Goal not found
        </Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>Edit Goal</Text>
      
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
      
      <View style={styles.currentAmountContainer}>
        <Text style={styles.currentAmountLabel}>Current Amount:</Text>
        <Text style={styles.currentAmountValue}>${existingGoal.currentAmount.toFixed(2)}</Text>
        <Text style={styles.currentAmountNote}>
          (To add contributions, use the Goal Details screen)
        </Text>
      </View>
      
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
  currentAmountContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    marginVertical: 12,
    padding: 12,
  },
  currentAmountLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  currentAmountNote: {
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  currentAmountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  errorText: {
    fontSize: 16,
    margin: 24,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
});

export default EditGoalScreen;
