import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BillsScreen from '../screens/Bill/BillsScreen';
import AddBillScreen from '../screens/Bill/AddBillScreen';
import EditBillScreen from '../screens/Bill/EditBillScreen';
import BillDetailScreen from '../screens/Bill/BillDetailScreen'; // Ensure this is the correct path and component name

// Define ParamList for this stack if you want type safety
// export type BillsStackParamList = {
//   BillsScreen: undefined;
//   AddBill: undefined; // Or add params if AddBillScreen expects them
//   EditBill: { billId: string };
//   BillDetail: { billId: string };
// };
// const Stack = createStackNavigator<BillsStackParamList>();

const Stack = createStackNavigator(); // Simpler for now

const BillsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="BillsScreen"
      screenOptions={{
        headerShown: true, // Or false if headers are managed differently
      }}
    >
      <Stack.Screen
        name="BillsScreen"
        component={BillsScreen}
        options={{ title: 'Bills' }}
      />
      <Stack.Screen
        name="AddBill"
        component={AddBillScreen}
        options={{ title: 'Add New Bill' }}
      />
      <Stack.Screen
        name="EditBill"
        component={EditBillScreen}
        options={{ title: 'Edit Bill' }}
      />
      <Stack.Screen
        name="BillDetail" // Or BillDetailScreen if that's the component's registered name
        component={BillDetailScreen}
        options={{ title: 'Bill Details' }}
      />
    </Stack.Navigator>
  );
};

export default BillsNavigator;
