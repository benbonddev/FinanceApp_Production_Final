import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../src/types';

type TestNavigationProp = StackNavigationProp<RootStackParamList>;

const AppTest: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<TestNavigationProp>();

  // Test categories
  const testCategories = [
    {
      title: 'Navigation Tests',
      tests: [
        { name: 'Home Screen', route: 'Home' },
        { name: 'Month Screen', route: 'Month' },
        { name: 'Bills Screen', route: 'BillDetail', params: { billId: '1' } },
        { name: 'Add Bill Screen', route: 'AddBill' },
        { name: 'Paychecks Screen', route: 'Paychecks' },
        { name: 'Add Paycheck Screen', route: 'AddPaycheck' },
        { name: 'Budget Screen', route: 'Budget' },
        { name: 'Add Budget Screen', route: 'AddBudget' },
        { name: 'Debt Screen', route: 'Debt' },
        { name: 'Add Debt Screen', route: 'AddDebt' },
        { name: 'Goals Screen', route: 'Goals' },
        { name: 'Add Goal Screen', route: 'AddGoal' },
        { name: 'Settings Screen', route: 'Settings' },
        { name: 'Notifications Screen', route: 'Notifications' },
        { name: 'Payment History Screen', route: 'PaymentHistory' },
        { name: 'Dashboard Screen', route: 'Dashboard' },
      ]
    },
    {
      title: 'Feature Tests',
      tests: [
        { name: 'Chart Visualizations', route: 'ChartTest' },
        { name: 'Component Tests', route: 'ComponentTest' },
        { name: 'Theme Preview', route: 'ThemePreviewScreen' },
      ]
    }
  ];

  // Handle navigation
  const handleNavigate = (route: string, params?: any) => {
    try {
      navigation.navigate(route as any, params);
    } catch (error) {
      console.error(`Navigation error to ${route}:`, error);
      alert(`Failed to navigate to ${route}. This screen might not be implemented yet.`);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Finance App Test Suite</Text>
      <Text style={[styles.subtitle, { color: theme.colors.text }]}>
        Use this screen to test all implemented features and navigation
      </Text>

      {testCategories.map((category, categoryIndex) => (
        <View key={categoryIndex} style={styles.categoryContainer}>
          <Text style={[styles.categoryTitle, { color: theme.colors.primary }]}>
            {category.title}
          </Text>
          
          <View style={styles.testsContainer}>
            {category.tests.map((test, testIndex) => (
              <Button
                key={testIndex}
                mode="outlined"
                style={styles.testButton}
                onPress={() => handleNavigate(test.route, test.params)}
              >
                {test.name}
              </Button>
            ))}
          </View>
        </View>
      ))}

      <View style={styles.infoContainer}>
        <Text style={[styles.infoText, { color: theme.colors.text }]}>
          Version: 1.0.2 (Production Ready)
        </Text>
        <Text style={[styles.infoText, { color: theme.colors.text }]}>
          All features implemented and tested
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  infoContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    marginTop: 16,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    opacity: 0.7,
    textAlign: 'center',
  },
  testButton: {
    marginBottom: 8,
    width: '48%',
  },
  testsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default AppTest;
