import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { selectPaycheckById, updatePaycheck } from '../../store/slices/paychecksSlice';
import TextInput from '../../components/Form/TextInput';
import DatePicker from '../../components/Form/DatePicker';
import Dropdown from '../../components/Form/Dropdown';
import SwitchInput from '../../components/Form/SwitchInput';
import { Paycheck, RootStackParamList } from '../../types';
import { parseISO } from 'date-fns';

type EditPaycheckRouteProp = RouteProp<RootStackParamList, 'EditPaycheck'>;
type EditPaycheckNavigationProp = StackNavigationProp<RootStackParamList>;

const EditPaycheckScreen: React.FC = () => {
  const theme = useTheme();
  const route = useRoute<EditPaycheckRouteProp>();
  const navigation = useNavigation<EditPaycheckNavigationProp>();
  const dispatch = useAppDispatch();
  const { paycheckId } = route.params;
  
  const existingPaycheck = useAppSelector(state => selectPaycheckById(state, paycheckId));
  
  // Form state
  const [name, setName] = useState(existingPaycheck?.name || '');
  const [amount, setAmount] = useState(existingPaycheck?.amount.toString() || '');
  const [date, setDate] = useState(existingPaycheck ? parseISO(existingPaycheck.date) : new Date());
  const [owner, setOwner] = useState(existingPaycheck?.owner || '');
  const [isRecurring, setIsRecurring] = useState(existingPaycheck?.isRecurring || false);
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>(
    existingPaycheck?.recurringFrequency || 'biweekly'
  );
  const [forSavings, setForSavings] = useState(existingPaycheck?.forSavings || false);
  const [notes, setNotes] = useState(existingPaycheck?.notes || '');
  
  // Validation state
  const [errors, setErrors] = useState({
    name: '',
    amount: '',
    owner: '',
  });
  
  // Handle save
  const handleSave = () => {
    // Validate form
    const newErrors = {
      name: name.trim() === '' ? 'Paycheck name is required' : '',
      amount: amount.trim() === '' || isNaN(parseFloat(amount)) ? 'Valid amount is required' : '',
      owner: owner.trim() === '' ? 'Owner name is required' : '',
    };
    
    setErrors(newErrors);
    
    // Check if there are any errors
    if (Object.values(newErrors).some(error => error !== '')) {
      return;
    }
    
    if (!existingPaycheck) {
      navigation.goBack();
      return;
    }
    
    // Update paycheck
    const updatedPaycheck: Paycheck = {
      ...existingPaycheck,
      name,
      amount: parseFloat(amount),
      date: date.toISOString(),
      owner,
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
      forSavings,
      notes: notes.trim() !== '' ? notes : undefined,
    };
    
    dispatch(updatePaycheck(updatedPaycheck));
    navigation.goBack();
  };
  
  if (!existingPaycheck) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Paycheck not found
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
      <Text style={[styles.title, { color: theme.colors.text }]}>Edit Paycheck</Text>
      
      <TextInput
        label="Paycheck Name"
        value={name}
        onChangeText={setName}
        placeholder="Enter paycheck name"
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
        label="Pay Date"
        value={date}
        onChange={setDate}
      />
      
      <TextInput
        label="Owner"
        value={owner}
        onChangeText={setOwner}
        placeholder="Enter paycheck owner"
        error={errors.owner}
      />
      
      <SwitchInput
        label="Recurring Paycheck"
        value={isRecurring}
        onValueChange={setIsRecurring}
        description="This paycheck repeats on a regular schedule"
      />
      
      {isRecurring && (
        <Dropdown
          label="Frequency"
          value={recurringFrequency}
          options={[
            { label: 'Weekly', value: 'weekly' },
            { label: 'Bi-weekly', value: 'biweekly' },
            { label: 'Monthly', value: 'monthly' },
          ]}
          onSelect={(option) => setRecurringFrequency(option.value as any)}
        />
      )}
      
      <SwitchInput
        label="For Savings"
        value={forSavings}
        onValueChange={setForSavings}
        description="This income is dedicated to savings and won't be used for bills"
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

export default EditPaycheckScreen;
