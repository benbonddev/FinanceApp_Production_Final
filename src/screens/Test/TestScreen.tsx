import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const TestScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Test Suite</Text>
        <Text style={[styles.subtitle, { color: theme.colors.text }]}>
          Verify app functionality and components
        </Text>
      </View>
      
      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          Component Tests
        </Text>
        <View style={styles.listItem}>
          <Text style={[styles.listItemTitle, { color: theme.colors.text }]}>UI Components</Text>
          <Text style={[styles.listItemDescription, { color: theme.colors.text }]}>
            Test form inputs, buttons, and UI elements
          </Text>
          <Button 
            mode="outlined" 
            onPress={() => navigation.navigate('ComponentTest' as never)}
            style={styles.button}
          >
            <Text>Run Test</Text>
          </Button>
        </View>
        <View style={styles.listItem}>
          <Text style={[styles.listItemTitle, { color: theme.colors.text }]}>Chart Visualizations</Text>
          <Text style={[styles.listItemDescription, { color: theme.colors.text }]}>
            Test all chart components and data visualization
          </Text>
          <Button 
            mode="outlined" 
            onPress={() => navigation.navigate('ChartTest' as never)}
            style={styles.button}
          >
            <Text>Run Test</Text>
          </Button>
        </View>
      </View>
      
      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          Navigation Tests
        </Text>
        <View style={styles.listItem}>
          <Text style={[styles.listItemTitle, { color: theme.colors.text }]}>Navigation Analysis</Text>
          <Text style={[styles.listItemDescription, { color: theme.colors.text }]}>
            Verify navigation structure and screen connections
          </Text>
          <Button 
            mode="outlined" 
            onPress={() => navigation.navigate('NavigationAnalysis' as never)}
            style={styles.button}
          >
            <Text>Run Test</Text>
          </Button>
        </View>
      </View>
      
      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          Performance Tests
        </Text>
        <View style={styles.listItem}>
          <Text style={[styles.listItemTitle, { color: theme.colors.text }]}>Performance Metrics</Text>
          <Text style={[styles.listItemDescription, { color: theme.colors.text }]}>
            Check app performance and optimization
          </Text>
          <Button 
            mode="outlined" 
            onPress={() => navigation.navigate('PerformanceScreen' as never)}
            style={styles.button}
          >
            <Text>Run Test</Text>
          </Button>
        </View>
      </View>
      
      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          Integration Tests
        </Text>
        <View style={styles.listItem}>
          <Text style={[styles.listItemTitle, { color: theme.colors.text }]}>App Test Suite</Text>
          <Text style={[styles.listItemDescription, { color: theme.colors.text }]}>
            Run comprehensive app integration tests
          </Text>
          <Button 
            mode="outlined" 
            onPress={() => navigation.navigate('AppTest' as never)}
            style={styles.button}
          >
            <Text>Run Test</Text>
          </Button>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('AppTest' as never)}
          style={styles.footerButton}
        >
          <Text>Run All Tests</Text>
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  button: {
    marginTop: 8,
  },
  card: {
    backgroundColor: theme => theme.colors.surface,
    borderRadius: 8,
    marginBottom: 16,
    marginHorizontal: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  container: {
    flex: 1,
  },
  footer: {
    padding: 16,
  },
  footerButton: {
    marginBottom: 16,
  },
  header: {
    padding: 16,
  },
  listItem: {
    marginBottom: 16,
  },
  listItemDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
    opacity: 0.7,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default TestScreen;
