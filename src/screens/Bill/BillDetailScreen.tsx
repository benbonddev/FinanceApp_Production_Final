import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme, Button, IconButton, Divider, Card } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { selectBillById, payBill, unpayBill, updateBill, deleteBill } from '../../store/slices/billsSlice';
import { selectAllPaychecks, selectNextPaycheck } from '../../store/slices/paychecksSlice';
import Modal from '../../components/Modal/Modal';
import BottomSheetModal from '../../components/Modal/BottomSheetModal';
import { Bill, RootStackParamList } from '../../types';
import { format, parseISO, differenceInDays } from 'date-fns';
import { logger } from '../../utils/logger';

type BillDetailRouteProp = RouteProp<RootStackParamList, 'BillDetail'>;
type BillDetailNavigationProp = StackNavigationProp<RootStackParamList>;

const BillDetailScreen: React.FC = () => {
  const theme = useTheme();
  const route = useRoute<BillDetailRouteProp>();
  const navigation = useNavigation<BillDetailNavigationProp>();
  const dispatch = useAppDispatch();
  const { billId } = route.params;
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const bill = useAppSelector(state => selectBillById(state, billId));
  const paychecks = useAppSelector(selectAllPaychecks);
  const nextPaycheck = useAppSelector(selectNextPaycheck);
  
  // Calculate bill insights with null safety
  const calculateYearEndTotal = () => {
    if (!bill || !bill.isRecurring || !bill.amount) return bill?.amount || 0;
    
    const monthsRemaining = 12 - new Date().getMonth();
    const amount = bill.amount || 0;
    
    switch (bill.recurringFrequency) {
      case 'weekly':
        return amount * (4 * monthsRemaining);
      case 'biweekly':
        return amount * (2 * monthsRemaining);
      case 'monthly':
        return amount * monthsRemaining;
      case 'quarterly':
        return amount * (monthsRemaining / 3);
      case 'yearly':
        return amount;
      default:
        return amount * monthsRemaining;
    }
  };
  
  const yearEndTotal = calculateYearEndTotal();
  
  // Handle pay now with null safety
  const handlePayNow = () => {
    if (!bill || !bill.id) return;
    
    dispatch(payBill({
      id: bill.id,
      paidDate: new Date().toISOString(),
    }));
  };
  
  // Handle pay later with null safety
  const handlePayLater = () => {
    if (!bill || !bill.id || !nextPaycheck || !nextPaycheck.id) return;
    
    // Update the bill with the next paycheck ID
    const updatedBill: Bill = {
      ...bill,
      payPeriodId: nextPaycheck.id
    };
    
    dispatch(updateBill(updatedBill));
  };
  
  // Handle edit bill
  const handleEditBill = () => {
    if (!bill) return;
    navigation.navigate('EditBill', { billId: bill.id });
  };
  
  // Handle delete with null safety
  const handleDelete = () => {
    if (!bill || !bill.id) return;
    
    dispatch(deleteBill(bill.id));
    setShowDeleteConfirm(false);
    navigation.goBack();
  };
  
  if (!bill) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Bill not found
        </Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }
  
  // Render bill details with null safety
  let dueDate = new Date();
  try {
    dueDate = bill.dueDate ? parseISO(bill.dueDate) : new Date();
  } catch (error) {
    logger.error('Invalid date format:', bill.dueDate);
  }
  
  const today = new Date();
  const daysUntilDue = differenceInDays(dueDate, today);
  const isOverdue = daysUntilDue < 0 && !bill.isPaid;
  
  let paidDate = 'Unknown date';
  if (bill.isPaid && bill.paidDate) {
    try {
      paidDate = format(parseISO(bill.paidDate), 'MMM d, yyyy');
    } catch (error) {
      logger.error('Invalid paid date format:', bill.paidDate);
    }
  }
  
  let formattedDueDate = 'Unknown date';
  try {
    formattedDueDate = format(dueDate, 'MMM d, yyyy');
  } catch (error) {
    logger.error('Error formatting due date');
  }
  
  const assignedPaycheck = paychecks.find(p => p.id === bill.payPeriodId);
  let paycheckDate = '';
  if (assignedPaycheck && assignedPaycheck.date) {
    try {
      paycheckDate = format(parseISO(assignedPaycheck.date), 'MMM d, yyyy');
    } catch (error) {
      logger.error('Invalid paycheck date format:', assignedPaycheck.date);
    }
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{bill.name || 'Unnamed Bill'}</Text>
            <Text style={[styles.category, { color: theme.colors.primary }]}>{bill.category || 'Uncategorized'}</Text>
          </View>
          <View style={styles.actions}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={handleEditBill}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => setShowDeleteConfirm(true)}
            />
          </View>
        </View>
        
        <Card style={[styles.amountCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Amount Due</Text>
              <Text style={styles.amount}>${(bill.amount || 0).toFixed(2)}</Text>
            </View>
            
            <View style={styles.dateContainer}>
              <Text style={[
                styles.dueDate,
                { 
                  color: isOverdue ? 
                    theme.colors.error : 
                    bill.isPaid ? 
                      theme.colors.success : 
                      theme.colors.text 
                }
              ]}>
                {bill.isPaid 
                  ? `Paid on ${paidDate}`
                  : isOverdue
                    ? `Overdue by ${Math.abs(daysUntilDue)} days`
                    : `Due on ${formattedDueDate} (in ${daysUntilDue} days)`
                }
              </Text>
            </View>
            
            {bill.isPaid ? (
              <Button
                mode="outlined"
                onPress={() => dispatch(unpayBill(bill.id))}
                style={styles.payButton}
              >
                Mark as Unpaid
              </Button>
            ) : (
              <View style={styles.payButtons}>
                <Button
                  mode="contained"
                  onPress={handlePayNow}
                  style={styles.payButton}
                >
                  Pay Now
                </Button>
                
                <Button
                  mode="outlined"
                  onPress={handlePayLater}
                  style={styles.payButton}
                  disabled={!nextPaycheck}
                >
                  Pay Later
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>
        
        <Card style={[styles.detailsCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Bill Details</Text>
            
            <View style={styles.detailsRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={[
                styles.detailValue, 
                { 
                  color: bill.isPaid ? 
                    theme.colors.success : 
                    isOverdue ? 
                      theme.colors.error : 
                      theme.colors.text 
                }
              ]}>
                {bill.isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Pending'}
              </Text>
            </View>
            
            {bill.isRecurring && (
              <View style={styles.detailsRow}>
                <Text style={styles.detailLabel}>Frequency:</Text>
                <Text style={styles.detailValue}>
                  {bill.recurringFrequency 
                    ? bill.recurringFrequency.charAt(0).toUpperCase() + bill.recurringFrequency.slice(1) 
                    : 'Monthly'}
                </Text>
              </View>
            )}
            
            {bill.isDynamic && (
              <View style={styles.detailsRow}>
                <Text style={styles.detailLabel}>Amount Type:</Text>
                <Text style={styles.detailValue}>Dynamic (varies each period)</Text>
              </View>
            )}
            
            {bill.payPeriodId && assignedPaycheck && (
              <View style={styles.detailsRow}>
                <Text style={styles.detailLabel}>Assigned to:</Text>
                <Text style={styles.detailValue}>
                  {assignedPaycheck.name} ({paycheckDate})
                </Text>
              </View>
            )}
            
            {bill.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.detailLabel}>Notes:</Text>
                <Text style={styles.notes}>{bill.notes}</Text>
              </View>
            )}
          </Card.Content>
        </Card>
        
        <Card style={[styles.insightsCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Bill Insights</Text>
            
            {bill.isRecurring && (
              <View style={styles.insightContainer}>
                <Text style={styles.insightLabel}>Projected Year-End Total:</Text>
                <Text style={styles.insightValue}>${yearEndTotal.toFixed(2)}</Text>
              </View>
            )}
            
            {bill.isDynamic && (
              <View style={styles.insightContainer}>
                <Text style={styles.insightLabel}>Average Amount:</Text>
                <Text style={styles.insightValue}>${(bill.amount || 0).toFixed(2)}</Text>
                <Text style={styles.insightNote}>
                  (Based on current amount as historical data is not available)
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
      
      <Modal
        visible={showDeleteConfirm}
        onDismiss={() => setShowDeleteConfirm(false)}
        title="Delete Bill"
        actions={[
          {
            label: 'Cancel',
            onPress: () => setShowDeleteConfirm(false),
            mode: 'text',
          },
          {
            label: 'Delete',
            onPress: handleDelete,
            mode: 'contained',
            color: theme.colors.error,
          },
        ]}
      >
        <Text>Are you sure you want to delete this bill? This action cannot be undone.</Text>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  amountCard: {
    margin: 16,
    marginTop: 0,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  category: {
    fontSize: 16,
    marginTop: 4,
  },
  container: {
    flex: 1,
  },
  dateContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 16,
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  detailsCard: {
    margin: 16,
    marginTop: 0,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dueDate: {
    fontSize: 16,
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
  insightContainer: {
    marginBottom: 12,
  },
  insightLabel: {
    fontSize: 16,
    opacity: 0.7,
  },
  insightNote: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.5,
  },
  insightValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  insightsCard: {
    margin: 16,
    marginBottom: 24,
    marginTop: 0,
  },
  notes: {
    fontSize: 16,
    marginTop: 4,
    opacity: 0.8,
  },
  notesContainer: {
    marginTop: 12,
  },
  payButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  payButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
  },
});

export default BillDetailScreen;
