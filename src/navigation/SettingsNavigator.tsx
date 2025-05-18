import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import ThemePreviewScreen from '../screens/Settings/ThemePreviewScreen';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';
import TermsOfServiceScreen from '../screens/Settings/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../screens/Settings/PrivacyPolicyScreen';

const Stack = createStackNavigator();

const SettingsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="SettingsScreen"
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen 
        name="SettingsScreen" 
        component={SettingsScreen} 
        options={{ title: 'Settings' }}
      />
      <Stack.Screen 
        name="ThemePreviewScreen" 
        component={ThemePreviewScreen} 
        options={{ title: 'Theme Preview' }}
      />
      <Stack.Screen 
        name="NotificationsScreen" 
        component={NotificationsScreen} 
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen 
        name="TermsOfServiceScreen" 
        component={TermsOfServiceScreen} 
        options={{ title: 'Terms of Service' }}
      />
      <Stack.Screen 
        name="PrivacyPolicyScreen" 
        component={PrivacyPolicyScreen} 
        options={{ title: 'Privacy Policy' }}
      />
    </Stack.Navigator>
  );
};

export default SettingsNavigator;
