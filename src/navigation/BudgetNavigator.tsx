import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BudgetScreen from '../screens/Budget/BudgetScreen';
import AddBudgetScreen from '../screens/Budget/AddBudgetScreen';
import BudgetDetailScreen from '../screens/Budget/BudgetDetailScreen';
import EditBudgetScreen from '../screens/Budget/EditBudgetScreen';
import BillDetailScreen from '../screens/Bill/BillDetailScreen';
import AddBillScreen from '../screens/Bill/AddBillScreen';
import EditBillScreen from '../screens/Bill/EditBillScreen';

const Stack = createStackNavigator();

const BudgetNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="BudgetScreen"
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen 
        name="BudgetScreen" 
        component={BudgetScreen} 
        options={{ title: 'Budget' }}
      />
      <Stack.Screen 
        name="AddBudget" 
        component={AddBudgetScreen} 
        options={{ title: 'Add Budget Category' }}
      />
      <Stack.Screen 
        name="BudgetDetail" 
        component={BudgetDetailScreen} 
        options={{ title: 'Budget Details' }}
      />
      <Stack.Screen 
        name="EditBudget" 
        component={EditBudgetScreen} 
        options={{ title: 'Edit Budget' }}
      />
      <Stack.Screen 
        name="BillDetail" 
        component={BillDetailScreen} 
        options={{ title: 'Bill Details' }}
      />
      <Stack.Screen 
        name="AddBill" 
        component={AddBillScreen} 
        options={{ title: 'Add Bill' }}
      />
      <Stack.Screen 
        name="EditBill" 
        component={EditBillScreen} 
        options={{ title: 'Edit Bill' }}
      />
    </Stack.Navigator>
  );
};

export default BudgetNavigator;
