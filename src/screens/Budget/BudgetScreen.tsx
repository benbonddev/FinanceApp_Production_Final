import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, FlatList, Dimensions } from 'react-native';
import { Text, useTheme, FAB, Divider, IconButton, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { selectAllBills } from '../../store/slices/billsSlice';
import { selectAllPaychecks } from '../../store/slices/paychecksSlice';
import { selectAllBudgets, loadSampleBudgets } from '../../store/slices/budgetSlice';
import BudgetCard from '../../components/Card/BudgetCard';
import LinearProgress from '../../components/Progress/LinearProgress';
import CircularProgress from '../../components/Progress/CircularProgress';
import EmptyState from '../../components/EmptyState/EmptyState';
import { VictoryPie, VictoryLabel, VictoryTheme } from 'victory-native';
import { Budget, RootStackParamList } from '../../types';
import { format, parseISO, isSameMonth } from 'date-fns';

const { width } = Dimensions.get('window');
const chartWidth = width - 48;

type BudgetScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const BudgetScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<BudgetScreenNavigationProp>();
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  
  // Load sample data for development
  useEffect(() => {
    dispatch(loadSampleBudgets());
  }, [dispatch]);
  
  const bills = useAppSelector(selectAllBills);
  const paychecks = useAppSelector(selectAllPaychecks);
  const budgets = useAppSelector(selectAllBudgets);
  
  // Filter bills and paychecks for the selected month
  const monthBills = bills.filter(bill => {
    const billDate = parseISO(bill.dueDate);
    return isSameMonth(billDate, selectedMonth);
  });
  
  const monthPaychecks = paychecks.filter(paycheck => {
    const paycheckDate = parseISO(paycheck.date);
    return isSameMonth(paycheckDate, selectedMonth);
  });
  
  // Calculate monthly income and expenses
  const totalIncome = monthPaychecks.reduce((sum, paycheck) => sum + paycheck.amount, 0);
  const totalExpenses = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const monthBalance = totalIncome - totalExpenses;
  
  // Calculate overall budget progress
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.limit, 0);
  const budgetProgress = totalBudget > 0 ? totalExpenses / totalBudget : 0;
  
  // Handle budget press
  const handleBudgetPress = (budget: Budget) => {
    navigation.navigate('BudgetDetail', { budgetId: budget.id });
  };
  
  // Handle add budget
  const handleAddBudget = () => {
    navigation.navigate('AddBudget');
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
      
      <ScrollView>
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={styles.summaryTitle}>Monthly Overview</Text>
          
          <View style={styles.overviewContainer}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Income</Text>
              <Text style={[styles.overviewValue, { color: theme.colors.success }]}>
                ${totalIncome.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Expenses</Text>
              <Text style={[styles.overviewValue, { color: theme.colors.error }]}>
                ${totalExpenses.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.overviewItem}>
              <Text style={styles.overviewLabel}>Balance</Text>
              <Text style={[
                styles.overviewValue, 
                { color: monthBalance >= 0 ? theme.colors.success : theme.colors.error }
              ]}>
                ${Math.abs(monthBalance).toFixed(2)}
              </Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>
              Budget Progress: ${totalExpenses.toFixed(2)} of ${totalBudget.toFixed(2)}
            </Text>
            <LinearProgress
              progress={budgetProgress}
              height={10}
              color={budgetProgress > 1 ? theme.colors.error : theme.colors.primary}
            />
            <Text style={[
              styles.progressPercentage,
              { color: budgetProgress > 1 ? theme.colors.error : theme.colors.primary }
            ]}>
              {Math.round(budgetProgress * 100)}%
            </Text>
          </View>
        </View>
        
        {budgets.length > 0 ? (
          <>
            <View style={styles.categoryBreakdown}>
              <Text style={styles.sectionTitle}>Category Breakdown</Text>
              
              {budgets.length > 0 ? (
                <View style={styles.chartContainer}>
                  <View style={styles.pieChartContainer}>
                    <VictoryPie
                      data={budgets.map(budget => ({
                        x: budget.category,
                        y: budget.spent,
                        label: `${budget.category}: $${budget.spent.toFixed(0)}`
                      }))}
                      width={chartWidth}
                      height={250}
                      colorScale={[
                        theme.colors.primary,
                        theme.colors.accent,
                        theme.colors.notification,
                        theme.colors.success,
                        theme.colors.warning,
                        theme.colors.error,
                      ]}
                      innerRadius={40}
                      labelRadius={90}
                      style={{ 
                        labels: { 
                          fill: theme.colors.text, 
                          fontSize: 12 
                        } 
                      }}
                      animate={{ duration: 500 }}
                    />
                  </View>
                  
                  <View style={styles.legendContainer}>
                    {budgets.map((budget, index) => {
                      const colorIndex = index % 6;
                      const colors = [
                        theme.colors.primary,
                        theme.colors.accent,
                        theme.colors.notification,
                        theme.colors.success,
                        theme.colors.warning,
                        theme.colors.error,
                      ];
                      
                      return (
                        <View key={budget.id} style={styles.legendItem}>
                          <View 
                            style={[
                              styles.legendColor, 
                              { backgroundColor: colors[colorIndex] }
                            ]} 
                          />
                          <View style={styles.legendTextContainer}>
                            <Text style={styles.legendCategory}>{budget.category}</Text>
                            <Text style={styles.legendAmount}>${budget.spent.toFixed(2)}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ) : (
                <Text style={styles.noDataText}>No budget data available</Text>
              )}
            </View>
            
            <View style={styles.budgetList}>
              <Text style={styles.sectionTitle}>Budget Details</Text>
              
              {budgets.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  onPress={handleBudgetPress}
                />
              ))}
            </View>
          </>
        ) : (
          <EmptyState
            icon="chart-pie"
            title="No Budgets Found"
            description="Add your first budget to start tracking your spending."
            action={
              <Button mode="contained" onPress={handleAddBudget}>
                Add Budget
              </Button>
            }
          />
        )}
      </ScrollView>
      
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={handleAddBudget}
        label="Add Budget"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  budgetList: {
    margin: 16,
  },
  categoryBreakdown: {
    margin: 16,
  },
  chartContainer: {
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  fab: {
    bottom: 0,
    margin: 16,
    position: 'absolute',
    right: 0,
  },
  legendAmount: {
    fontSize: 12,
    opacity: 0.7,
  },
  legendCategory: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  legendColor: {
    borderRadius: 8,
    height: 16,
    marginRight: 8,
    width: 16,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    width: '100%',
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 8,
    width: '50%',
  },
  legendTextContainer: {
    flex: 1,
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
  noDataText: {
    opacity: 0.7,
    padding: 20,
    textAlign: 'center',
  },
  overviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  overviewItem: {
    alignItems: 'center',
    flex: 1,
  },
  overviewLabel: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.7,
  },
  overviewValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pieChartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  progressPercentage: {
    alignSelf: 'flex-end',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryCard: {
    borderRadius: 8,
    margin: 16,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default BudgetScreen;
