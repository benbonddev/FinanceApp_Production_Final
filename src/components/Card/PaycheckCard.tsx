import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { format, parseISO } from 'date-fns';
import { Paycheck } from '../../types';

interface PaycheckCardProps {
  paycheck: Paycheck;
  onPress: (paycheck: Paycheck) => void;
  onLongPress?: (paycheck: Paycheck) => void;
  billsCount?: number;
  billsPaid?: number;
  totalBillsAmount?: number;
  remainingAmount?: number;
}

const PaycheckCard: React.FC<PaycheckCardProps> = ({
  paycheck,
  onPress,
  onLongPress,
  billsCount = 0,
  billsPaid = 0,
  totalBillsAmount = 0,
  remainingAmount,
}) => {
  const theme = useTheme();
  
  // Parse date safely
  const paycheckDate = paycheck.date ? parseISO(paycheck.date) : new Date();
  
  // Format the date
  const formattedDate = format(paycheckDate, 'MMM d, yyyy');
  
  // Determine if paycheck is in the past
  const isPast = paycheckDate < new Date();
  
  // Calculate remaining amount if not provided
  const calculatedRemaining = remainingAmount !== undefined 
    ? remainingAmount 
    : paycheck.amount - totalBillsAmount;
  
  // Determine status color
  const statusColor = isPast 
    ? (theme.colors.success || '#4CAF50') 
    : theme.colors.primary;
  
  return (
    <TouchableOpacity
      onPress={() => onPress(paycheck)}
      onLongPress={onLongPress ? () => onLongPress(paycheck) : undefined}
      delayLongPress={300}
    >
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.content}>
          <View style={styles.header}>
            <View style={styles.leftContent}>
              <MaterialCommunityIcons
                name="cash"
                size={24}
                color={statusColor}
                style={styles.icon}
              />
              <View>
                <Text variant="titleMedium" style={styles.title}>{paycheck.name}</Text>
                <Text variant="bodyMedium" style={styles.date}>
                  {formattedDate}
                </Text>
              </View>
            </View>
            <View style={styles.rightContent}>
              <Text variant="titleMedium" style={styles.amount}>
                ${paycheck.amount.toFixed(2)}
              </Text>
              {paycheck.isRecurring && (
                <Text variant="bodySmall" style={styles.recurring}>
                  {paycheck.recurringFrequency || 'Recurring'}
                </Text>
              )}
            </View>
          </View>
          
          {billsCount > 0 && (
            <View style={styles.summary}>
              <View style={styles.summaryItem}>
                <Text variant="bodySmall">Bills</Text>
                <Text variant="bodyMedium">{billsPaid}/{billsCount}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text variant="bodySmall">Allocated</Text>
                <Text variant="bodyMedium">${totalBillsAmount.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text variant="bodySmall">Remaining</Text>
                <Text 
                  variant="bodyMedium" 
                  style={{ 
                    color: calculatedRemaining < 0 
                      ? theme.colors.error 
                      : theme.colors.success || '#4CAF50'
                  }}
                >
                  ${calculatedRemaining.toFixed(2)}
                </Text>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  amount: {
    fontWeight: 'bold',
  },
  card: {
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 6,
  },
  content: {
    flexDirection: 'column',
  },
  date: {
    fontSize: 14,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  icon: {
    marginRight: 12,
  },
  leftContent: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 3,
  },
  recurring: {
    marginTop: 4,
    opacity: 0.7,
  },
  rightContent: {
    alignItems: 'flex-end',
    flex: 1,
  },
  summary: {
    borderTopColor: 'rgba(0,0,0,0.1)',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
  },
  summaryItem: {
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
  },
});

export default PaycheckCard;
