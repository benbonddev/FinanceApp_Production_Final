import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import { Text, useTheme, Button, FAB, Chip, Divider, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { selectAllBills, selectUpcomingBills, loadSampleBills } from '../../store/slices/billsSlice';
import { selectAllPaychecks, selectNextPaycheck, loadSamplePaychecks } from '../../store/slices/paychecksSlice';
import BillCard from '../../components/Card/BillCard';
import EmptyState from '../../components/EmptyState/EmptyState';
import { Bill, Paycheck, RootStackParamList } from '../../types';
import { format, parseISO } from 'date-fns';
import { logger } from '../../utils/logger';

type ViewMode = 'paycheck' | 'month';
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [viewMode, setViewMode] = useState<ViewMode>('paycheck');
  
  // Load sample data for development
  useEffect(() => {
    dispatch(loadSampleBills());
    dispatch(loadSamplePaychecks());
  }, [dispatch]);
  
  const bills = useAppSelector(selectAllBills) || [];
  const upcomingBills = useAppSelector(selectUpcomingBills) || [];
  const paychecks = useAppSelector(selectAllPaychecks) || [];
  const nextPaycheck = useAppSelector(selectNextPaycheck);
  
  // Group bills by paycheck with null safety
  const billsByPaycheck = (paychecks || []).map(paycheck => {
    if (!paycheck) return null;
    
    const paycheckBills = (bills || []).filter(bill => bill && bill.payPeriodId === paycheck.id);
    const paidBills = paycheckBills.filter(bill => bill && bill.isPaid);
    const totalAmount = paycheckBills.reduce((sum, bill) => sum + (bill?.amount || 0), 0);
    const remainingAmount = (paycheck?.amount || 0) - totalAmount;
    
    return {
      paycheck,
      bills: paycheckBills,
      paidBills,
      totalAmount,
      remainingAmount
    };
  }).filter(Boolean); // Filter out null values
  
  // Group bills by month with null safety
  const billsByMonth: { [key: string]: Bill[] } = {};
  (bills || []).forEach(bill => {
    if (!bill || !bill.dueDate) return;
    
    try {
      const date = parseISO(bill.dueDate);
      const monthYear = format(date, 'MMMM yyyy');
      
      if (!billsByMonth[monthYear]) {
        billsByMonth[monthYear] = [];
      }
      
      billsByMonth[monthYear].push(bill);
    } catch (error) {
      // Skip invalid dates
      logger.error('Invalid date format:', bill.dueDate);
    }
  });
  
  // Handle bill press with null safety
  const handleBillPress = (bill: Bill | null | undefined) => {
    if (!bill || !bill.id) return;
    navigation.navigate('BillDetail', { billId: bill.id });
  };
  
  // Handle bill long press with null safety
  const handleBillLongPress = (bill: Bill | null | undefined) => {
    if (!bill || !bill.id) return;
    navigation.navigate('BillDetail', { billId: bill.id });
  };
  
  // Handle add bill
  const handleAddBill = () => {
    navigation.navigate('AddBill');
  };
  
  // Render paycheck group header with null safety
  const renderPaycheckHeader = (
    paycheck: Paycheck | null | undefined, 
    bills: Bill[] | null | undefined, 
    paidCount: number, 
    totalAmount: number, 
    remainingAmount: number
  ) => {
    if (!paycheck || !paycheck.date) return null;
    
    let formattedDate = 'Invalid Date';
    try {
      const date = parseISO(paycheck.date);
      formattedDate = format(date, 'MMM d, yyyy');
    } catch (error) {
      logger.error('Invalid date format:', paycheck.date);
    }
    
    const billsLength = Array.isArray(bills) ? bills.length : 0;
    
    return (
      <View style={styles.paycheckHeader}>
        <View style={styles.paycheckInfo}>
          <Text style={styles.paycheckName}>{paycheck.name || 'Unnamed Paycheck'}</Text>
          <Text style={styles.paycheckDate}>{formattedDate}</Text>
        </View>
        <View style={styles.paycheckSummary}>
          <Text style={styles.summaryText}>
            {billsLength} bills ({paidCount} paid)
          </Text>
          <Text style={styles.summaryText}>
            ${totalAmount.toFixed(2)} of ${(paycheck.amount || 0).toFixed(2)}
          </Text>
          <Text style={[
            styles.remainingText, 
            { color: remainingAmount >= 0 ? 
              (theme.colors.success || theme.colors.primary) : 
              (theme.colors.error || theme.colors.notification) 
            }
          ]}>
            ${Math.abs(remainingAmount).toFixed(2)} {remainingAmount >= 0 ? 'remaining' : 'over budget'}
          </Text>
        </View>
      </View>
    );
  };
  
  // Render month header with null safety
  const renderMonthHeader = (month: string, bills: Bill[] | null | undefined) => {
    if (!month || !Array.isArray(bills)) return null;
    
    const paidBills = bills.filter(bill => bill && bill.isPaid);
    const totalAmount = bills.reduce((sum, bill) => sum + (bill?.amount || 0), 0);
    
    return (
      <View style={styles.monthHeader}>
        <Text style={styles.monthName}>{month}</Text>
        <View style={styles.monthSummary}>
          <Text style={styles.summaryText}>
            {bills.length} bills ({paidBills.length} paid)
          </Text>
          <Text style={styles.summaryText}>
            ${totalAmount.toFixed(2)} total
          </Text>
        </View>
      </View>
    );
  };
  
  // Render content based on view mode with null safety
  const renderContent = () => {
    if (viewMode === 'paycheck') {
      if (!billsByPaycheck || billsByPaycheck.length === 0) {
        return (
          <EmptyState
            icon="cash-multiple"
            title="No Paychecks Found"
            description="Add your paychecks to see your bills organized by pay period."
            action={
              <Button mode="contained" onPress={() => navigation.navigate('AddPaycheck')}>
                Add Paycheck
              </Button>
            }
          />
        );
      }
      
      return (
        <FlatList
          data={billsByPaycheck}
          keyExtractor={(item) => item?.paycheck?.id || Math.random().toString()}
          renderItem={({ item }) => {
            if (!item || !item.paycheck) return null;
            
            return (
              <View style={styles.paycheckGroup}>
                {renderPaycheckHeader(
                  item.paycheck, 
                  item.bills, 
                  item.paidBills?.length || 0, 
                  item.totalAmount || 0, 
                  item.remainingAmount || 0
                )}
                <Divider style={styles.divider} />
                {item.bills && item.bills.length > 0 ? (
                  item.bills.map(bill => (
                    bill ? (
                      <BillCard
                        key={bill.id || Math.random().toString()}
                        bill={bill}
                        onPress={() => handleBillPress(bill)}
                        onLongPress={() => handleBillLongPress(bill)}
                      />
                    ) : null
                  ))
                ) : (
                  <Text style={styles.noBillsText}>No bills for this paycheck</Text>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon="file-document-outline"
              title="No Bills Found"
              description="Add your bills to start tracking them."
              action={
                <Button mode="contained" onPress={handleAddBill}>
                  Add Bill
                </Button>
              }
            />
          }
        />
      );
    } else {
      // Month view with null safety
      const monthEntries = Object.entries(billsByMonth || {});
      
      if (!monthEntries || monthEntries.length === 0) {
        return (
          <EmptyState
            icon="file-document-outline"
            title="No Bills Found"
            description="Add your bills to start tracking them."
            action={
              <Button mode="contained" onPress={handleAddBill}>
                Add Bill
              </Button>
            }
          />
        );
      }
      
      return (
        <FlatList
          data={monthEntries}
          keyExtractor={([month]) => month || Math.random().toString()}
          renderItem={({ item }) => {
            const [month, monthBills] = item;
            if (!month || !Array.isArray(monthBills)) return null;
            
            return (
              <View style={styles.monthGroup}>
                {renderMonthHeader(month, monthBills)}
                <Divider style={styles.divider} />
                {monthBills.map(bill => (
                  bill ? (
                    <BillCard
                      key={bill.id || Math.random().toString()}
                      bill={bill}
                      onPress={() => handleBillPress(bill)}
                      onLongPress={() => handleBillLongPress(bill)}
                    />
                  ) : null
                ))}
              </View>
            );
          }}
        />
      );
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.viewToggle}>
          <Chip
            selected={viewMode === 'paycheck'}
            onPress={() => setViewMode('paycheck')}
            style={styles.chip}
          >
            By Paycheck
          </Chip>
          <Chip
            selected={viewMode === 'month'}
            onPress={() => setViewMode('month')}
            style={styles.chip}
          >
            By Month
          </Chip>
        </View>
        <IconButton
          icon="cog"
          size={24}
          onPress={() => navigation.navigate('Settings')}
        />
      </View>
      
      {renderContent()}
      
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={handleAddBill}
        label="Add Bill"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    marginRight: 8,
  },
  container: {
    flex: 1,
  },
  divider: {
    marginBottom: 8,
  },
  fab: {
    bottom: 0,
    margin: 16,
    position: 'absolute',
    right: 0,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  monthGroup: {
    marginBottom: 16,
  },
  monthHeader: {
    padding: 16,
  },
  monthName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  monthSummary: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  noBillsText: {
    opacity: 0.7,
    padding: 16,
    textAlign: 'center',
  },
  paycheckDate: {
    fontSize: 14,
    opacity: 0.7,
  },
  paycheckGroup: {
    marginBottom: 16,
  },
  paycheckHeader: {
    padding: 16,
  },
  paycheckInfo: {
    marginBottom: 8,
  },
  paycheckName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  paycheckSummary: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  remainingText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  summaryText: {
    fontSize: 14,
  },
  viewToggle: {
    flexDirection: 'row',
  },
});

export default HomeScreen;
