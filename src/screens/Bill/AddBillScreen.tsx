import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { addBill } from '../../store/slices/billsSlice';
import { selectAllPaychecks } from '../../store/slices/paychecksSlice';
import TextInput from '../../components/Form/TextInput';
import DatePicker from '../../components/Form/DatePicker';
import Dropdown from '../../components/Form/Dropdown';
import SwitchInput from '../../components/Form/SwitchInput';
import { Bill, RootStackParamList } from '../../types';
import { format, parseISO } from 'date-fns';
import { logger } from '../../utils/logger';

type AddBillScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface AddBillScreenProps {
  navigation: AddBillScreenNavigationProp;
}

const AddBillScreen: React.FC<AddBillScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const paychecks = useAppSelector(selectAllPaychecks);
  
  // Form state
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [category, setCategory] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [notes, setNotes] = useState('');
  const [isDynamic, setIsDynamic] = useState(false);
  const [payPeriodId, setPayPeriodId] = useState('');
  
  // Validation state
  const [errors, setErrors] = useState({
    name: '',
    amount: '',
    category: '',
  });
  
  // Handle save
  const handleSave = () => {
    // Validate form
    const newErrors = {
      name: name.trim() === '' ? 'Bill name is required' : '',
      amount: amount.trim() === '' || isNaN(parseFloat(amount)) ? 'Valid amount is required' : '',
      category: category.trim() === '' ? 'Category is required' : '',
    };
    
    setErrors(newErrors);
    
    // Check if there are any errors
    if (Object.values(newErrors).some(error => error !== '')) {
      return;
    }
    
    // Create new bill
    const newBill: Bill = {
      id: Date.now().toString(), // Simple ID generation for demo
      name,
      amount: parseFloat(amount),
      dueDate: dueDate.toISOString(),
      isPaid: false,
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
      category,
      notes: notes.trim() !== '' ? notes : undefined,
      isDynamic,
      payPeriodId: payPeriodId !== '' ? payPeriodId : undefined,
    };
    
    dispatch(addBill(newBill));
    navigation.goBack();
  };
  
  // Format paycheck dates with error handling
  const getFormattedPaycheckOptions = () => {
    return paychecks.map(paycheck => {
      let formattedDate = 'Unknown date';
      try {
        if (paycheck.date) {
          formattedDate = format(parseISO(paycheck.date), 'MMM d, yyyy');
        }
      } catch (error) {
        logger.error(`Error formatting paycheck date: ${error}`);
        formattedDate = 'Invalid date';
      }
      
      return {
        label: `${paycheck.name || 'Unnamed'} - ${formattedDate}`,
        value: paycheck.id || '',
      };
    });
  };
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>Add New Bill</Text>
      
      <TextInput
        label="Bill Name"
        value={name}
        onChangeText={setName}
        placeholder="Enter bill name"
        error={errors.name}
      />
      
      <TextInput
        label="Amount"
        value={amount}
        onChangeText={setAmount}
        placeholder="Enter amount"
        keyboardType="numeric"
        leftIcon="currency-usd"
        error={errors.amount}
      />
      
      <DatePicker
        label="Due Date"
        value={dueDate}
        onChange={setDueDate}
      />
      
      <TextInput
        label="Category"
        value={category}
        onChangeText={setCategory}
        placeholder="Enter category (e.g., Housing, Utilities)"
        error={errors.category}
      />
      
      <SwitchInput
        label="Recurring Bill"
        value={isRecurring}
        onValueChange={setIsRecurring}
        description="This bill repeats on a regular schedule"
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
          onSelect={(option) => option && setRecurringFrequency(option.value as 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly')}
        />
      )}
      
      <SwitchInput
        label="Dynamic Amount"
        value={isDynamic}
        onValueChange={setIsDynamic}
        description="Bill amount varies each period (like utilities)"
      />
      
      <Dropdown
        label="Assign to Paycheck"
        value={payPeriodId}
        options={getFormattedPaycheckOptions()}
        onSelect={(option) => option && setPayPeriodId(option.value as string)}
        placeholder="Select a paycheck"
      />
      
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

export default AddBillScreen;
