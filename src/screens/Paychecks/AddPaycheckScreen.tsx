import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { addPaycheck } from '../../store/slices/paychecksSlice';
import TextInput from '../../components/Form/TextInput';
import DatePicker from '../../components/Form/DatePicker';
import Dropdown from '../../components/Form/Dropdown';
import SwitchInput from '../../components/Form/SwitchInput';
import { Paycheck, RootStackParamList } from '../../types';

type AddPaycheckScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface AddPaycheckScreenProps {
  navigation: AddPaycheckScreenNavigationProp;
}

const AddPaycheckScreen: React.FC<AddPaycheckScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  
  // Form state
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [owner, setOwner] = useState('');
  const [isRecurring, setIsRecurring] = useState(true);
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('biweekly');
  const [forSavings, setForSavings] = useState(false);
  const [notes, setNotes] = useState('');
  
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
    
    // Create new paycheck
    const newPaycheck: Paycheck = {
      id: Date.now().toString(), // Simple ID generation for demo
      name,
      amount: parseFloat(amount),
      date: date.toISOString(),
      owner,
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
      forSavings,
      notes: notes.trim() !== '' ? notes : undefined,
    };
    
    dispatch(addPaycheck(newPaycheck));
    navigation.goBack();
  };
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>Add New Paycheck</Text>
      
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
          onSelect={(option) => option && setRecurringFrequency(option.value as 'weekly' | 'biweekly' | 'monthly')}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
});

export default AddPaycheckScreen;
