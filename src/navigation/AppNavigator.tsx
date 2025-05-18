import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Import navigators
import HomeNavigator from './HomeNavigator';
import PaychecksNavigator from './PaychecksNavigator';
import BudgetNavigator from './BudgetNavigator';
import DebtNavigator from './DebtNavigator';
import GoalsNavigator from './GoalsNavigator';
import SettingsNavigator from './SettingsNavigator';
import TestNavigator from './TestNavigator';

const Tab = createBottomTabNavigator();

const AppNavigator: React.FC = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Paychecks"
        component={PaychecksNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="cash" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Budget"
        component={BudgetNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="chart-pie" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Debt"
        component={DebtNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="credit-card" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Goals"
        component={GoalsNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="flag" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="cog" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Test"
        component={TestNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="test-tube" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
