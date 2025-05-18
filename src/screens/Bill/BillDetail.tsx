import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme, Button, IconButton, Divider } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { selectBillById, payBill, unpayBill, updateBill, deleteBill } from '../../store/slices/billsSlice';
import { selectAllPaychecks, selectNextPaycheck } from '../../store/slices/paychecksSlice';
import Modal from '../../components/Modal/Modal';
import BottomSheetModal from '../../components/Modal/BottomSheetModal';
import TextInput from '../../components/Form/TextInput';
import DatePicker from '../../components/Form/DatePicker';
import Dropdown from '../../components/Form/Dropdown';
import SwitchInput from '../../components/Form/SwitchInput';
import { Bill } from '../../types';
import { format, parseISO, differenceInDays } from 'date-fns';
import { logger } from '../../utils/logger';

interface BillDetailProps {
  billId?: string;
  isVisible: boolean;
  onClose: () => void;
}

const BillDetail: React.FC<BillDetailProps> = ({ billId, isVisible, onClose }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  
  const bill = useAppSelector(state => billId ? selectBillById(state, billId) : undefined);
  const paychecks = useAppSelector(selectAllPaychecks) || [];
  const nextPaycheck = useAppSelector(selectNextPaycheck);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [category, setCategory] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [notes, setNotes] = useState('');
  const [isDynamic, setIsDynamic] = useState(false);
  const [payPeriodId, setPayPeriodId] = useState('');
  
  // Initialize form with bill data when entering edit mode
  React.useEffect(() => {
    if (bill && isEditMode) {
      setName(bill.name || '');
      setAmount(bill.amount?.toString() || '0');
      try {
        setDueDate(bill.dueDate ? parseISO(bill.dueDate) : new Date());
      } catch (error) {
        // Handle date parsing error gracefully
        setDueDate(new Date());
        logger.error('Error parsing due date:', error);
      }
      setCategory(bill.category || '');
      setIsRecurring(bill.isRecurring || false);
      setRecurringFrequency(bill.recurringFrequency || 'monthly');
      setNotes(bill.notes || '');
      setIsDynamic(bill.isDynamic || false);
      setPayPeriodId(bill.payPeriodId || '');
    }
  }, [bill, isEditMode]);
  
  if (!bill) {
    return null;
  }
  
  // Calculate bill insights with null safety
  const calculateYearEndTotal = () => {
    if (!bill.isRecurring || !bill.amount) return bill.amount || 0;
    
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
  
  // Handle save edit with null safety
  const handleSaveEdit = () => {
    if (!bill || !bill.id) return;
    
    let parsedAmount = 0;
    try {
      parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount)) parsedAmount = 0;
    } catch (error) {
      parsedAmount = 0;
      logger.error('Error parsing amount:', error);
    }
    
    const updatedBill: Bill = {
      ...bill,
      name: name || 'Unnamed Bill',
      amount: parsedAmount,
      dueDate: dueDate.toISOString(),
      category: category || 'Uncategorized',
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : undefined,
      notes,
      isDynamic,
      payPeriodId: payPeriodId || undefined,
    };
    
    dispatch(updateBill(updatedBill));
    setIsEditMode(false);
  };
  
  // Handle delete with null safety
  const handleDelete = () => {
    if (!bill || !bill.id) return;
    
    dispatch(deleteBill(bill.id));
    setShowDeleteConfirm(false);
    onClose();
  };
  
  // Render edit form
  const renderEditForm = () => {
    return (
      <ScrollView style={styles.editForm}>
        <TextInput
          label="Bill Name"
          value={name}
          onChangeText={setName}
          placeholder="Enter bill name"
        />
        
        <TextInput
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          placeholder="Enter amount"
          keyboardType="numeric"
          leftIcon="currency-usd"
        />
        
        <DatePicker
          label="Due Date"
          value={dueDate}
          onChange={setDueDate}
        />
        
        <TextInput
          label="Category"
          value={category}
          onChangeText={setCategory}
          placeholder="Enter category"
        />
        
        <SwitchInput
          label="Recurring Bill"
          value={isRecurring}
          onValueChange={setIsRecurring}
          description="This bill repeats on a regular schedule"
        />
        
        {isRecurring && (
          <Dropdown
            label="Frequency"
            value={recurringFrequency}
            options={[
              { label: 'Weekly', value: 'weekly' },
              { label: 'Bi-weekly', value: 'biweekly' },
              { label: 'Monthly', value: 'monthly' },
              { label: 'Quarterly', value: 'quarterly' },
              { label: 'Yearly', value: 'yearly' },
            ]}
            onSelect={(option) => option && setRecurringFrequency(option.value as any)}
          />
        )}
        
        <SwitchInput
          label="Dynamic Amount"
          value={isDynamic}
          onValueChange={setIsDynamic}
          description="Bill amount varies each period (like utilities)"
        />
        
        <Dropdown
          label="Assign to Paycheck"
          value={payPeriodId}
          options={(paychecks || []).map(paycheck => {
            if (!paycheck || !paycheck.date) return null;
            
            let formattedDate = 'Invalid Date';
            try {
              formattedDate = format(parseISO(paycheck.date), 'MMM d, yyyy');
            } catch (error) {
              // Handle date formatting error gracefully
              formattedDate = 'Unknown date';
              logger.error('Error formatting paycheck date:', error);
            }
            
            return {
              label: `${paycheck.name || 'Unnamed'} - ${formattedDate}`,
              value: paycheck.id || '',
            };
          }).filter(Boolean) as any[]}
          onSelect={(option) => option && setPayPeriodId(option.value as string)}
          placeholder="Select a paycheck"
        />
        
        <TextInput
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Add notes (optional)"
          multiline
          numberOfLines={3}
        />
        
        <View style={styles.editActions}>
          <Button
            mode="outlined"
            onPress={() => setIsEditMode(false)}
            style={styles.editButton}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSaveEdit}
            style={styles.editButton}
          >
            Save
          </Button>
        </View>
        
        <Button
          mode="text"
          color={theme.colors.error || theme.colors.notification}
          onPress={() => setShowDeleteConfirm(true)}
          style={styles.deleteButton}
        >
          Delete Bill
        </Button>
      </ScrollView>
    );
  };
  
  // Render bill details with null safety
  const renderBillDetails = () => {
    let dueDate = new Date();
    try {
      dueDate = bill.dueDate ? parseISO(bill.dueDate) : new Date();
    } catch (error) {
      // Handle date parsing error gracefully
      dueDate = new Date();
      logger.error('Error parsing bill due date:', error);
    }
    
    const today = new Date();
    const daysUntilDue = differenceInDays(dueDate, today);
    const isOverdue = daysUntilDue < 0 && !bill.isPaid;
    
    let paidDate = 'Unknown date';
    if (bill.isPaid && bill.paidDate) {
      try {
        paidDate = format(parseISO(bill.paidDate), 'MMM d, yyyy');
      } catch (error) {
        // Handle date formatting error gracefully
        paidDate = 'Unknown date';
        logger.error('Error formatting paid date:', error);
      }
    }
    
    let formattedDueDate = 'Unknown date';
    try {
      formattedDueDate = format(dueDate, 'MMM d, yyyy');
    } catch (error) {
      // Handle date formatting error gracefully
      formattedDueDate = 'Unknown date';
      logger.error('Error formatting due date:', error);
    }
    
    return (
      <ScrollView style={styles.detailsContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{bill.name || 'Unnamed Bill'}</Text>
          <IconButton
            icon="pencil"
            size={20}
            onPress={() => setIsEditMode(true)}
          />
        </View>
        
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Amount Due</Text>
          <Text style={styles.amount}>${(bill.amount || 0).toFixed(2)}</Text>
        </View>
        
        <View style={styles.dateContainer}>
          <Text style={[
            styles.dueDate,
            { 
              color: isOverdue ? 
                (theme.colors.error || theme.colors.notification) : 
                bill.isPaid ? 
                  (theme.colors.primary || theme.colors.primary) : 
                  (theme.colors.text || theme.colors.text) 
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
        
        <Divider style={styles.divider} />
        
        <View style={styles.detailsRow}>
          <Text style={styles.detailLabel}>Category:</Text>
          <Text style={styles.detailValue}>{bill.category || 'Uncategorized'}</Text>
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
        
        {bill.payPeriodId && (
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>Assigned to:</Text>
            <Text style={styles.detailValue}>
              {(paychecks || []).find(p => p && p.id === bill.payPeriodId)?.name || 'Unknown paycheck'}
            </Text>
          </View>
        )}
        
        {bill.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.detailLabel}>Notes:</Text>
            <Text style={styles.notes}>{bill.notes}</Text>
          </View>
        )}
        
        <Divider style={styles.divider} />
        
        <Text style={styles.insightsTitle}>Bill Insights</Text>
        
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
        
        {!bill.isPaid && (
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={handlePayNow}
              style={styles.actionButton}
            >
              Pay Now
            </Button>
            
            <Button
              mode="outlined"
              onPress={handlePayLater}
              style={styles.actionButton}
              disabled={!nextPaycheck}
            >
              Pay Later
            </Button>
          </View>
        )}
      </ScrollView>
    );
  };
  
  return (
    <>
      <BottomSheetModal
        isOpen={isVisible}
        onClose={onClose}
        title={isEditMode ? "Edit Bill" : "Bill Details"}
        snapPoints={['60%', '90%']}
      >
        {isEditMode ? renderEditForm() : renderBillDetails()}
      </BottomSheetModal>
      
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
            color: theme.colors.error || theme.colors.notification,
          },
        ]}
      >
        <Text>Are you sure you want to delete this bill? This action cannot be undone.</Text>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  amountContainer: {
    marginTop: 16,
  },
  amountLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  dateContainer: {
    marginTop: 8,
  },
  deleteButton: {
    marginTop: 24,
  },
  detailLabel: {
    fontSize: 16,
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 16,
  },
  detailsContainer: {
    padding: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  dueDate: {
    fontSize: 16,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  editButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  editForm: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  notes: {
    fontSize: 16,
    marginTop: 4,
  },
  notesContainer: {
    marginTop: 8,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default BillDetail;
