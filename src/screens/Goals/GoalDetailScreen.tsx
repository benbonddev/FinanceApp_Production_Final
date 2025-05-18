import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme, Button, Card, Divider, IconButton } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { selectGoalById, updateGoal, deleteGoal, addContribution } from '../../store/slices/goalsSlice';
import LinearProgress from '../../components/Progress/LinearProgress';
import CircularProgress from '../../components/Progress/CircularProgress';
import Modal from '../../components/Modal/Modal';
import TextInput from '../../components/Form/TextInput';
import { Goal, RootStackParamList } from '../../types';
import { format, parseISO, differenceInMonths } from 'date-fns';
import { VictoryPie, VictoryTheme } from 'victory-native';

type GoalDetailRouteProp = RouteProp<RootStackParamList, 'GoalDetail'>;
type GoalDetailNavigationProp = StackNavigationProp<RootStackParamList>;

const GoalDetailScreen: React.FC = () => {
  const theme = useTheme();
  const route = useRoute<GoalDetailRouteProp>();
  const navigation = useNavigation<GoalDetailNavigationProp>();
  const dispatch = useAppDispatch();
  const { goalId } = route.params;
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [contributionAmount, setContributionAmount] = useState('');
  
  const goal = useAppSelector(state => selectGoalById(state, goalId));
  
  // Handle edit goal
  const handleEditGoal = () => {
    if (!goal) return;
    navigation.navigate('EditGoal', { goalId: goal.id });
  };
  
  // Handle delete goal
  const handleDeleteGoal = () => {
    if (!goal) return;
    setShowDeleteConfirm(true);
  };
  
  // Confirm delete goal
  const confirmDeleteGoal = () => {
    if (!goal) return;
    dispatch(deleteGoal(goal.id));
    setShowDeleteConfirm(false);
    navigation.goBack();
  };
  
  // Handle add contribution
  const handleAddContribution = () => {
    setContributionAmount('');
    setShowContributionModal(true);
  };
  
  // Confirm contribution
  const confirmContribution = () => {
    if (!goal || !contributionAmount) return;
    
    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    dispatch(addContribution({
      id: goal.id,
      amount,
      date: new Date().toISOString()
    }));
    
    setShowContributionModal(false);
  };
  
  // Calculate monthly contribution needed
  const calculateMonthlyContribution = () => {
    if (!goal) return 0;
    
    const targetDate = parseISO(goal.targetDate);
    const today = new Date();
    const monthsRemaining = Math.max(1, differenceInMonths(targetDate, today));
    const amountRemaining = goal.targetAmount - goal.currentAmount;
    
    return amountRemaining / monthsRemaining;
  };
  
  if (!goal) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Goal not found
        </Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }
  
  // Calculate progress
  const progress = goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0;
  const isCompleted = progress >= 1;
  const monthlyContribution = calculateMonthlyContribution();
  
  // Prepare data for pie chart
  const chartData = [
    { x: 'Saved', y: goal.currentAmount },
    { x: 'Remaining', y: Math.max(0, goal.targetAmount - goal.currentAmount) },
  ];
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{goal.name}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.primary }]}>
              {goal.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Text>
          </View>
          <View style={styles.actions}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={handleEditGoal}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={handleDeleteGoal}
            />
          </View>
        </View>
        
        <Card style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.progressContainer}>
              <CircularProgress
                progress={progress}
                size={120}
                strokeWidth={12}
                color={isCompleted ? theme.colors.success : theme.colors.primary}
                showPercentage={true}
              />
              <Text style={styles.progressLabel}>
                {isCompleted ? 'Goal Completed!' : `${Math.round(progress * 100)}% Complete`}
              </Text>
            </View>
            
            <View style={styles.amountContainer}>
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Current Amount</Text>
                <Text style={styles.amountValue}>${goal.currentAmount.toFixed(2)}</Text>
              </View>
              
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Target Amount</Text>
                <Text style={styles.amountValue}>${goal.targetAmount.toFixed(2)}</Text>
              </View>
              
              <Divider style={styles.divider} />
              
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Remaining</Text>
                <Text style={[
                  styles.amountValue,
                  { color: isCompleted ? theme.colors.success : theme.colors.text }
                ]}>
                  ${Math.max(0, goal.targetAmount - goal.currentAmount).toFixed(2)}
                </Text>
              </View>
            </View>
            
            {!isCompleted && (
              <Button
                mode="contained"
                onPress={handleAddContribution}
                style={styles.contributionButton}
              >
                Add Contribution
              </Button>
            )}
          </Card.Content>
        </Card>
        
        <Card style={[styles.detailsCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Goal Details</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Target Date</Text>
              <Text style={styles.detailValue}>{format(parseISO(goal.targetDate), 'MMMM d, yyyy')}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Priority</Text>
              <Text style={[
                styles.detailValue,
                { 
                  color: goal.priority === 'high' 
                    ? theme.colors.error 
                    : goal.priority === 'medium'
                      ? theme.colors.warning
                      : theme.colors.text
                }
              ]}>
                {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
              </Text>
            </View>
            
            {goal.isRecurring && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Frequency</Text>
                <Text style={styles.detailValue}>
                  {goal.recurringFrequency 
                    ? goal.recurringFrequency.charAt(0).toUpperCase() + goal.recurringFrequency.slice(1) 
                    : 'Monthly'}
                </Text>
              </View>
            )}
            
            {!isCompleted && (
              <View style={styles.projectionContainer}>
                <Text style={styles.projectionTitle}>Monthly Contribution Needed</Text>
                <Text style={styles.projectionValue}>${monthlyContribution.toFixed(2)}</Text>
                <Text style={styles.projectionDescription}>
                  to reach your goal by {format(parseISO(goal.targetDate), 'MMM d, yyyy')}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
        
        <Card style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Progress Breakdown</Text>
            
            <View style={styles.chartContainer}>
              <VictoryPie
                data={chartData}
                width={300}
                height={200}
                colorScale={[theme.colors.primary, `${theme.colors.primary}40`]}
                innerRadius={60}
                labelRadius={80}
                style={{
                  labels: { fill: 'transparent' },
                  data: {
                    stroke: theme.colors.background,
                    strokeWidth: 2,
                  },
                }}
                animate={{ duration: 500 }}
              />
              
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: theme.colors.primary }]} />
                  <Text style={styles.legendText}>Saved: ${goal.currentAmount.toFixed(2)}</Text>
                </View>
                
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: `${theme.colors.primary}40` }]} />
                  <Text style={styles.legendText}>
                    Remaining: ${Math.max(0, goal.targetAmount - goal.currentAmount).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
        
        {goal.contributionHistory && goal.contributionHistory.length > 0 && (
          <Card style={[styles.historyCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Contribution History</Text>
              
              {goal.contributionHistory.map((contribution, index) => (
                <View key={index} style={styles.contributionItem}>
                  <View style={styles.contributionDetails}>
                    <Text style={styles.contributionDate}>
                      {format(new Date(contribution.date), 'MMMM d, yyyy')}
                    </Text>
                    <Text style={styles.contributionAmount}>
                      ${contribution.amount.toFixed(2)}
                    </Text>
                  </View>
                  {index < goal.contributionHistory.length - 1 && <Divider style={styles.divider} />}
                </View>
              ))}
            </Card.Content>
          </Card>
        )}
      </ScrollView>
      
      <Modal
        visible={showDeleteConfirm}
        onDismiss={() => setShowDeleteConfirm(false)}
        title="Delete Goal"
        actions={[
          {
            label: 'Cancel',
            onPress: () => setShowDeleteConfirm(false),
            mode: 'text',
          },
          {
            label: 'Delete',
            onPress: confirmDeleteGoal,
            mode: 'contained',
            color: theme.colors.error,
          },
        ]}
      >
        <Text>Are you sure you want to delete this goal? This action cannot be undone.</Text>
      </Modal>
      
      <Modal
        visible={showContributionModal}
        onDismiss={() => setShowContributionModal(false)}
        title="Add Contribution"
        actions={[
          {
            label: 'Cancel',
            onPress: () => setShowContributionModal(false),
            mode: 'text',
          },
          {
            label: 'Add',
            onPress: confirmContribution,
            mode: 'contained',
          },
        ]}
      >
        <View>
          <Text style={styles.contributionModalText}>
            Enter the contribution amount for {goal.name}:
          </Text>
          <TextInput
            label="Contribution Amount"
            value={contributionAmount}
            onChangeText={setContributionAmount}
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
  amountContainer: {
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 16,
    opacity: 0.7,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chartCard: {
    margin: 16,
    marginTop: 0,
  },
  chartContainer: {
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  contributionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  contributionButton: {
    marginTop: 8,
  },
  contributionDate: {
    fontSize: 14,
  },
  contributionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  contributionItem: {
    marginBottom: 8,
  },
  contributionModalText: {
    marginBottom: 16,
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
    marginVertical: 8,
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
  historyCard: {
    margin: 16,
    marginBottom: 24,
    marginTop: 0,
  },
  legendColor: {
    borderRadius: 8,
    height: 16,
    marginRight: 8,
    width: 16,
  },
  legendContainer: {
    marginTop: 16,
    width: '100%',
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  legendText: {
    fontSize: 14,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 14,
    marginTop: 8,
  },
  projectionContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    marginTop: 16,
    padding: 12,
  },
  projectionDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
  projectionTitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  projectionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 4,
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

export default GoalDetailScreen;
