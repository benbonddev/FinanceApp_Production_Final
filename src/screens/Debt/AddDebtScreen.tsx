import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import TextInput from '../../components/Form/TextInput';
import DatePicker from '../../components/Form/DatePicker';
import Dropdown from '../../components/Form/Dropdown';
import SwitchInput from '../../components/Form/SwitchInput';
import { Debt, RootStackParamList } from '../../types';
import { addDebt } from '../../store/slices/debtSlice';

type AddDebtScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface AddDebtScreenProps {
  navigation: AddDebtScreenNavigationProp;
}

const AddDebtScreen: React.FC<AddDebtScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  
  // Form state
  const [name, setName] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [currentBalance, setCurrentBalance] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [minimumPayment, setMinimumPayment] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState<'loan' | 'credit_card' | 'mortgage' | 'other'>('loan');
  const [notes, setNotes] = useState('');
  
  // Validation state
  const [errors, setErrors] = useState({
    name: '',
    initialAmount: '',
    currentBalance: '',
    interestRate: '',
    minimumPayment: '',
    dueDate: '',
  });
  
  // Handle save
  const handleSave = () => {
    // Validate form
    const newErrors = {
      name: name.trim() === '' ? 'Debt name is required' : '',
      initialAmount: initialAmount.trim() === '' || isNaN(parseFloat(initialAmount)) ? 'Valid amount is required' : '',
      currentBalance: currentBalance.trim() === '' || isNaN(parseFloat(currentBalance)) ? 'Valid amount is required' : '',
      interestRate: interestRate.trim() === '' || isNaN(parseFloat(interestRate)) ? 'Valid rate is required' : '',
      minimumPayment: minimumPayment.trim() === '' || isNaN(parseFloat(minimumPayment)) ? 'Valid payment is required' : '',
      dueDate: dueDate.trim() === '' || isNaN(parseInt(dueDate)) || parseInt(dueDate) < 1 || parseInt(dueDate) > 31 ? 'Valid day (1-31) is required' : '',
    };
    
    setErrors(newErrors);
    
    // Check if there are any errors
    if (Object.values(newErrors).some(error => error !== '')) {
      return;
    }
    
    // Create new debt
    const newDebt: Debt = {
      id: Date.now().toString(), // Simple ID generation for demo
      name,
      initialAmount: parseFloat(initialAmount),
      currentBalance: parseFloat(currentBalance),
      interestRate: parseFloat(interestRate),
      minimumPayment: parseFloat(minimumPayment),
      dueDate: parseInt(dueDate),
      category,
      notes: notes.trim() !== '' ? notes : undefined,
    };
    
    // Dispatch action to add the debt
    dispatch(addDebt(newDebt));
    
    navigation.goBack();
  };
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>Add New Debt</Text>
      
      <TextInput
        label="Debt Name"
        value={name}
        onChangeText={setName}
        placeholder="Enter debt name"
        error={errors.name}
      />
      
      <TextInput
        label="Initial Amount"
        value={initialAmount}
        onChangeText={setInitialAmount}
        placeholder="Enter initial amount"
        keyboardType="numeric"
        leftIcon="currency-usd"
        error={errors.initialAmount}
      />
      
      <TextInput
        label="Current Balance"
        value={currentBalance}
        onChangeText={setCurrentBalance}
        placeholder="Enter current balance"
        keyboardType="numeric"
        leftIcon="currency-usd"
        error={errors.currentBalance}
      />
      
      <TextInput
        label="Interest Rate (%)"
        value={interestRate}
        onChangeText={setInterestRate}
        placeholder="Enter interest rate"
        keyboardType="numeric"
        rightIcon="percent"
        error={errors.interestRate}
      />
      
      <TextInput
        label="Minimum Monthly Payment"
        value={minimumPayment}
        onChangeText={setMinimumPayment}
        placeholder="Enter minimum payment"
        keyboardType="numeric"
        leftIcon="currency-usd"
        error={errors.minimumPayment}
      />
      
      <TextInput
        label="Due Date (Day of Month)"
        value={dueDate}
        onChangeText={setDueDate}
        placeholder="Enter day (1-31)"
        keyboardType="numeric"
        error={errors.dueDate}
      />
      
      <Dropdown
        label="Debt Type"
        value={category}
        options={[
          { label: 'Loan', value: 'loan' },
          { label: 'Credit Card', value: 'credit_card' },
          { label: 'Mortgage', value: 'mortgage' },
          { label: 'Other', value: 'other' },
        ]}
        onSelect={(option) => option && setCategory(option.value as 'loan' | 'credit_card' | 'mortgage' | 'other')}
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

export default AddDebtScreen;
