import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme, Button } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { selectBudgetById, updateBudget } from '../../store/slices/budgetSlice';
import TextInput from '../../components/Form/TextInput';
import SwitchInput from '../../components/Form/SwitchInput';
import { Budget, RootStackParamList } from '../../types';

type EditBudgetRouteProp = RouteProp<RootStackParamList, 'EditBudget'>;
type EditBudgetNavigationProp = StackNavigationProp<RootStackParamList>;

const EditBudgetScreen: React.FC = () => {
  const theme = useTheme();
  const route = useRoute<EditBudgetRouteProp>();
  const navigation = useNavigation<EditBudgetNavigationProp>();
  const dispatch = useAppDispatch();
  const { budgetId } = route.params;
  
  const existingBudget = useAppSelector(state => selectBudgetById(state, budgetId));
  
  // Form state
  const [category, setCategory] = useState(existingBudget?.category || '');
  const [description, setDescription] = useState(existingBudget?.description || '');
  const [limit, setLimit] = useState(existingBudget?.limit.toString() || '');
  const [isEssential, setIsEssential] = useState(existingBudget?.isEssential || false);
  const [notes, setNotes] = useState(existingBudget?.notes || '');
  
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
    
    if (!existingBudget) {
      navigation.goBack();
      return;
    }
    
    // Update budget
    const updatedBudget: Budget = {
      ...existingBudget,
      category,
      description: description.trim() !== '' ? description : undefined,
      limit: parseFloat(limit),
      isEssential,
      notes: notes.trim() !== '' ? notes : undefined,
    };
    
    dispatch(updateBudget(updatedBudget));
    navigation.goBack();
  };
  
  if (!existingBudget) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Budget not found
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
      <Text style={[styles.title, { color: theme.colors.text }]}>Edit Budget</Text>
      
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

export default EditBudgetScreen;
