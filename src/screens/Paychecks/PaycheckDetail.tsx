import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme, Button, Divider, IconButton, Card } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { selectPaycheckById, deletePaycheck } from '../../store/slices/paychecksSlice';
import { selectBillsByPaycheckId } from '../../store/slices/billsSlice';
import { format, parseISO, addDays, addWeeks, addMonths } from 'date-fns';
import { Paycheck, Bill, RootStackParamList } from '../../types';
import BillCard from '../../components/Card/BillCard';
import EmptyState from '../../components/EmptyState/EmptyState';
import BottomSheetModal from '../../components/Modal/BottomSheetModal';

type PaycheckDetailRouteProp = RouteProp<RootStackParamList, 'PaycheckDetail'>;
type PaycheckDetailNavigationProp = StackNavigationProp<RootStackParamList>;

const PaycheckDetail: React.FC = () => {
  const theme = useTheme();
  const route = useRoute<PaycheckDetailRouteProp>();
  const navigation = useNavigation<PaycheckDetailNavigationProp>();
  const dispatch = useAppDispatch();
  const { paycheckId } = route.params;
  
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  
  const paycheck = useAppSelector(state => selectPaycheckById(state, paycheckId));
  const bills = useAppSelector(state => selectBillsByPaycheckId(state, paycheckId));
  
  // Calculate next occurrence if recurring
  const calculateNextOccurrence = (paycheck: Paycheck) => {
    if (!paycheck.isRecurring) return null;
    
    const currentDate = parseISO(paycheck.date);
    
    switch (paycheck.recurringFrequency) {
      case 'weekly':
        return addWeeks(currentDate, 1);
      case 'biweekly':
        return addWeeks(currentDate, 2);
      case 'monthly':
        return addMonths(currentDate, 1);
      default:
        return null;
    }
  };
  
  // Calculate total bills
  const totalBills = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const remaining = paycheck ? paycheck.amount - totalBills : 0;
  
  // Handle bill press
  const handleBillPress = (bill: Bill) => {
    navigation.navigate('BillDetail', { billId: bill.id });
  };
  
  // Handle edit paycheck
  const handleEditPaycheck = () => {
    if (paycheck) {
      navigation.navigate('EditPaycheck', { paycheckId: paycheck.id });
    }
  };
  
  // Handle delete paycheck
  const handleDeletePaycheck = () => {
    setDeleteModalVisible(true);
  };
  
  // Confirm delete paycheck
  const confirmDeletePaycheck = () => {
    if (paycheck) {
      dispatch(deletePaycheck(paycheck.id));
      setDeleteModalVisible(false);
      navigation.goBack();
    }
  };
  
  // Handle add bill
  const handleAddBill = () => {
    navigation.navigate('AddBill', { paycheckId: paycheckId });
  };
  
  if (!paycheck) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <EmptyState
          icon="cash-remove"
          title="Paycheck Not Found"
          description="The paycheck you're looking for doesn't exist or has been deleted."
          action={
            <Button mode="contained" onPress={() => navigation.goBack()}>
              Go Back
            </Button>
          }
        />
      </View>
    );
  }
  
  const nextOccurrence = calculateNextOccurrence(paycheck);
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{paycheck.name}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.text }]}>
              {paycheck.owner}
            </Text>
          </View>
          <View style={styles.actions}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={handleEditPaycheck}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={handleDeletePaycheck}
            />
          </View>
        </View>
        
        <Card style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Amount</Text>
              <Text style={styles.amount}>${paycheck.amount.toFixed(2)}</Text>
            </View>
            
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Date</Text>
              <Text style={styles.amountValue}>
                {format(parseISO(paycheck.date), 'MMMM d, yyyy')}
              </Text>
            </View>
            
            {paycheck.isRecurring && (
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Frequency</Text>
                <Text style={styles.amountValue}>
                  {paycheck.recurringFrequency === 'weekly' ? 'Weekly' : 
                   paycheck.recurringFrequency === 'biweekly' ? 'Bi-weekly' : 'Monthly'}
                </Text>
              </View>
            )}
            
            {nextOccurrence && (
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Next Occurrence</Text>
                <Text style={styles.amountValue}>
                  {format(nextOccurrence, 'MMMM d, yyyy')}
                </Text>
              </View>
            )}
            
            {paycheck.forSavings && (
              <View style={[styles.savingsTag, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text style={[styles.savingsText, { color: theme.colors.primary }]}>
                  Dedicated for Savings
                </Text>
              </View>
            )}
            
            {paycheck.notes && (
              <View style={styles.notes}>
                <Text style={styles.notesLabel}>Notes</Text>
                <Text style={styles.notesText}>{paycheck.notes}</Text>
              </View>
            )}
          </Card.Content>
        </Card>
        
        <View style={styles.billsSection}>
          <View style={styles.billsHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Associated Bills
            </Text>
            <Button 
              mode="text" 
              onPress={handleAddBill}
              icon="plus"
            >
              Add Bill
            </Button>
          </View>
          
          <Card style={[styles.balanceCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Total Bills</Text>
                <Text style={styles.balanceValue}>${totalBills.toFixed(2)}</Text>
              </View>
              
              <Divider style={styles.divider} />
              
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Remaining</Text>
                <Text style={[
                  styles.balanceValue, 
                  { color: remaining >= 0 ? theme.colors.success : theme.colors.error }
                ]}>
                  ${remaining.toFixed(2)}
                </Text>
              </View>
            </Card.Content>
          </Card>
          
          {bills.length > 0 ? (
            bills.map(bill => (
              <BillCard
                key={bill.id}
                bill={bill}
                onPress={() => handleBillPress(bill)}
              />
            ))
          ) : (
            <EmptyState
              icon="file-document-outline"
              title="No Bills Found"
              description="Add bills to associate with this paycheck."
              action={
                <Button mode="contained" onPress={handleAddBill}>
                  Add Bill
                </Button>
              }
            />
          )}
        </View>
      </ScrollView>
      
      <BottomSheetModal
        visible={deleteModalVisible}
        onDismiss={() => setDeleteModalVisible(false)}
        title="Delete Paycheck"
        content="Are you sure you want to delete this paycheck? This action cannot be undone."
        actions={[
          {
            label: 'Cancel',
            onPress: () => setDeleteModalVisible(false),
            mode: 'outlined',
          },
          {
            label: 'Delete',
            onPress: confirmDeletePaycheck,
            mode: 'contained',
            color: theme.colors.error,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  amountLabel: {
    fontSize: 16,
    opacity: 0.7,
  },
  amountRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  balanceCard: {
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 16,
  },
  balanceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  billsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  billsSection: {
    marginTop: 8,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  divider: {
    marginVertical: 8,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  notes: {
    marginTop: 16,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    opacity: 0.7,
  },
  savingsTag: {
    alignSelf: 'flex-start',
    borderRadius: 4,
    marginTop: 8,
    padding: 8,
  },
  savingsText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  summaryCard: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
  },
});

export default PaycheckDetail;
