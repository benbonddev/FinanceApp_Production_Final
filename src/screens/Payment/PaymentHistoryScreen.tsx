import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, FlatList, Alert } from 'react-native';
import { Text, useTheme, FAB, Divider, IconButton, Button, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { selectAllBills } from '../../store/slices/billsSlice';
import { selectAllPaychecks } from '../../store/slices/paychecksSlice';
import ListItem from '../../components/List/ListItem';
import EmptyState from '../../components/EmptyState/EmptyState';
import CircularProgress from '../../components/Progress/CircularProgress';
import { Bill, RootStackParamList } from '../../types';
import { format, parseISO, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { logger } from '../../utils/logger';

type PaymentHistoryScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const PaymentHistoryScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<PaymentHistoryScreenNavigationProp>();
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  
  const bills = useAppSelector(selectAllBills);
  const paychecks = useAppSelector(selectAllPaychecks);
  
  // Filter bills for the selected month
  const monthBills = bills.filter(bill => {
    try {
      const billDate = parseISO(bill.dueDate);
      return isSameMonth(billDate, selectedMonth);
    } catch (error) {
      // Handle invalid date format
      logger.error(`Invalid date format for bill ${bill.id}: ${bill.dueDate}`);
      return false;
    }
  });
  
  // Apply additional filtering
  const filteredBills = monthBills.filter(bill => {
    if (filter === 'all') return true;
    if (filter === 'paid') return bill.isPaid;
    if (filter === 'unpaid') return !bill.isPaid;
    return true;
  });
  
  // Sort bills by due date
  filteredBills.sort((a, b) => {
    try {
      return parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime();
    } catch (error) {
      // Handle invalid date format
      logger.error(`Error sorting bills: ${error}`);
      return 0;
    }
  });
  
  // Calculate monthly statistics
  const totalBills = monthBills.length;
  const paidBills = monthBills.filter(bill => bill.isPaid).length;
  const paidAmount = monthBills
    .filter(bill => bill.isPaid)
    .reduce((sum, bill) => sum + (isNaN(bill.amount) ? 0 : bill.amount), 0);
  const unpaidAmount = monthBills
    .filter(bill => !bill.isPaid)
    .reduce((sum, bill) => sum + (isNaN(bill.amount) ? 0 : bill.amount), 0);
  const paymentProgress = totalBills > 0 ? paidBills / totalBills : 0;
  
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
  
  // Handle bill press
  const handleBillPress = (bill: Bill) => {
    try {
      // Navigate to bill detail screen
      navigation.navigate('BillDetail', { billId: bill.id });
    } catch (error) {
      // Handle navigation error
      Alert.alert(
        "Navigation Error",
        "Unable to view bill details. Please try again.",
        [{ text: "OK" }]
      );
      logger.error(`Error navigating to bill detail: ${error}`);
    }
  };
  
  // Render payment history item
  const renderPaymentItem = (bill: Bill) => {
    let dueDate: Date;
    let paidDate: Date | null = null;
    
    try {
      dueDate = parseISO(bill.dueDate);
    } catch (error) {
      // Handle invalid due date
      logger.error(`Invalid due date for bill ${bill.id}: ${bill.dueDate}`);
      dueDate = new Date(); // Fallback to current date
    }
    
    try {
      if (bill.paidDate) {
        paidDate = parseISO(bill.paidDate);
      }
    } catch (error) {
      // Handle invalid paid date
      logger.error(`Invalid paid date for bill ${bill.id}: ${bill.paidDate}`);
    }
    
    return (
      <ListItem
        key={bill.id}
        title={bill.name}
        description={`Due: ${format(dueDate, 'MMM d, yyyy')}`}
        leftIcon={
          <View style={[
            styles.statusIndicator, 
            { 
              backgroundColor: bill.isPaid 
                ? theme.colors.success 
                : new Date() > dueDate 
                  ? theme.colors.error 
                  : theme.colors.warning 
            }
          ]} />
        }
        rightContent={
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentAmount}>${(bill.amount || 0).toFixed(2)}</Text>
            <Text style={[
              styles.paymentStatus, 
              { 
                color: bill.isPaid 
                  ? theme.colors.success 
                  : new Date() > dueDate 
                    ? theme.colors.error 
                    : theme.colors.warning 
              }
            ]}>
              {bill.isPaid 
                ? `Paid ${paidDate ? format(paidDate, 'MMM d') : ''}` 
                : new Date() > dueDate 
                  ? 'Overdue' 
                  : 'Upcoming'}
            </Text>
          </View>
        }
        onPress={() => handleBillPress(bill)}
        containerStyle={styles.listItem}
      />
    );
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
        <View style={styles.progressContainer}>
          <CircularProgress
            progress={paymentProgress}
            size={80}
            strokeWidth={8}
            color={theme.colors.primary}
          >
            <Text style={styles.progressPercentage}>
              {Math.round(paymentProgress * 100)}%
            </Text>
          </CircularProgress>
          
          <View style={styles.summaryDetails}>
            <Text style={styles.summaryTitle}>Payment Progress</Text>
            <Text style={styles.summarySubtitle}>
              {paidBills} of {totalBills} bills paid
            </Text>
            
            <View style={styles.amountContainer}>
              <View style={styles.amountItem}>
                <Text style={styles.amountLabel}>Paid</Text>
                <Text style={[styles.amountValue, { color: theme.colors.success }]}>
                  ${paidAmount.toFixed(2)}
                </Text>
              </View>
              
              <View style={styles.amountItem}>
                <Text style={styles.amountLabel}>Unpaid</Text>
                <Text style={[styles.amountValue, { color: theme.colors.error }]}>
                  ${unpaidAmount.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.filterContainer}>
        <Chip
          selected={filter === 'all'}
          onPress={() => setFilter('all')}
          style={styles.filterChip}
        >
          All
        </Chip>
        <Chip
          selected={filter === 'paid'}
          onPress={() => setFilter('paid')}
          style={styles.filterChip}
        >
          Paid
        </Chip>
        <Chip
          selected={filter === 'unpaid'}
          onPress={() => setFilter('unpaid')}
          style={styles.filterChip}
        >
          Unpaid
        </Chip>
      </View>
      
      <Text style={styles.sectionTitle}>Payment History</Text>
      
      {filteredBills.length > 0 ? (
        <FlatList
          data={filteredBills}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderPaymentItem(item)}
          contentContainerStyle={styles.listContent}
          onError={(error) => {
            logger.error('FlatList error:', error);
            Alert.alert(
              "Error",
              "There was a problem displaying your payment history. Please try again.",
              [{ text: "OK" }]
            );
          }}
        />
      ) : (
        <EmptyState
          icon="cash-multiple"
          title="No Payments Found"
          description={`No ${filter !== 'all' ? filter + ' ' : ''}bills found for this month.`}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountItem: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
  },
  filterChip: {
    marginRight: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  listItem: {
    marginBottom: 8,
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
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentInfo: {
    alignItems: 'flex-end',
  },
  paymentStatus: {
    fontSize: 12,
  },
  progressContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  statusIndicator: {
    borderRadius: 6,
    height: 12,
    marginRight: 8,
    width: 12,
  },
  summaryCard: {
    borderRadius: 8,
    margin: 16,
    padding: 16,
  },
  summaryDetails: {
    flex: 1,
    marginLeft: 16,
  },
  summarySubtitle: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.7,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PaymentHistoryScreen;
