import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card, Text, useTheme, Badge, ProgressBar } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';
import { Goal } from '../../types';

interface GoalCardProps {
  goal: Goal;
  onPress: (goal: Goal) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onPress }) => {
  const theme = useTheme();
  
  // Calculate progress percentage
  const progress = goal.currentAmount / goal.targetAmount;
  const progressPercentage = Math.min(progress, 1); // Cap at 100%
  const isCompleted = progress >= 1;
  
  // Format the target date
  const targetDate = new Date(goal.targetDate);
  const formattedDate = format(targetDate, 'MMM d, yyyy');
  
  // Calculate remaining amount
  const remainingAmount = goal.targetAmount - goal.currentAmount;
  
  // Determine icon based on goal type
  let iconName = 'star-outline';
  switch (goal.type) {
    case 'emergency_fund':
      iconName = 'shield-outline';
      break;
    case 'travel':
      iconName = 'airplane';
      break;
    case 'large_purchase':
      iconName = 'cart-outline';
      break;
    case 'debt_payoff':
      iconName = 'bank-outline';
      break;
    case 'retirement':
      iconName = 'home-outline';
      break;
    default:
      iconName = 'flag-outline';
  }
  
  // Format recurring frequency for display
  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'weekly':
        return 'Weekly';
      case 'biweekly':
        return 'Bi-weekly';
      case 'monthly':
        return 'Monthly';
      case 'quarterly':
        return 'Quarterly';
      case 'yearly':
        return 'Yearly';
      default:
        return 'Recurring';
    }
  };
  
  return (
    <TouchableOpacity onPress={() => onPress(goal)}>
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
                <Text style={styles.title}>{goal.name}</Text>
                <Text style={styles.type}>
                  {goal.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
                <View style={styles.badgeContainer}>
                  <Badge 
                    style={[
                      styles.badge, 
                      { 
                        backgroundColor: 
                          goal.priority === 'high' 
                            ? theme.colors.error 
                            : goal.priority === 'medium' 
                              ? theme.colors.warning 
                              : theme.colors.info 
                      }
                    ]}
                  >
                    {goal.priority.toUpperCase()}
                  </Badge>
                  {goal.isRecurring && (
                    <Badge style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                      {goal.recurringFrequency 
                        ? getFrequencyLabel(goal.recurringFrequency) 
                        : 'Recurring'}
                    </Badge>
                  )}
                </View>
              </View>
            </View>
            <View style={styles.rightContent}>
              <Text style={styles.targetAmount}>
                ${goal.targetAmount.toFixed(2)}
              </Text>
              <Text style={styles.targetDate}>
                By {formattedDate}
              </Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <ProgressBar 
              progress={progressPercentage} 
              color={isCompleted ? theme.colors.success : theme.colors.primary}
              style={styles.progressBar}
            />
            <View style={styles.progressLabels}>
              <Text style={styles.progressText}>
                ${goal.currentAmount.toFixed(2)} saved
              </Text>
              {!isCompleted && (
                <Text style={styles.progressText}>
                  ${remainingAmount.toFixed(2)} to go
                </Text>
              )}
              <Text style={[
                styles.progressPercentage, 
                { color: isCompleted ? theme.colors.success : theme.colors.primary }
              ]}>
                {Math.round(progressPercentage * 100)}%
              </Text>
            </View>
            
            {isCompleted && (
              <View style={[styles.completedBadge, { backgroundColor: theme.colors.success }]}>
                <MaterialCommunityIcons name="check" size={16} color="white" />
                <Text style={styles.completedText}>Goal Achieved!</Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badge: {
    marginRight: 4,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  card: {
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 8,
  },
  completedBadge: {
    alignItems: 'center',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    padding: 4,
  },
  completedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
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
  targetAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  targetDate: {
    fontSize: 12,
    opacity: 0.8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  type: {
    fontSize: 14,
    opacity: 0.8,
  },
});

export default GoalCard;
