import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DebtScreen from '../screens/Debt/DebtScreen';
import AddDebtScreen from '../screens/Debt/AddDebtScreen';
import DebtDetailScreen from '../screens/Debt/DebtDetailScreen';
import EditDebtScreen from '../screens/Debt/EditDebtScreen';

const Stack = createStackNavigator();

const DebtNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="DebtScreen"
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen 
        name="DebtScreen" 
        component={DebtScreen} 
        options={{ title: 'Debt Repayment' }}
      />
      <Stack.Screen 
        name="AddDebt" 
        component={AddDebtScreen} 
        options={{ title: 'Add Debt' }}
      />
      <Stack.Screen 
        name="DebtDetail" 
        component={DebtDetailScreen} 
        options={{ title: 'Debt Details' }}
      />
      <Stack.Screen 
        name="EditDebt" 
        component={EditDebtScreen} 
        options={{ title: 'Edit Debt' }}
      />
    </Stack.Navigator>
  );
};

export default DebtNavigator;
