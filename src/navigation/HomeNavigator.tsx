import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/Home/HomeScreen';
// BillDetailScreen, AddBillScreen, and EditBillScreen imports are removed as they are no longer used here.

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
      {/* Bill related screens are now managed by BillsNavigator */}
    </Stack.Navigator>
  );
};

export default HomeNavigator;
