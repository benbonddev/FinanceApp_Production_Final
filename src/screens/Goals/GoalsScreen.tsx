import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, FlatList, Dimensions } from 'react-native';
import { Text, useTheme, FAB, Divider, IconButton, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import GoalCard from '../../components/Card/GoalCard';
import LinearProgress from '../../components/Progress/LinearProgress';
import CircularProgress from '../../components/Progress/CircularProgress';
import EmptyState from '../../components/EmptyState/EmptyState';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme, VictoryGroup, VictoryLegend, VictoryStack } from 'victory-native';
import { Goal, RootStackParamList } from '../../types';
import { format, addMonths, differenceInMonths, parseISO } from 'date-fns';

const { width } = Dimensions.get('window');
const chartWidth = width - 48;

// Sample goals for development
const sampleGoals: Goal[] = [
  {
    id: '1',
    name: 'Emergency Fund',
    type: 'emergency_fund',
    targetAmount: 10000,
    currentAmount: 5000,
    targetDate: addMonths(new Date(), 6).toISOString(),
    priority: 'high',
    isRecurring: false,
  },
  {
    id: '2',
    name: 'Vacation to Europe',
    type: 'travel',
    targetAmount: 5000,
    currentAmount: 2000,
    targetDate: addMonths(new Date(), 12).toISOString(),
    priority: 'medium',
    isRecurring: false,
  },
  {
    id: '3',
    name: 'New Car',
    type: 'large_purchase',
    targetAmount: 20000,
    currentAmount: 8000,
    targetDate: addMonths(new Date(), 24).toISOString(),
    priority: 'medium',
    isRecurring: false,
  },
  {
    id: '4',
    name: 'Home Down Payment',
    type: 'large_purchase',
    targetAmount: 50000,
    currentAmount: 15000,
    targetDate: addMonths(new Date(), 36).toISOString(),
    priority: 'high',
    isRecurring: false,
  },
  {
    id: '5',
    name: 'Monthly Investments',
    type: 'retirement',
    targetAmount: 500,
    currentAmount: 500,
    targetDate: addMonths(new Date(), 1).toISOString(),
    priority: 'medium',
    isRecurring: true,
    recurringFrequency: 'monthly',
  },
];

type GoalsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const GoalsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<GoalsScreenNavigationProp>();
  const [goals, setGoals] = useState<Goal[]>(sampleGoals);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  
  // Filter goals based on selected filter
  const filteredGoals = goals.filter(goal => {
    if (filter === 'all') return true;
    if (filter === 'active') return goal.currentAmount < goal.targetAmount;
    if (filter === 'completed') return goal.currentAmount >= goal.targetAmount;
    return true;
  });
  
  // Calculate total goals progress
  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const overallProgress = totalTargetAmount > 0 ? totalCurrentAmount / totalTargetAmount : 0;
  
  // Calculate completed goals
  const completedGoals = goals.filter(goal => goal.currentAmount >= goal.targetAmount).length;
  
  // Prepare data for goals progress chart
  const prepareGoalsChartData = () => {
    // Sort goals by priority and filter out completed recurring goals
    const sortedGoals = [...goals]
      .filter(goal => !(goal.isRecurring && goal.currentAmount >= goal.targetAmount))
      .sort((a, b) => {
        // Sort by priority first
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        // Then by completion percentage (descending)
        const aProgress = a.currentAmount / a.targetAmount;
        const bProgress = b.currentAmount / b.targetAmount;
        return bProgress - aProgress;
      })
      .slice(0, 5); // Limit to top 5 goals for better visualization
    
    return sortedGoals.map(goal => {
      const progress = goal.currentAmount / goal.targetAmount;
      const remaining = 1 - progress;
      
      return {
        name: goal.name.length > 15 ? goal.name.substring(0, 12) + '...' : goal.name,
        current: goal.currentAmount,
        remaining: goal.targetAmount - goal.currentAmount,
        progress,
        priority: goal.priority
      };
    });
  };
  
  const goalsChartData = prepareGoalsChartData();
  
  // Handle goal press
  const handleGoalPress = (goal: Goal) => {
    navigation.navigate('GoalDetail', { goalId: goal.id });
  };
  
  // Handle add goal
  const handleAddGoal = () => {
    navigation.navigate('AddGoal');
  };
  
  // Calculate monthly contribution needed for each goal
  const calculateMonthlyContribution = (goal: Goal) => {
    const targetDate = new Date(goal.targetDate);
    const today = new Date();
    const monthsRemaining = Math.max(1, differenceInMonths(targetDate, today));
    const amountRemaining = goal.targetAmount - goal.currentAmount;
    
    return amountRemaining / monthsRemaining;
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.filterContainer}>
        <Button
          mode={filter === 'all' ? 'contained' : 'outlined'}
          onPress={() => setFilter('all')}
          style={styles.filterButton}
        >
          All
        </Button>
        <Button
          mode={filter === 'active' ? 'contained' : 'outlined'}
          onPress={() => setFilter('active')}
          style={styles.filterButton}
        >
          Active
        </Button>
        <Button
          mode={filter === 'completed' ? 'contained' : 'outlined'}
          onPress={() => setFilter('completed')}
          style={styles.filterButton}
        >
          Completed
        </Button>
      </View>
      
      <ScrollView>
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={styles.summaryTitle}>Goals Overview</Text>
          
          <View style={styles.progressContainer}>
            <CircularProgress
              progress={overallProgress}
              size={120}
              strokeWidth={12}
              color={theme.colors.primary}
            >
              <Text style={styles.progressPercentage}>
                {Math.round(overallProgress * 100)}%
              </Text>
              <Text style={styles.progressLabel}>Overall</Text>
            </CircularProgress>
            
            <View style={styles.summaryDetails}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Goals</Text>
                <Text style={styles.summaryValue}>{goals.length}</Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Completed</Text>
                <Text style={styles.summaryValue}>{completedGoals}</Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Saved</Text>
                <Text style={styles.summaryValue}>${totalCurrentAmount.toFixed(2)}</Text>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Target</Text>
                <Text style={styles.summaryValue}>${totalTargetAmount.toFixed(2)}</Text>
              </View>
            </View>
          </View>
          
          {goalsChartData.length > 0 && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Goals Progress</Text>
              <VictoryChart
                width={chartWidth}
                height={280}
                domainPadding={{ x: 25 }}
                theme={VictoryTheme.material}
              >
                <VictoryAxis
                  tickValues={goalsChartData.map((_, i) => i)}
                  tickFormat={goalsChartData.map(d => d.name)}
                  style={{
                    axis: { stroke: theme.colors.text },
                    tickLabels: { 
                      fill: theme.colors.text, 
                      fontSize: 10,
                      angle: -45,
                      textAnchor: 'end'
                    },
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  tickFormat={(y) => `${Math.round(y * 100)}%`}
                  style={{
                    axis: { stroke: theme.colors.text },
                    tickLabels: { fill: theme.colors.text, fontSize: 10 },
                  }}
                  domain={[0, 1]}
                />
                <VictoryStack>
                  <VictoryBar
                    data={goalsChartData.map((d, i) => ({ x: i, y: d.progress }))}
                    style={{ 
                      data: { 
                        fill: ({ datum }) => {
                          const goal = goalsChartData[datum.x];
                          return goal.priority === 'high' 
                            ? theme.colors.primary 
                            : goal.priority === 'medium'
                              ? theme.colors.accent
                              : theme.colors.notification;
                        }
                      } 
                    }}
                    animate={{ duration: 500 }}
                    barWidth={25}
                    labels={({ datum }) => {
                      const progress = goalsChartData[datum.x].progress;
                      return progress >= 0.1 ? `${Math.round(progress * 100)}%` : '';
                    }}
                    labelComponent={
                      <VictoryAxis.VictoryLabel
                        style={{ fill: 'white', fontSize: 10 }}
                        dy={-10}
                      />
                    }
                  />
                  <VictoryBar
                    data={goalsChartData.map((d, i) => ({ x: i, y: 1 - d.progress }))}
                    style={{ 
                      data: { 
                        fill: ({ datum }) => {
                          const goal = goalsChartData[datum.x];
                          return goal.priority === 'high' 
                            ? `${theme.colors.primary}40` 
                            : goal.priority === 'medium'
                              ? `${theme.colors.accent}40`
                              : `${theme.colors.notification}40`;
                        }
                      } 
                    }}
                    barWidth={25}
                  />
                </VictoryStack>
              </VictoryChart>
              
              <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: theme.colors.primary }]} />
                  <Text style={styles.legendText}>High Priority</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: theme.colors.accent }]} />
                  <Text style={styles.legendText}>Medium Priority</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: theme.colors.notification }]} />
                  <Text style={styles.legendText}>Low Priority</Text>
                </View>
              </View>
            </View>
          )}
        </View>
        
        <View style={styles.goalsList}>
          <Text style={styles.sectionTitle}>Your Goals</Text>
          
          {filteredGoals.length > 0 ? (
            filteredGoals.map((goal) => {
              const monthlyContribution = calculateMonthlyContribution(goal);
              
              return (
                <View key={goal.id} style={styles.goalItem}>
                  <GoalCard
                    goal={goal}
                    onPress={() => handleGoalPress(goal)}
                  />
                  
                  {goal.currentAmount < goal.targetAmount && (
                    <View style={[styles.contributionCard, { backgroundColor: theme.colors.surface }]}>
                      <Text style={styles.contributionTitle}>Monthly Contribution Needed</Text>
                      <Text style={styles.contributionAmount}>${monthlyContribution.toFixed(2)}</Text>
                      <Text style={styles.contributionDescription}>
                        to reach your goal by {format(new Date(goal.targetDate), 'MMM d, yyyy')}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          ) : (
            <EmptyState
              icon="flag-outline"
              title="No Goals Found"
              description={`Add your financial goals to start tracking your progress.`}
              action={
                <Button mode="contained" onPress={handleAddGoal}>
                  Add Goal
                </Button>
              }
            />
          )}
        </View>
      </ScrollView>
      
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={handleAddGoal}
        label="Add Goal"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    marginTop: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
    textAlign: 'center',
  },
  container: {
    flex: 1,
  },
  contributionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  contributionCard: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderTopColor: 'rgba(0,0,0,0.1)',
    borderTopWidth: 1,
    marginBottom: 16,
    marginHorizontal: 16,
    marginTop: -8,
    padding: 12,
  },
  contributionDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
  contributionTitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  fab: {
    bottom: 0,
    margin: 16,
    position: 'absolute',
    right: 0,
  },
  filterButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  goalItem: {
    marginBottom: 16,
  },
  goalsList: {
    marginBottom: 80, // Space for FAB
  },
  legendColor: {
    borderRadius: 6,
    height: 12,
    marginRight: 4,
    width: 12,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  legendText: {
    fontSize: 12,
  },
  progressContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  summaryCard: {
    borderRadius: 8,
    margin: 16,
    padding: 16,
  },
  summaryDetails: {
    flex: 1,
    marginLeft: 16,
  },
  summaryItem: {
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GoalsScreen;
