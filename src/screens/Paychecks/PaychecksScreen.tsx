import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text, useTheme, FAB, Divider, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { selectAllPaychecks, loadSamplePaychecks } from '../../store/slices/paychecksSlice';
import { selectAllBills } from '../../store/slices/billsSlice';
import PaycheckCard from '../../components/Card/PaycheckCard';
import EmptyState from '../../components/EmptyState/EmptyState';
import { Paycheck, RootStackParamList } from '../../types';
import { format, parseISO, isSameMonth } from 'date-fns';

type PaychecksScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const PaychecksScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<PaychecksScreenNavigationProp>();
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  
  // Load sample data for development
  useEffect(() => {
    dispatch(loadSamplePaychecks());
  }, [dispatch]);
  
  const paychecks = useAppSelector(selectAllPaychecks);
  const bills = useAppSelector(selectAllBills);
  
  // Filter paychecks for the selected month
  const monthPaychecks = paychecks.filter(paycheck => {
    const paycheckDate = parseISO(paycheck.date);
    return isSameMonth(paycheckDate, selectedMonth);
  });
  
  // Calculate total income for the month
  const totalIncome = monthPaychecks.reduce((sum, paycheck) => sum + paycheck.amount, 0);
  
  // Calculate bills for each paycheck
  const paychecksWithBills = monthPaychecks.map(paycheck => {
    const paycheckBills = bills.filter(bill => bill.payPeriodId === paycheck.id);
    const billsTotal = paycheckBills.reduce((sum, bill) => sum + bill.amount, 0);
    
    return {
      ...paycheck,
      bills: paycheckBills,
      billsCount: paycheckBills.length,
      billsTotal
    };
  });
  
  // Handle paycheck press
  const handlePaycheckPress = (paycheck: Paycheck) => {
    navigation.navigate('PaycheckDetail', { paycheckId: paycheck.id });
  };
  
  // Handle add paycheck
  const handleAddPaycheck = () => {
    navigation.navigate('AddPaycheck');
  };
  
  // Handle month navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(selectedMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setSelectedMonth(newMonth);
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.monthNavigation}>
        <IconButton
          icon="chevron-left"
          size={24}
          onPress={() => navigateMonth('prev')}
        />
        <Text style={styles.monthTitle}>{format(selectedMonth, 'MMMM yyyy')}</Text>
        <IconButton
          icon="chevron-right"
          size={24}
          onPress={() => navigateMonth('next')}
        />
      </View>
      
      <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={styles.summaryTitle}>Monthly Income</Text>
        <Text style={styles.summaryAmount}>${totalIncome.toFixed(2)}</Text>
        <Text style={styles.summarySubtitle}>
          {monthPaychecks.length} {monthPaychecks.length === 1 ? 'paycheck' : 'paychecks'} this month
        </Text>
      </View>
      
      <Divider style={styles.divider} />
      
      <FlatList
        data={paychecksWithBills}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PaycheckCard
            paycheck={item}
            onPress={() => handlePaycheckPress(item)}
            showBillsSummary={true}
            billsCount={item.billsCount}
            billsTotal={item.billsTotal}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="cash-multiple"
            title="No Paychecks Found"
            description="Add your paychecks to start tracking your income."
            action={
              <IconButton
                icon="plus"
                size={24}
                onPress={handleAddPaycheck}
                style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                color="white"
              />
            }
          />
        }
        contentContainerStyle={styles.listContent}
      />
      
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={handleAddPaycheck}
        label="Add Paycheck"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  addButton: {
    margin: 8,
  },
  container: {
    flex: 1,
  },
  divider: {
    marginHorizontal: 16,
  },
  fab: {
    bottom: 0,
    margin: 16,
    position: 'absolute',
    right: 0,
  },
  listContent: {
    paddingBottom: 80, // Space for FAB
  },
  monthNavigation: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  summaryCard: {
    alignItems: 'center',
    borderRadius: 8,
    margin: 16,
    padding: 16,
  },
  summarySubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  summaryTitle: {
    fontSize: 16,
    opacity: 0.7,
  },
});

export default PaychecksScreen;
