import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card, Text, useTheme, Badge } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { format, parseISO } from 'date-fns';
import { Bill } from '../../types';

interface BillCardProps {
  bill: Bill;
  onPress: (bill: Bill) => void;
  onLongPress: (bill: Bill) => void;
}

const BillCard: React.FC<BillCardProps> = ({ bill, onPress, onLongPress }) => {
  const theme = useTheme();
  
  // Calculate if bill is due soon (within 3 days)
  const today = new Date();
  const dueDate = bill.dueDate ? parseISO(bill.dueDate) : today;
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isDueSoon = diffDays >= 0 && diffDays <= 3;
  const isOverdue = diffDays < 0;
  
  // Format the due date
  const formattedDate = format(dueDate, 'MMM d, yyyy');
  
  // Determine status color - use standard theme colors with fallbacks
  let statusColor = theme.colors.text;
  if (bill.isPaid) {
    statusColor = theme.colors.success || '#4CAF50';
  } else if (isOverdue) {
    statusColor = theme.colors.error;
  } else if (isDueSoon) {
    statusColor = theme.colors.warning || '#FFC107';
  }
  
  return (
    <TouchableOpacity
      onPress={() => onPress(bill)}
      onLongPress={() => onLongPress(bill)}
      delayLongPress={300}
    >
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content style={styles.content}>
          <View style={styles.leftContent}>
            <MaterialCommunityIcons
              name={bill.isPaid ? "check-circle" : "calendar"}
              size={24}
              color={statusColor}
              style={styles.icon}
            />
            <View>
              <Text variant="titleMedium" style={styles.title}>{bill.name}</Text>
              <Text variant="bodyMedium" style={[styles.date, { color: statusColor }]}>
                {bill.isPaid ? 'Paid' : `Due ${formattedDate}`}
              </Text>
              {bill.isRecurring && (
                <Badge style={styles.badge}>
                  Recurring
                </Badge>
              )}
            </View>
          </View>
          <View style={styles.rightContent}>
            <Text variant="titleMedium" style={[styles.amount, { color: statusColor }]}>
              ${bill.amount.toFixed(2)}
            </Text>
            {bill.category && (
              <Text variant="bodySmall" style={styles.category}>{bill.category}</Text>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  amount: {
    fontWeight: 'bold',
  },
  badge: {
    marginTop: 4,
  },
  card: {
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 6,
  },
  category: {
    marginTop: 4,
    opacity: 0.7,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: 14,
  },
  icon: {
    marginRight: 12,
  },
  leftContent: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 3,
  },
  rightContent: {
    alignItems: 'flex-end',
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
  },
});

export default BillCard;
