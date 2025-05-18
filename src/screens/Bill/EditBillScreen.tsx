import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { selectBillById, updateBill } from '../../store/slices/billsSlice';
import { selectAllPaychecks } from '../../store/slices/paychecksSlice';
import TextInput from '../../components/Form/TextInput';
import DatePicker from '../../components/Form/DatePicker';
import Dropdown from '../../components/Form/Dropdown';
import SwitchInput from '../../components/Form/SwitchInput';
import { Bill, RootStackParamList } from '../../types';
import { parseISO, format } from 'date-fns';
import { logger } from '../../utils/logger';

type EditBillRouteProp = RouteProp<RootStackParamList, 'EditBill'>;
type EditBillNavigationProp = StackNavigationProp<RootStackParamList>;

const EditBillScreen: React.FC = () => {
  const theme = useTheme();
  const route = useRoute<EditBillRouteProp>();
  const navigation = useNavigation<EditBillNavigationProp>();
  const dispatch = useAppDispatch();
  const { billId } = route.params;
  
  const existingBill = useAppSelector(state => selectBillById(state, billId));
  const paychecks = useAppSelector(selectAllPaychecks);
  
  // Form state initialization with error handling
  const [name, setName] = useState(existingBill?.name || '');
  const [amount, setAmount] = useState(() => {
    if (!existingBill?.amount && existingBill?.amount !== 0) return '';
    return existingBill.amount.toString();
  });
  
  const [dueDate, setDueDate] = useState(() => {
    if (!existingBill?.dueDate) return new Date();
    try {
      return parseISO(existingBill.dueDate);
    } catch (error) {
      logger.error(`Error parsing due date: ${error}`);
      return new Date();
    }
  });
  
  const [category, setCategory] = useState(existingBill?.category || '');
  const [isRecurring, setIsRecurring] = useState(existingBill?.isRecurring || false);
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'>(
    existingBill?.recurringFrequency || 'monthly'
  );
  const [isDynamic, setIsDynamic] = useState(existingBill?.isDynamic || false);
  const [payPeriodId, setPayPeriodId] = useState(existingBill?.payPeriodId || '');
  const [notes, setNotes] = useState(existingBill?.notes || '');
  
  // Validation state
  const [errors, setErrors] = useState({
    name: '',
    amount: '',
    category: '',
  });
  
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
    
    if (!existingBill) {
      navigation.goBack();
      return;
    }
    
    // Update bill
    const updatedBill: Bill = {
      ...existingBill,
      name,
      amount: parseFloat(amount),
      dueDate: dueDate.toISOString(),
      category,
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
      isDynamic,
      payPeriodId: payPeriodId || undefined,
      notes: notes.trim() !== '' ? notes : undefined,
    };
    
    dispatch(updateBill(updatedBill));
    navigation.goBack();
  };
  
  if (!existingBill) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Bill not found
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
      <Text style={[styles.title, { color: theme.colors.text }]}>Edit Bill</Text>
      
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
          onSelect={(option) => option && setRecurringFrequency(option.value as any)}
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

export default EditBillScreen;
