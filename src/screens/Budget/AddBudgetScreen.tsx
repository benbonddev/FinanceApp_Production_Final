import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { addBudget } from '../../store/slices/budgetSlice';
import TextInput from '../../components/Form/TextInput';
import SwitchInput from '../../components/Form/SwitchInput';
import { Budget, RootStackParamList } from '../../types';

type AddBudgetNavigationProp = StackNavigationProp<RootStackParamList>;

const AddBudgetScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<AddBudgetNavigationProp>();
  
  // Form state
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [limit, setLimit] = useState('');
  const [isEssential, setIsEssential] = useState(false);
  const [notes, setNotes] = useState('');
  
  // Validation state
  const [errors, setErrors] = useState({
    category: '',
    limit: '',
  });
  
  // Handle save
  const handleSave = () => {
    // Validate form
    const newErrors = {
      category: category.trim() === '' ? 'Category is required' : '',
      limit: limit.trim() === '' || isNaN(parseFloat(limit)) ? 'Valid limit is required' : '',
    };
    
    setErrors(newErrors);
    
    // Check if there are any errors
    if (Object.values(newErrors).some(error => error !== '')) {
      return;
    }
    
    // Create new budget
    const newBudget: Budget = {
      id: Date.now().toString(), // Simple ID generation for demo
      category,
      description: description.trim() !== '' ? description : undefined,
      limit: parseFloat(limit),
      spent: 0, // Initialize with zero spent
      isEssential,
      notes: notes.trim() !== '' ? notes : undefined,
    };
    
    dispatch(addBudget(newBudget));
    navigation.goBack();
  };
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>Add New Budget</Text>
      
      <TextInput
        label="Category"
        value={category}
        onChangeText={setCategory}
        placeholder="Enter budget category (e.g., Housing, Food)"
        error={errors.category}
      />
      
      <TextInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Enter a brief description (optional)"
      />
      
      <TextInput
        label="Monthly Limit"
        value={limit}
        onChangeText={setLimit}
        placeholder="Enter monthly budget limit"
        keyboardType="numeric"
        leftIcon="currency-usd"
        error={errors.limit}
      />
      
      <SwitchInput
        label="Essential Expense"
        value={isEssential}
        onValueChange={setIsEssential}
        description="This budget category covers essential living expenses"
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

export default AddBudgetScreen;
