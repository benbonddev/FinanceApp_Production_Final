import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import GoalsScreen from '../screens/Goals/GoalsScreen';
import AddGoalScreen from '../screens/Goals/AddGoalScreen';
import GoalDetailScreen from '../screens/Goals/GoalDetailScreen';
import EditGoalScreen from '../screens/Goals/EditGoalScreen';

const Stack = createStackNavigator();

const GoalsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="GoalsScreen"
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen 
        name="GoalsScreen" 
        component={GoalsScreen} 
        options={{ title: 'Financial Goals' }}
      />
      <Stack.Screen 
        name="AddGoal" 
        component={AddGoalScreen} 
        options={{ title: 'Add Goal' }}
      />
      <Stack.Screen 
        name="GoalDetail" 
        component={GoalDetailScreen} 
        options={{ title: 'Goal Details' }}
      />
      <Stack.Screen 
        name="EditGoal" 
        component={EditGoalScreen} 
        options={{ title: 'Edit Goal' }}
      />
    </Stack.Navigator>
  );
};

export default GoalsNavigator;
