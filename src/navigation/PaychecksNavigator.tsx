import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PaychecksScreen from '../screens/Paychecks/PaychecksScreen';
import AddPaycheckScreen from '../screens/Paychecks/AddPaycheckScreen';
import PaycheckDetail from '../screens/Paychecks/PaycheckDetail';
import EditPaycheckScreen from '../screens/Paychecks/EditPaycheckScreen';
import BillDetailScreen from '../screens/Bill/BillDetailScreen';
import AddBillScreen from '../screens/Bill/AddBillScreen';
import EditBillScreen from '../screens/Bill/EditBillScreen';

const Stack = createStackNavigator();

const PaychecksNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="PaychecksScreen"
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen 
        name="PaychecksScreen" 
        component={PaychecksScreen} 
        options={{ title: 'Paychecks' }}
      />
      <Stack.Screen 
        name="AddPaycheck" 
        component={AddPaycheckScreen} 
        options={{ title: 'Add Paycheck' }}
      />
      <Stack.Screen 
        name="PaycheckDetail" 
        component={PaycheckDetail} 
        options={{ title: 'Paycheck Details' }}
      />
      <Stack.Screen 
        name="EditPaycheck" 
        component={EditPaycheckScreen} 
        options={{ title: 'Edit Paycheck' }}
      />
      {/* Bill related screens are now managed by BillsNavigator */}
    </Stack.Navigator>
  );
};

export default PaychecksNavigator;
