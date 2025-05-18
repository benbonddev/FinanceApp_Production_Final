import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { selectDebtById, updateDebt } from '../../store/slices/debtSlice';
import TextInput from '../../components/Form/TextInput';
import DatePicker from '../../components/Form/DatePicker';
import Dropdown from '../../components/Form/Dropdown';
import { Debt, RootStackParamList } from '../../types';

type EditDebtRouteProp = RouteProp<RootStackParamList, 'EditDebt'>;
type EditDebtNavigationProp = StackNavigationProp<RootStackParamList>;

const EditDebtScreen: React.FC = () => {
  const theme = useTheme();
  const route = useRoute<EditDebtRouteProp>();
  const navigation = useNavigation<EditDebtNavigationProp>();
  const dispatch = useAppDispatch();
  const { debtId } = route.params;
  
  const existingDebt = useAppSelector(state => selectDebtById(state, debtId));
  
  // Form state
  const [name, setName] = useState(existingDebt?.name || '');
  const [type, setType] = useState<'credit_card' | 'loan' | 'mortgage' | 'student_loan' | 'medical' | 'other'>(
    existingDebt?.type || 'credit_card'
  );
  const [currentBalance, setCurrentBalance] = useState(existingDebt?.currentBalance.toString() || '');
  const [initialAmount, setInitialAmount] = useState(existingDebt?.initialAmount.toString() || '');
  const [interestRate, setInterestRate] = useState(existingDebt?.interestRate.toString() || '');
  const [minimumPayment, setMinimumPayment] = useState(existingDebt?.minimumPayment.toString() || '');
  const [dueDay, setDueDay] = useState(existingDebt?.dueDay.toString() || '');
  const [notes, setNotes] = useState(existingDebt?.notes || '');
  
  // Validation state
  const [errors, setErrors] = useState({
    name: '',
    currentBalance: '',
    initialAmount: '',
    interestRate: '',
    minimumPayment: '',
    dueDay: '',
  });
  
  // Handle save
  const handleSave = () => {
    // Validate form
    const newErrors = {
      name: name.trim() === '' ? 'Debt name is required' : '',
      currentBalance: currentBalance.trim() === '' || isNaN(parseFloat(currentBalance)) ? 'Valid current balance is required' : '',
      initialAmount: initialAmount.trim() === '' || isNaN(parseFloat(initialAmount)) ? 'Valid initial amount is required' : '',
      interestRate: interestRate.trim() === '' || isNaN(parseFloat(interestRate)) ? 'Valid interest rate is required' : '',
      minimumPayment: minimumPayment.trim() === '' || isNaN(parseFloat(minimumPayment)) ? 'Valid minimum payment is required' : '',
      dueDay: dueDay.trim() === '' || isNaN(parseInt(dueDay)) || parseInt(dueDay) < 1 || parseInt(dueDay) > 31 ? 'Valid due day (1-31) is required' : '',
    };
    
    setErrors(newErrors);
    
    // Check if there are any errors
    if (Object.values(newErrors).some(error => error !== '')) {
      return;
    }
    
    if (!existingDebt) {
      navigation.goBack();
      return;
    }
    
    // Update debt
    const updatedDebt: Debt = {
      ...existingDebt,
      name,
      type,
      currentBalance: parseFloat(currentBalance),
      initialAmount: parseFloat(initialAmount),
      interestRate: parseFloat(interestRate),
      minimumPayment: parseFloat(minimumPayment),
      dueDay: parseInt(dueDay),
      notes: notes.trim() !== '' ? notes : undefined,
    };
    
    dispatch(updateDebt(updatedDebt));
    navigation.goBack();
  };
  
  if (!existingDebt) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Debt not found
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
      <Text style={[styles.title, { color: theme.colors.text }]}>Edit Debt</Text>
      
      <TextInput
        label="Debt Name"
        value={name}
        onChangeText={setName}
        placeholder="Enter debt name"
        error={errors.name}
      />
      
      <Dropdown
        label="Debt Type"
        value={type}
        options={[
          { label: 'Credit Card', value: 'credit_card' },
          { label: 'Loan', value: 'loan' },
          { label: 'Mortgage', value: 'mortgage' },
          { label: 'Student Loan', value: 'student_loan' },
          { label: 'Medical', value: 'medical' },
          { label: 'Other', value: 'other' },
        ]}
        onSelect={(option) => setType(option.value as any)}
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
        label="Initial Amount"
        value={initialAmount}
        onChangeText={setInitialAmount}
        placeholder="Enter initial amount"
        keyboardType="numeric"
        leftIcon="currency-usd"
        error={errors.initialAmount}
      />
      
      <TextInput
        label="Interest Rate (%)"
        value={interestRate}
        onChangeText={setInterestRate}
        placeholder="Enter interest rate"
        keyboardType="numeric"
        leftIcon="percent"
        error={errors.interestRate}
      />
      
      <TextInput
        label="Minimum Payment"
        value={minimumPayment}
        onChangeText={setMinimumPayment}
        placeholder="Enter minimum payment"
        keyboardType="numeric"
        leftIcon="currency-usd"
        error={errors.minimumPayment}
      />
      
      <TextInput
        label="Due Day (1-31)"
        value={dueDay}
        onChangeText={setDueDay}
        placeholder="Enter due day of month"
        keyboardType="numeric"
        leftIcon="calendar"
        error={errors.dueDay}
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

export default EditDebtScreen;
