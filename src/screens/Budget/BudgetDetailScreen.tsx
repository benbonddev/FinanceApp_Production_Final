import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, useTheme, Button, Card, Divider, IconButton } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { selectBudgetById, updateBudget, deleteBudget } from '../../store/slices/budgetSlice';
import { selectBillsByCategory } from '../../store/slices/billsSlice';
import LinearProgress from '../../components/Progress/LinearProgress';
import CircularProgress from '../../components/Progress/CircularProgress';
import BillCard from '../../components/Card/BillCard';
import Modal from '../../components/Modal/Modal';
import { Budget, RootStackParamList, Bill } from '../../types';
import { VictoryPie, VictoryTheme } from 'victory-native';

type BudgetDetailRouteProp = RouteProp<RootStackParamList, 'BudgetDetail'>;
type BudgetDetailNavigationProp = StackNavigationProp<RootStackParamList>;

const BudgetDetailScreen: React.FC = () => {
  const theme = useTheme();
  const route = useRoute<BudgetDetailRouteProp>();
  const navigation = useNavigation<BudgetDetailNavigationProp>();
  const dispatch = useAppDispatch();
  const { budgetId } = route.params;
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const budget = useAppSelector(state => selectBudgetById(state, budgetId));
  const categoryBills = useAppSelector(state => selectBillsByCategory(state, budget?.category || ''));
  
  // Handle edit budget
  const handleEditBudget = () => {
    if (!budget) return;
    navigation.navigate('EditBudget', { budgetId: budget.id });
  };
  
  // Handle delete budget
  const handleDeleteBudget = () => {
    if (!budget) return;
    setShowDeleteConfirm(true);
  };
  
  // Confirm delete budget
  const confirmDeleteBudget = () => {
    if (!budget) return;
    dispatch(deleteBudget(budget.id));
    setShowDeleteConfirm(false);
    navigation.goBack();
  };
  
  // Handle bill press
  const handleBillPress = (bill: Bill) => {
    navigation.navigate('BillDetail', { billId: bill.id });
  };
  
  // Handle add bill
  const handleAddBill = () => {
    navigation.navigate('AddBill', { category: budget?.category });
  };
  
  if (!budget) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Budget not found
        </Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }
  
  // Calculate budget progress
  const progress = budget.limit > 0 ? budget.spent / budget.limit : 0;
  const remaining = budget.limit - budget.spent;
  const isOverBudget = remaining < 0;
  
  // Prepare data for pie chart
  const chartData = [
    { x: 'Spent', y: budget.spent },
    { x: 'Remaining', y: Math.max(0, remaining) },
  ];
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: theme.colors.text }]}>{budget.category}</Text>
            <Text style={[styles.subtitle, { color: theme.colors.primary }]}>
              {budget.description || 'No description'}
            </Text>
          </View>
          <View style={styles.actions}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={handleEditBudget}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={handleDeleteBudget}
            />
          </View>
        </View>
        
        <Card style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.budgetProgress}>
              <CircularProgress
                progress={progress}
                size={120}
                strokeWidth={12}
                color={isOverBudget ? theme.colors.error : theme.colors.primary}
                showPercentage={true}
              />
            </View>
            
            <View style={styles.budgetDetails}>
              <View style={styles.budgetRow}>
                <Text style={styles.budgetLabel}>Budget Limit</Text>
                <Text style={styles.budgetValue}>${budget.limit.toFixed(2)}</Text>
              </View>
              
              <View style={styles.budgetRow}>
                <Text style={styles.budgetLabel}>Spent</Text>
                <Text style={styles.budgetValue}>${budget.spent.toFixed(2)}</Text>
              </View>
              
              <Divider style={styles.divider} />
              
              <View style={styles.budgetRow}>
                <Text style={styles.budgetLabel}>Remaining</Text>
                <Text style={[
                  styles.budgetValue,
                  { color: isOverBudget ? theme.colors.error : theme.colors.success }
                ]}>
                  ${Math.abs(remaining).toFixed(2)}
                  {isOverBudget ? ' (Over Budget)' : ''}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
        
        <Card style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Spending Breakdown</Text>
            
            <View style={styles.chartContainer}>
              <VictoryPie
                data={chartData}
                width={300}
                height={200}
                colorScale={[theme.colors.primary, theme.colors.surface]}
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
                  <Text style={styles.legendText}>Spent: ${budget.spent.toFixed(2)}</Text>
                </View>
                
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.primary }]} />
                  <Text style={styles.legendText}>Remaining: ${Math.max(0, remaining).toFixed(2)}</Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
        
        <Card style={[styles.billsCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.billsHeader}>
              <Text style={styles.sectionTitle}>Related Bills</Text>
              <Button 
                mode="text" 
                onPress={handleAddBill}
                icon="plus"
              >
                Add Bill
              </Button>
            </View>
            
            {categoryBills.length > 0 ? (
              categoryBills.map(bill => (
                <BillCard
                  key={bill.id}
                  bill={bill}
                  onPress={() => handleBillPress(bill)}
                />
              ))
            ) : (
              <Text style={styles.noBillsText}>No bills in this category</Text>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
      
      <Modal
        visible={showDeleteConfirm}
        onDismiss={() => setShowDeleteConfirm(false)}
        title="Delete Budget"
        actions={[
          {
            label: 'Cancel',
            onPress: () => setShowDeleteConfirm(false),
            mode: 'text',
          },
          {
            label: 'Delete',
            onPress: confirmDeleteBudget,
            mode: 'contained',
            color: theme.colors.error,
          },
        ]}
      >
        <Text>Are you sure you want to delete this budget? This action cannot be undone.</Text>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
  },
  billsCard: {
    margin: 16,
    marginBottom: 24,
    marginTop: 0,
  },
  billsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  budgetDetails: {
    marginTop: 8,
  },
  budgetLabel: {
    fontSize: 16,
    opacity: 0.7,
  },
  budgetProgress: {
    alignItems: 'center',
    marginBottom: 16,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  budgetValue: {
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
  noBillsText: {
    opacity: 0.7,
    padding: 16,
    textAlign: 'center',
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

export default BudgetDetailScreen;
