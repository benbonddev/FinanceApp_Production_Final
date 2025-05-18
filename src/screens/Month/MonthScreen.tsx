import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { Text, useTheme, Button, FAB, Chip, Divider, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { selectAllBills, loadSampleBills } from '../../store/slices/billsSlice';
import { selectAllPaychecks, loadSamplePaychecks } from '../../store/slices/paychecksSlice';
import BillCard from '../../components/Card/BillCard';
import PaycheckCard from '../../components/Card/PaycheckCard';
import EmptyState from '../../components/EmptyState/EmptyState';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme, VictoryGroup, VictoryLegend } from 'victory-native';
import { Bill, Paycheck, RootStackParamList } from '../../types';
import { format, isSameMonth, parseISO, subMonths, addMonths } from 'date-fns';

const { width } = Dimensions.get('window');
const chartWidth = width - 48;

type ViewMode = 'paycheck' | 'month';
type MonthScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const MonthScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<MonthScreenNavigationProp>();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  
  // Load sample data for development
  useEffect(() => {
    dispatch(loadSampleBills());
    dispatch(loadSamplePaychecks());
  }, [dispatch]);
  
  const bills = useAppSelector(selectAllBills);
  const paychecks = useAppSelector(selectAllPaychecks);
  
  // Filter bills for the selected month
  const monthBills = bills.filter(bill => {
    const billDate = parseISO(bill.dueDate);
    return isSameMonth(billDate, selectedMonth);
  });
  
  // Filter paychecks for the selected month
  const monthPaychecks = paychecks.filter(paycheck => {
    const paycheckDate = parseISO(paycheck.date);
    return isSameMonth(paycheckDate, selectedMonth);
  });
  
  // Group bills by paycheck for the selected month
  const billsByPaycheck = monthPaychecks.map(paycheck => {
    const paycheckBills = monthBills.filter(bill => bill.payPeriodId === paycheck.id);
    const paidBills = paycheckBills.filter(bill => bill.isPaid);
    const totalAmount = paycheckBills.reduce((sum, bill) => sum + bill.amount, 0);
    const remainingAmount = paycheck.amount - totalAmount;
    
    return {
      paycheck,
      bills: paycheckBills,
      paidBills,
      totalAmount,
      remainingAmount
    };
  });
  
  // Calculate monthly summary
  const totalBills = monthBills.length;
  const paidBills = monthBills.filter(bill => bill.isPaid).length;
  const unpaidBills = totalBills - paidBills;
  const totalBillsAmount = monthBills.reduce((sum, bill) => sum + bill.amount, 0);
  const totalPaychecksAmount = monthPaychecks.reduce((sum, paycheck) => sum + paycheck.amount, 0);
  const monthBalance = totalPaychecksAmount - totalBillsAmount;
  
  // Prepare data for income vs expenses chart (last 6 months)
  const getMonthData = (monthsFromCurrent: number) => {
    const targetMonth = monthsFromCurrent === 0 
      ? selectedMonth 
      : monthsFromCurrent > 0 
        ? addMonths(selectedMonth, monthsFromCurrent)
        : subMonths(selectedMonth, Math.abs(monthsFromCurrent));
    
    const monthBillsAmount = bills
      .filter(bill => isSameMonth(parseISO(bill.dueDate), targetMonth))
      .reduce((sum, bill) => sum + bill.amount, 0);
    
    const monthPaychecksAmount = paychecks
      .filter(paycheck => isSameMonth(parseISO(paycheck.date), targetMonth))
      .reduce((sum, paycheck) => sum + paycheck.amount, 0);
    
    return {
      month: format(targetMonth, 'MMM'),
      expenses: monthBillsAmount,
      income: monthPaychecksAmount
    };
  };
  
  const monthsData = [-2, -1, 0, 1, 2, 3].map(getMonthData);
  
  // Handle bill press
  const handleBillPress = (bill: Bill) => {
    navigation.navigate('BillDetail', { billId: bill.id });
  };
  
  // Handle bill long press
  const handleBillLongPress = (bill: Bill) => {
    navigation.navigate('EditBill', { billId: bill.id });
  };
  
  // Handle paycheck press
  const handlePaycheckPress = (paycheck: Paycheck) => {
    navigation.navigate('PaycheckDetail', { paycheckId: paycheck.id });
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
  
  // Handle add data
  const handleAddData = () => {
    if (viewMode === 'month') {
      navigation.navigate('AddBill');
    } else {
      navigation.navigate('AddPaycheck');
    }
  };
  
  // Handle settings
  const handleSettings = () => {
    navigation.navigate('Settings');
  };
  
  // Render monthly summary
  const renderMonthlySummary = () => {
    return (
      <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={styles.summaryTitle}>{format(selectedMonth, 'MMMM yyyy')} Summary</Text>
        <Divider style={styles.divider} />
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Bills:</Text>
          <Text style={styles.summaryValue}>{totalBills}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Paid Bills:</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.success }]}>{paidBills}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Unpaid Bills:</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.error }]}>{unpaidBills}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Bills Amount:</Text>
          <Text style={styles.summaryValue}>${totalBillsAmount.toFixed(2)}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Income:</Text>
          <Text style={styles.summaryValue}>${totalPaychecksAmount.toFixed(2)}</Text>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabelBold}>Month Balance:</Text>
          <Text style={[
            styles.summaryValueBold, 
            { color: monthBalance >= 0 ? theme.colors.success : theme.colors.error }
          ]}>
            ${Math.abs(monthBalance).toFixed(2)} {monthBalance >= 0 ? 'surplus' : 'deficit'}
          </Text>
        </View>
        
        <Text style={styles.chartTitle}>Income vs Expenses (6 Months)</Text>
        
        <View style={styles.chartContainer}>
          <VictoryChart
            width={chartWidth}
            height={220}
            theme={VictoryTheme.material}
            domainPadding={{ x: 25 }}
          >
            <VictoryAxis
              tickValues={[0, 1, 2, 3, 4, 5]}
              tickFormat={monthsData.map(d => d.month)}
              style={{
                axis: { stroke: theme.colors.text },
                tickLabels: { fill: theme.colors.text, fontSize: 10 },
              }}
            />
            <VictoryAxis
              dependentAxis
              style={{
                axis: { stroke: theme.colors.text },
                tickLabels: { fill: theme.colors.text, fontSize: 10 },
              }}
            />
            <VictoryGroup offset={20}>
              <VictoryBar
                data={monthsData.map((d, i) => ({ x: i, y: d.income }))}
                style={{ data: { fill: theme.colors.success, width: 15 } }}
                animate={{ duration: 500 }}
              />
              <VictoryBar
                data={monthsData.map((d, i) => ({ x: i, y: d.expenses }))}
                style={{ data: { fill: theme.colors.error, width: 15 } }}
                animate={{ duration: 500 }}
              />
            </VictoryGroup>
          </VictoryChart>
          
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: theme.colors.success }]} />
              <Text style={styles.legendText}>Income</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: theme.colors.error }]} />
              <Text style={styles.legendText}>Expenses</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };
  
  // Render content based on view mode
  const renderContent = () => {
    if (viewMode === 'month') {
      if (monthBills.length === 0 && monthPaychecks.length === 0) {
        return (
          <EmptyState
            icon="calendar-month"
            title="No Data for This Month"
            description="Add bills and paychecks for this month to see your financial overview."
            action={
              <Button mode="contained" onPress={handleAddData}>
                Add Data
              </Button>
            }
          />
        );
      }
      
      return (
        <FlatList
          data={[{ id: 'summary' }, ...monthBills]}
          keyExtractor={(item) => typeof item === 'object' && 'id' in item ? item.id : 'summary'}
          renderItem={({ item, index }) => {
            if (index === 0) {
              return renderMonthlySummary();
            }
            
            if ('dueDate' in item) {
              return (
                <BillCard
                  bill={item as Bill}
                  onPress={handleBillPress}
                  onLongPress={handleBillLongPress}
                />
              );
            }
            
            return null;
          }}
          ListHeaderComponent={
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
          }
        />
      );
    } else {
      // Paycheck view
      if (billsByPaycheck.length === 0) {
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
          data={[{ id: 'summary' }, ...billsByPaycheck]}
          keyExtractor={(item, index) => index === 0 ? 'summary' : (item as any).paycheck.id}
          renderItem={({ item, index }) => {
            if (index === 0) {
              return renderMonthlySummary();
            }
            
            const paycheckGroup = item as {
              paycheck: Paycheck;
              bills: Bill[];
              paidBills: Bill[];
              totalAmount: number;
              remainingAmount: number;
            };
            
            return (
              <View style={styles.paycheckGroup}>
                <PaycheckCard
                  paycheck={paycheckGroup.paycheck}
                  onPress={handlePaycheckPress}
                  showBillsSummary={true}
                  billsCount={paycheckGroup.bills.length}
                  billsTotal={paycheckGroup.totalAmount}
                />
                
                {paycheckGroup.bills.map(bill => (
                  <BillCard
                    key={bill.id}
                    bill={bill}
                    onPress={handleBillPress}
                    onLongPress={handleBillLongPress}
                  />
                ))}
              </View>
            );
          }}
          ListHeaderComponent={
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
          }
        />
      );
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.viewToggle}>
          <Chip
            selected={viewMode === 'month'}
            onPress={() => setViewMode('month')}
            style={styles.chip}
          >
            Bills View
          </Chip>
          <Chip
            selected={viewMode === 'paycheck'}
            onPress={() => setViewMode('paycheck')}
            style={styles.chip}
          >
            Paycheck View
          </Chip>
        </View>
        <IconButton
          icon="cog"
          size={24}
          onPress={handleSettings}
        />
      </View>
      
      {renderContent()}
      
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={handleAddData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  chip: {
    marginRight: 8,
  },
  container: {
    flex: 1,
  },
  divider: {
    marginVertical: 8,
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
  legendColor: {
    borderRadius: 6,
    height: 12,
    marginRight: 4,
    width: 12,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginHorizontal: 12,
  },
  legendText: {
    fontSize: 12,
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
  paycheckGroup: {
    marginBottom: 16,
  },
  summaryCard: {
    borderRadius: 8,
    elevation: 2,
    margin: 16,
    padding: 16,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryLabelBold: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 14,
  },
  summaryValueBold: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewToggle: {
    flexDirection: 'row',
  },
});

export default MonthScreen;
