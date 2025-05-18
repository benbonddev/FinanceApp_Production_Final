import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card, Text, useTheme, ProgressBar } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Debt } from '../../types';

interface DebtCardProps {
  debt: Debt;
  onPress: (debt: Debt) => void;
}

const DebtCard: React.FC<DebtCardProps> = ({ debt, onPress }) => {
  const theme = useTheme();
  
  // Calculate progress percentage (how much has been paid off)
  const paidAmount = debt.initialAmount - debt.currentBalance;
  const progress = paidAmount / debt.initialAmount;
  const progressPercentage = Math.min(progress, 1); // Cap at 100%
  const isPaidOff = debt.currentBalance <= 0;
  
  // Determine icon based on debt category
  let iconName = 'bank';
  switch (debt.category) {
    case 'loan':
      iconName = 'cash-multiple';
      break;
    case 'credit_card':
      iconName = 'credit-card';
      break;
    case 'mortgage':
      iconName = 'home';
      break;
    default:
      iconName = 'bank';
  }
  
  return (
    <TouchableOpacity onPress={() => onPress(debt)}>
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.leftContent}>
              <MaterialCommunityIcons
                name={iconName}
                size={24}
                color={theme.colors.primary}
                style={styles.icon}
              />
              <View>
                <Text style={styles.title}>{debt.name}</Text>
                <Text style={styles.category}>
                  {debt.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
                <Text style={styles.interestRate}>
                  {debt.interestRate}% APR
                </Text>
              </View>
            </View>
            <View style={styles.rightContent}>
              <Text style={styles.currentBalance}>
                ${debt.currentBalance.toFixed(2)}
              </Text>
              <Text style={styles.initialAmount}>
                of ${debt.initialAmount.toFixed(2)}
              </Text>
              <Text style={styles.minimumPayment}>
                Min: ${debt.minimumPayment.toFixed(2)}
              </Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <ProgressBar 
              progress={progressPercentage} 
              color={isPaidOff ? theme.colors.success : theme.colors.primary}
              style={styles.progressBar}
            />
            <View style={styles.progressLabels}>
              <Text style={styles.progressText}>
                ${paidAmount.toFixed(2)} paid
              </Text>
              {!isPaidOff && (
                <Text style={styles.progressText}>
                  ${debt.currentBalance.toFixed(2)} remaining
                </Text>
              )}
              <Text style={[
                styles.progressPercentage, 
                { color: isPaidOff ? theme.colors.success : theme.colors.primary }
              ]}>
                {Math.round(progressPercentage * 100)}%
              </Text>
            </View>
            
            {isPaidOff && (
              <View style={[styles.paidOffBadge, { backgroundColor: theme.colors.success }]}>
                <MaterialCommunityIcons name="check" size={16} color="white" />
                <Text style={styles.paidOffText}>Paid Off!</Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 8,
  },
  category: {
    fontSize: 14,
    opacity: 0.8,
  },
  currentBalance: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  icon: {
    marginRight: 12,
  },
  initialAmount: {
    fontSize: 12,
    opacity: 0.8,
  },
  interestRate: {
    fontSize: 14,
    opacity: 0.8,
  },
  leftContent: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 3,
  },
  minimumPayment: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
  paidOffBadge: {
    alignItems: 'center',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    padding: 4,
  },
  paidOffText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  progressBar: {
    borderRadius: 4,
    height: 8,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressText: {
    fontSize: 12,
  },
  rightContent: {
    alignItems: 'flex-end',
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DebtCard;
