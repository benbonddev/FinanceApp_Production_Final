import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import NavigationAnalysisScreen from '../screens/Test/NavigationAnalysisScreen';
import TestScreen from '../screens/Test/TestScreen';
import ChartTest from '../screens/Test/ChartTest';
import ComponentTest from '../../test/ComponentTest';
import PerformanceScreen from '../screens/Performance/PerformanceScreen';
import AppTest from '../../test/AppTest';

const Stack = createStackNavigator();

const TestNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="TestScreen"
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen 
        name="TestScreen" 
        component={TestScreen} 
        options={{ title: 'Test Results' }}
      />
      <Stack.Screen 
        name="NavigationAnalysis" 
        component={NavigationAnalysisScreen} 
        options={{ title: 'Navigation Analysis' }}
      />
      <Stack.Screen 
        name="PerformanceScreen" 
        component={PerformanceScreen} 
        options={{ title: 'Performance' }}
      />
      <Stack.Screen 
        name="ChartTest" 
        component={ChartTest} 
        options={{ title: 'Chart Visualizations' }}
      />
      <Stack.Screen 
        name="ComponentTest" 
        component={ComponentTest} 
        options={{ title: 'Component Tests' }}
      />
      <Stack.Screen 
        name="AppTest" 
        component={AppTest} 
        options={{ title: 'App Test Suite' }}
      />
    </Stack.Navigator>
  );
};

export default TestNavigator;
