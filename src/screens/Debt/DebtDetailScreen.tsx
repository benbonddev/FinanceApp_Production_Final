import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme, Button, Card, Divider, IconButton } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { selectDebtById, updateDebt, deleteDebt, makePayment } from '../../store/slices/debtSlice';
import LinearProgress from '../../components/Progress/LinearProgress';
import CircularProgress from '../../components/Progress/CircularProgress';
import Modal from '../../components/Modal/Modal';
import { Debt, RootStackParamList } from '../../types';
import { format, addMonths } from 'date-fns';
import { VictoryLine, VictoryChart, VictoryAxis, VictoryTheme } from 'victory-native';

type DebtDetailRouteProp = RouteProp<RootStackParamList, 'DebtDetail'>;
type DebtDetailNavigationProp = StackNavigationProp<RootStackParamList>;

const DebtDetailScreen: React.FC = () => {
  const theme = useTheme();
  const route = useRoute<DebtDetailRouteProp>();
  const navigation = useNavigation<DebtDetailNavigationProp>();
  const dispatch = useAppDispatch();
  const { debtId } = route.params;
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  
  const debt = useAppSelector(state => selectDebtById(state, debtId));
  
  // Handle edit debt
  const handleEditDebt = () => {
    if (!debt) return;
    navigation.navigate('EditDebt', { debtId: debt.id });
  };
  
  // Handle delete debt
  const handleDeleteDebt = () => {
    if (!debt) return;
    setShowDeleteConfirm(true);
  };
  
  // Confirm delete debt
  const confirmDeleteDebt = () => {
    if (!debt) return;
    dispatch(deleteDebt(debt.id));
    setShowDeleteConfirm(false);
    navigation.goBack();
  };
  
  // Handle make payment
  const handleMakePayment = () => {
    setPaymentAmount(debt?.minimumPayment.toString() || '');
    setShowPaymentModal(true);
  };
  
  // Confirm payment
  const confirmPayment = () => {
    if (!debt || !paymentAmount) return;
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    dispatch(makePayment({
      id: debt.id,
      amount,
      date: new Date().toISOString()
    }));
    
    setShowPaymentModal(false);
  };
  
  // Calculate payoff date and total interest
  const calculatePayoffProjections = () => {
    if (!debt) return { months: 0, totalInterest: 0, payoffDate: new Date() };
    
    // Simple calculation: months = balance / minimum payment
    const months = Math.ceil(debt.currentBalance / debt.minimumPayment);
    
    // Simple interest calculation (not compound)
    const monthlyInterestRate = debt.interestRate / 100 / 12;
    const totalInterest = debt.currentBalance * monthlyInterestRate * months;
    
    // Calculate projected payoff date
    const payoffDate = addMonths(new Date(), months);
    
    return {
      months,
      totalInterest,
      payoffDate
    };
  };
  
  // Generate debt payoff projection data for chart
  const generatePayoffData = () => {
    if (!debt) return [];
    
    const projections = calculatePayoffProjections();
    const months = Math.min(projections.months, 36); // Cap at 36 months for visualization
    const monthlyData = [];
    
    let remainingBalance = debt.currentBalance;
    const monthlyPayment = debt.minimumPayment;
    const monthlyInterestRate = debt.interestRate / 100 / 12;
    
    // Add starting point
    monthlyData.push({
      month: 0,
      balance: remainingBalance,
      label: 'Now'
    });
    
    // Calculate monthly payoff progress
    for (let month = 1; month <= months; month++) {
      // Calculate interest
      const interestAmount = remainingBalance * monthlyInterestRate;
      remainingBalance += interestAmount;
      
      // Apply payment
      const payment = Math.min(monthlyPayment, remainingBalance);
      remainingBalance -= payment;
      
      // Add data point
      monthlyData.push({
        month,
        balance: remainingBalance,
        label: month % 6 === 0 ? format(addMonths(new Date(), month), 'MMM yyyy') : ''
      });
      
      // If debt is paid off, stop
      if (remainingBalance <= 0) break;
    }
    
    return monthlyData;
  };
  
  if (!debt) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Debt not found
        </Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }
  
  const projections = calculatePayoffProjections();
  const payoffData = generatePayoffData();
  
  // Calculate progress
  const progress = debt.initialAmount > 0 ? 
    (debt.initialAmount - debt.currentBalance) / debt.initialAmount : 0;
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{debt.name}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.primary }]}>
              {debt.type.charAt(0).toUpperCase() + debt.type.slice(1)}
            </Text>
          </View>
          <View style={styles.actions}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={handleEditDebt}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={handleDeleteDebt}
            />
          </View>
        </View>
        
        <Card style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Current Balance</Text>
              <Text style={styles.balanceValue}>${debt.currentBalance.toFixed(2)}</Text>
            </View>
            
            <View style={styles.progressContainer}>
              <CircularProgress
                progress={progress}
                size={100}
                strokeWidth={10}
                color={theme.colors.primary}
                showPercentage={true}
              />
              <Text style={styles.progressLabel}>
                {Math.round(progress * 100)}% Paid Off
              </Text>
            </View>
            
            <Button
              mode="contained"
              onPress={handleMakePayment}
              style={styles.paymentButton}
            >
              Make Payment
            </Button>
          </Card.Content>
        </Card>
        
        <Card style={[styles.detailsCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Debt Details</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Original Amount</Text>
              <Text style={styles.detailValue}>${debt.initialAmount.toFixed(2)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Interest Rate</Text>
              <Text style={styles.detailValue}>{debt.interestRate.toFixed(2)}%</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Minimum Payment</Text>
              <Text style={styles.detailValue}>${debt.minimumPayment.toFixed(2)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Due Date</Text>
              <Text style={styles.detailValue}>{debt.dueDay}th of each month</Text>
            </View>
            
            {debt.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.detailLabel}>Notes</Text>
                <Text style={styles.notes}>{debt.notes}</Text>
              </View>
            )}
          </Card.Content>
        </Card>
        
        <Card style={[styles.projectionCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Payoff Projections</Text>
            
            <View style={styles.projectionRow}>
              <Text style={styles.projectionLabel}>Estimated Payoff Date</Text>
              <Text style={styles.projectionValue}>
                {format(projections.payoffDate, 'MMMM d, yyyy')}
              </Text>
              <Text style={styles.projectionSubtext}>
                (in approximately {projections.months} months)
              </Text>
            </View>
            
            <View style={styles.projectionRow}>
              <Text style={styles.projectionLabel}>Total Interest to be Paid</Text>
              <Text style={styles.projectionValue}>
                ${projections.totalInterest.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Balance Over Time</Text>
              <VictoryChart
                width={300}
                height={200}
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
                      stroke: theme.colors.primary,
                      strokeWidth: 3 
                    },
                  }}
                  animate={{ duration: 500 }}
                />
              </VictoryChart>
            </View>
          </Card.Content>
        </Card>
        
        <Card style={[styles.paymentHistoryCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Payment History</Text>
            
            {debt.paymentHistory && debt.paymentHistory.length > 0 ? (
              debt.paymentHistory.map((payment, index) => (
                <View key={index} style={styles.paymentItem}>
                  <View style={styles.paymentDetails}>
                    <Text style={styles.paymentDate}>
                      {format(new Date(payment.date), 'MMMM d, yyyy')}
                    </Text>
                    <Text style={styles.paymentAmount}>
                      ${payment.amount.toFixed(2)}
                    </Text>
                  </View>
                  {index < debt.paymentHistory.length - 1 && <Divider style={styles.divider} />}
                </View>
              ))
            ) : (
              <Text style={styles.noPaymentsText}>No payment history available</Text>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
      
      <Modal
        visible={showDeleteConfirm}
        onDismiss={() => setShowDeleteConfirm(false)}
        title="Delete Debt"
        actions={[
          {
            label: 'Cancel',
            onPress: () => setShowDeleteConfirm(false),
            mode: 'text',
          },
          {
            label: 'Delete',
            onPress: confirmDeleteDebt,
            mode: 'contained',
            color: theme.colors.error,
          },
        ]}
      >
        <Text>Are you sure you want to delete this debt? This action cannot be undone.</Text>
      </Modal>
      
      <Modal
        visible={showPaymentModal}
        onDismiss={() => setShowPaymentModal(false)}
        title="Make Payment"
        actions={[
          {
            label: 'Cancel',
            onPress: () => setShowPaymentModal(false),
            mode: 'text',
          },
          {
            label: 'Submit Payment',
            onPress: confirmPayment,
            mode: 'contained',
          },
        ]}
      >
        <View>
          <Text style={styles.paymentModalText}>
            Enter the payment amount for {debt.name}:
          </Text>
          <TextInput
            label="Payment Amount"
            value={paymentAmount}
            onChangeText={setPaymentAmount}
            keyboardType="numeric"
            leftIcon="currency-usd"
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  chartTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  container: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 16,
    opacity: 0.7,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  detailsCard: {
    margin: 16,
    marginTop: 0,
  },
  divider: {
    marginVertical: 4,
  },
  errorText: {
    fontSize: 16,
    margin: 24,
    textAlign: 'center',
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  noPaymentsText: {
    opacity: 0.7,
    padding: 16,
    textAlign: 'center',
  },
  notes: {
    fontSize: 16,
    marginTop: 4,
    opacity: 0.8,
  },
  notesContainer: {
    marginTop: 12,
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  paymentButton: {
    marginTop: 8,
  },
  paymentDate: {
    fontSize: 14,
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  paymentHistoryCard: {
    margin: 16,
    marginBottom: 24,
    marginTop: 0,
  },
  paymentItem: {
    marginBottom: 8,
  },
  paymentModalText: {
    marginBottom: 16,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 14,
    marginTop: 8,
  },
  projectionCard: {
    margin: 16,
    marginTop: 0,
  },
  projectionLabel: {
    fontSize: 16,
    opacity: 0.7,
  },
  projectionRow: {
    marginBottom: 12,
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
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  summaryCard: {
    margin: 16,
    marginTop: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
  },
});

export default DebtDetailScreen;
