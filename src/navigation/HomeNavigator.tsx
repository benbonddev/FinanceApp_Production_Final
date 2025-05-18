import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/Home/HomeScreen';
import BillDetailScreen from '../screens/Bill/BillDetailScreen';
import AddBillScreen from '../screens/Bill/AddBillScreen';
import EditBillScreen from '../screens/Bill/EditBillScreen';

const Stack = createStackNavigator();

const HomeNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen 
        name="HomeScreen" 
        component={HomeScreen} 
        options={{ title: 'Home' }}
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

export default HomeNavigator;
