import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card, Text, useTheme, ProgressBar } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Budget } from '../../types';

interface BudgetCardProps {
  budget: Budget;
  onPress: (budget: Budget) => void;
}

const BudgetCard: React.FC<BudgetCardProps> = ({ budget, onPress }) => {
  const theme = useTheme();
  
  // Calculate progress percentage (how much of budget has been used)
  const progress = budget.spent / budget.limit;
  const isOverBudget = progress > 1;
  
  // Determine color based on budget usage
  let progressColor = theme.colors.primary;
  if (progress >= 0.9 && progress < 1) {
    progressColor = theme.colors.warning;
  } else if (progress >= 1) {
    progressColor = theme.colors.error;
  }
  
  // Determine icon based on category
  let iconName = 'folder-outline';
  switch (budget.category.toLowerCase()) {
    case 'housing':
    case 'rent':
    case 'mortgage':
      iconName = 'home-outline';
      break;
    case 'food':
    case 'groceries':
    case 'dining':
      iconName = 'food-outline';
      break;
    case 'transportation':
    case 'car':
    case 'gas':
      iconName = 'car-outline';
      break;
    case 'utilities':
      iconName = 'flash-outline';
      break;
    case 'entertainment':
      iconName = 'movie-outline';
      break;
    case 'health':
    case 'medical':
      iconName = 'medical-bag';
      break;
    case 'shopping':
      iconName = 'cart-outline';
      break;
    case 'personal':
      iconName = 'account-outline';
      break;
    case 'education':
      iconName = 'school-outline';
      break;
    case 'savings':
      iconName = 'piggy-bank-outline';
      break;
    default:
      iconName = 'folder-outline';
  }
  
  return (
    <TouchableOpacity onPress={() => onPress(budget)}>
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
                <Text style={styles.title}>{budget.category}</Text>
                <Text style={styles.period}>
                  {budget.period === 'monthly' ? 'Monthly Budget' : 'Paycheck Budget'}
                </Text>
              </View>
            </View>
            <View style={styles.rightContent}>
              <Text style={[
                styles.spent, 
                { color: isOverBudget ? theme.colors.error : theme.colors.text }
              ]}>
                ${budget.spent.toFixed(2)}
              </Text>
              <Text style={styles.limit}>
                of ${budget.limit.toFixed(2)}
              </Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <ProgressBar 
              progress={Math.min(progress, 1)} 
              color={progressColor}
              style={styles.progressBar}
            />
            <View style={styles.progressLabels}>
              <Text style={styles.progressText}>
                {isOverBudget 
                  ? `$${(budget.spent - budget.limit).toFixed(2)} over budget` 
                  : `$${(budget.limit - budget.spent).toFixed(2)} remaining`}
              </Text>
              <Text style={[styles.progressPercentage, { color: progressColor }]}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
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
  header: {
    alignItems: 'flex-start',
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
  limit: {
    fontSize: 12,
    opacity: 0.8,
  },
  period: {
    fontSize: 14,
    opacity: 0.8,
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
  spent: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BudgetCard;
