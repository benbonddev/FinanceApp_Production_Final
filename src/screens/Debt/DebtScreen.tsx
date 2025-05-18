import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, FlatList, Dimensions } from 'react-native';
import { Text, useTheme, FAB, Divider, IconButton, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { selectAllDebts, selectSortedDebts, selectStrategy, setStrategy, loadSampleDebts } from '../../store/slices/debtSlice';
import DebtCard from '../../components/Card/DebtCard';
import LinearProgress from '../../components/Progress/LinearProgress';
import CircularProgress from '../../components/Progress/CircularProgress';
import EmptyState from '../../components/EmptyState/EmptyState';
import { VictoryLine, VictoryChart, VictoryAxis, VictoryTheme, VictoryLegend } from 'victory-native';
import { Debt, RootStackParamList } from '../../types';
import { addMonths, format } from 'date-fns';

const { width } = Dimensions.get('window');
const chartWidth = width - 48;

type DebtScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const DebtScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<DebtScreenNavigationProp>();
  
  // Load sample data for development
  useEffect(() => {
    dispatch(loadSampleDebts());
  }, [dispatch]);
  
  const debts = useAppSelector(selectAllDebts);
  const sortedDebts = useAppSelector(selectSortedDebts);
  const selectedStrategy = useAppSelector(selectStrategy);
  
  // Calculate total debt
  const totalInitialDebt = debts.reduce((sum, debt) => sum + debt.initialAmount, 0);
  const totalCurrentDebt = debts.reduce((sum, debt) => sum + debt.currentBalance, 0);
  const totalPaid = totalInitialDebt - totalCurrentDebt;
  const progressPercentage = totalInitialDebt > 0 ? totalPaid / totalInitialDebt : 0;
  
  // Calculate monthly payment
  const totalMonthlyPayment = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
  
  // Handle debt press
  const handleDebtPress = (debt: Debt) => {
    navigation.navigate('DebtDetail', { debtId: debt.id });
  };
  
  // Handle add debt
  const handleAddDebt = () => {
    navigation.navigate('AddDebt');
  };
  
  // Handle strategy change
  const handleStrategyChange = (strategy: 'avalanche' | 'snowball') => {
    dispatch(setStrategy(strategy));
  };
  
  // Calculate payoff date and total interest
  const calculatePayoffProjections = () => {
    // Simple projection calculation (in a real app, this would be more sophisticated)
    let totalInterest = 0;
    let maxMonths = 0;
    
    debts.forEach(debt => {
      // Simple calculation: months = balance / minimum payment
      const months = Math.ceil(debt.currentBalance / debt.minimumPayment);
      maxMonths = Math.max(maxMonths, months);
      
      // Simple interest calculation (not compound)
      const monthlyInterestRate = debt.interestRate / 100 / 12;
      const interest = debt.currentBalance * monthlyInterestRate * months;
      totalInterest += interest;
    });
    
    // Calculate projected payoff date
    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + maxMonths);
    
    return {
      payoffDate,
      totalInterest,
      months: maxMonths
    };
  };
  
  // Generate debt payoff projection data for chart
  const generatePayoffData = () => {
    if (debts.length === 0) return [];
    
    const months = Math.min(projections.months, 36); // Cap at 36 months for visualization
    const monthlyData = [];
    
    // Clone debts to avoid modifying the original data
    const debtsCopy = debts.map(debt => ({
      ...debt,
      currentBalance: debt.currentBalance,
      minimumPayment: debt.minimumPayment,
      interestRate: debt.interestRate
    }));
    
    // Sort debts according to selected strategy
    const sortedDebtsCopy = [...debtsCopy].sort((a, b) => {
      if (selectedStrategy === 'avalanche') {
        return b.interestRate - a.interestRate;
      } else {
        return a.currentBalance - b.currentBalance;
      }
    });
    
    let totalRemainingDebt = debtsCopy.reduce((sum, debt) => sum + debt.currentBalance, 0);
    
    // Add starting point
    monthlyData.push({
      month: 0,
      balance: totalRemainingDebt,
      label: 'Now'
    });
    
    // Calculate monthly payoff progress
    for (let month = 1; month <= months; month++) {
      // Calculate interest for each debt
      debtsCopy.forEach(debt => {
        const monthlyInterestRate = debt.interestRate / 100 / 12;
        const interestAmount = debt.currentBalance * monthlyInterestRate;
        debt.currentBalance += interestAmount;
      });
      
      // Apply payments according to strategy
      let remainingPayment = debtsCopy.reduce((sum, debt) => sum + debt.minimumPayment, 0);
      
      // First, make minimum payments on all debts
      debtsCopy.forEach(debt => {
        const payment = Math.min(debt.minimumPayment, debt.currentBalance);
        debt.currentBalance -= payment;
        remainingPayment -= payment;
      });
      
      // Then, apply any remaining payment to the focus debt
      if (remainingPayment > 0 && sortedDebtsCopy.length > 0) {
        const focusDebt = sortedDebtsCopy.find(debt => debt.currentBalance > 0);
        if (focusDebt) {
          focusDebt.currentBalance = Math.max(0, focusDebt.currentBalance - remainingPayment);
        }
      }
      
      // Calculate total remaining debt
      totalRemainingDebt = debtsCopy.reduce((sum, debt) => sum + debt.currentBalance, 0);
      
      // Add data point
      monthlyData.push({
        month,
        balance: totalRemainingDebt,
        label: month % 6 === 0 ? format(addMonths(new Date(), month), 'MMM yyyy') : ''
      });
      
      // If all debts are paid off, stop
      if (totalRemainingDebt <= 0) break;
    }
    
    return monthlyData;
  };
  
  const projections = calculatePayoffProjections();
  const payoffData = generatePayoffData();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={styles.summaryTitle}>Debt Overview</Text>
          
          <View style={styles.progressContainer}>
            <CircularProgress
              progress={progressPercentage}
              size={120}
              strokeWidth={12}
              color={theme.colors.primary}
            >
              <Text style={styles.progressPercentage}>
                {Math.round(progressPercentage * 100)}%
              </Text>
              <Text style={styles.progressLabel}>Paid Off</Text>
            </CircularProgress>
            
            <View style={styles.summaryDetails}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Debt</Text>
                <Text style={styles.summaryValue}>${totalCurrentDebt.toFixed(2)}</Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Paid So Far</Text>
                <Text style={styles.summaryValue}>${totalPaid.toFixed(2)}</Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Monthly Payment</Text>
                <Text style={styles.summaryValue}>${totalMonthlyPayment.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={[styles.projectionsCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={styles.sectionTitle}>Payoff Projections</Text>
          
          <View style={styles.projectionItem}>
            <Text style={styles.projectionLabel}>Estimated Payoff Date</Text>
            <Text style={styles.projectionValue}>
              {projections.payoffDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
            <Text style={styles.projectionSubtext}>
              (in approximately {projections.months} months)
            </Text>
          </View>
          
          <View style={styles.projectionItem}>
            <Text style={styles.projectionLabel}>Total Interest to be Paid</Text>
            <Text style={styles.projectionValue}>
              ${projections.totalInterest.toFixed(2)}
            </Text>
          </View>
          
          {payoffData.length > 0 && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Debt Payoff Projection</Text>
              <VictoryChart
                width={chartWidth}
                height={220}
                theme={VictoryTheme.material}
                domainPadding={{ y: [0, 20] }}
              >
                <VictoryAxis
                  tickValues={payoffData.filter(d => d.label).map(d => d.month)}
                  tickFormat={payoffData.filter(d => d.label).map(d => d.label)}
                  style={{
                    axis: { stroke: theme.colors.text },
                    tickLabels: { fill: theme.colors.text, fontSize: 10, angle: -45 },
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  tickFormat={(y) => `$${Math.round(y / 1000)}k`}
                  style={{
                    axis: { stroke: theme.colors.text },
                    tickLabels: { fill: theme.colors.text, fontSize: 10 },
                  }}
                />
                <VictoryLine
                  data={payoffData}
                  x="month"
                  y="balance"
                  style={{
                    data: { 
                      stroke: selectedStrategy === 'avalanche' ? theme.colors.primary : theme.colors.accent,
                      strokeWidth: 3 
                    },
                  }}
                  animate={{ duration: 500 }}
                />
              </VictoryChart>
              
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View 
                    style={[
                      styles.legendColor, 
                      { backgroundColor: selectedStrategy === 'avalanche' ? theme.colors.primary : theme.colors.accent }
                    ]} 
                  />
                  <Text style={styles.legendText}>
                    {selectedStrategy === 'avalanche' ? 'Avalanche Strategy' : 'Snowball Strategy'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.chartDescription}>
                This chart shows your projected debt balance over time using the {selectedStrategy} strategy.
                {selectedStrategy === 'avalanche' 
                  ? ' By focusing on high-interest debt first, you minimize total interest paid.'
                  : ' By focusing on small debts first, you build momentum with quick wins.'}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.strategyContainer}>
          <Text style={styles.sectionTitle}>Payoff Strategy</Text>
          
          <View style={styles.strategyButtons}>
            <Button
              mode={selectedStrategy === 'avalanche' ? 'contained' : 'outlined'}
              onPress={() => handleStrategyChange('avalanche')}
              style={styles.strategyButton}
            >
              Debt Avalanche
            </Button>
            
            <Button
              mode={selectedStrategy === 'snowball' ? 'contained' : 'outlined'}
              onPress={() => handleStrategyChange('snowball')}
              style={styles.strategyButton}
            >
              Debt Snowball
            </Button>
          </View>
          
          <Text style={styles.strategyDescription}>
            {selectedStrategy === 'avalanche' 
              ? 'Debt Avalanche: Pay off debts with the highest interest rates first to minimize interest payments.'
              : 'Debt Snowball: Pay off smallest debts first to build momentum and motivation.'}
          </Text>
        </View>
        
        <View style={styles.debtList}>
          <Text style={styles.sectionTitle}>Your Debts</Text>
          
          {sortedDebts.length > 0 ? (
            sortedDebts.map((debt, index) => (
              <View key={debt.id}>
                {index === 0 && selectedStrategy === 'avalanche' && (
                  <Text style={[styles.focusText, { color: theme.colors.primary }]}>
                    Focus on this high-interest debt first!
                  </Text>
                )}
                {index === 0 && selectedStrategy === 'snowball' && (
                  <Text style={[styles.focusText, { color: theme.colors.primary }]}>
                    Focus on this small debt first for a quick win!
                  </Text>
                )}
                <DebtCard
                  debt={debt}
                  onPress={handleDebtPress}
                />
              </View>
            ))
          ) : (
            <EmptyState
              icon="bank"
              title="No Debts Found"
              description="Add your debts to start tracking your payoff progress."
              action={
                <Button mode="contained" onPress={handleAddDebt}>
                  Add Debt
                </Button>
              }
            />
          )}
        </View>
      </ScrollView>
      
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={handleAddDebt}
        label="Add Debt"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    marginTop: 16,
  },
  chartDescription: {
    fontSize: 12,
    marginTop: 8,
    opacity: 0.7,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
    textAlign: 'center',
  },
  container: {
    flex: 1,
  },
  debtList: {
    margin: 16,
  },
  fab: {
    bottom: 0,
    margin: 16,
    position: 'absolute',
    right: 0,
  },
  focusText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
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
  progressContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  projectionItem: {
    marginBottom: 16,
  },
  projectionLabel: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.7,
  },
  projectionSubtext: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.7,
  },
  projectionValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  projectionsCard: {
    borderRadius: 8,
    margin: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  strategyButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  strategyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  strategyContainer: {
    margin: 16,
  },
  strategyDescription: {
    fontSize: 12,
    marginBottom: 16,
    marginTop: 8,
    opacity: 0.7,
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
  summaryItem: {
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DebtScreen;
