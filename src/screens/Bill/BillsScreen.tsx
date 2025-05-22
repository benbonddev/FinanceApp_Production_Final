import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
// Assuming your RootStackParamList includes screen names for bill management
// and you have a specific param list for the BillsNavigator stack
// For now, let's use a generic type or 'any' for simplicity in this placeholder
// type BillsStackParamList = { BillsScreen: undefined; AddBill: undefined; /* ... other bill screens */ };
// type BillsNavigationProp = StackNavigationProp<BillsStackParamList, 'BillsScreen'>;

const BillsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>(); // Use 'any' or a more specific type

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={styles.title}>All Bills</Text>
      {/* Placeholder for listing bills */}
      <Text style={styles.placeholder}>Bill listing will appear here.</Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('AddBill')} // Assuming AddBill is part of this new stack
        style={styles.button}
      >
        Add New Bill
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
  placeholder: {
    flex: 1,
    textAlignVertical: 'center',
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
  },
});

export default BillsScreen;
