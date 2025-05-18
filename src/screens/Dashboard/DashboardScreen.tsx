import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, IconButton, Text, useTheme } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { VictoryPie, VictoryLine, VictoryChart, VictoryTheme, VictoryAxis, VictoryLegend } from 'victory-native';
import { RootState } from '../../store';
import { Bill } from '../../types';
import { useNavigation } from '@react-navigation/native';
import commonStyles from '../../theme/commonStyles';
import { spacing, borderRadius } from '../../theme/theme';

const DashboardScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const bills = useSelector((state: RootState) => state.bills.bills);
  const paychecks = useSelector((state: RootState) => state.paychecks.paychecks);
  
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [billPaymentRate, setBillPaymentRate] = useState(0);
  const [categoryData, setCategoryData] = useState<Array<{ x: string; y: number; label: string }>>([]);
  const [months, setMonths] = useState<Array<{ month: string; income: number; expenses: number }>>([]);
  
  // Calculate current month bills
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const monthBills = bills.filter(bill => {
    const dueDate = new Date(bill.dueDate);
    return dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear;
  });
  
  const paidBills = monthBills.filter(bill => bill.isPaid);
  
  useEffect(() => {
    // Calculate total income and expenses
    const income = paychecks.reduce((sum, paycheck) => sum + paycheck.amount, 0);
    const expenses = bills.reduce((sum, bill) => sum + bill.amount, 0);
    
    setTotalIncome(income);
    setTotalExpenses(expenses);
    
    // Calculate bill payment rate
    if (monthBills.length > 0) {
      setBillPaymentRate(paidBills.length / monthBills.length);
    }
    
    // Prepare category data for pie chart
    const categories: Record<string, number> = {};
    bills.forEach((bill: Bill) => {
      if (categories[bill.category]) {
        categories[bill.category] += bill.amount;
      } else {
        categories[bill.category] = bill.amount;
      }
    });
    
    const formattedCategories = Object.keys(categories).map(category => ({
      x: category,
      y: categories[category],
      label: `${category}: $${categories[category].toFixed(0)}`,
    }));
    
    setCategoryData(formattedCategories);
    
    // Prepare monthly data for line chart
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthData = [];
    
    // Get data for past 3 months, current month, and future 2 months
    for (let i = -3; i <= 2; i++) {
      const targetMonth = new Date();
      targetMonth.setMonth(currentMonth + i);
      
      const monthIndex = targetMonth.getMonth();
      const year = targetMonth.getFullYear();
      
      const monthIncome = paychecks
        .filter(paycheck => {
          const date = new Date(paycheck.date);
          return date.getMonth() === monthIndex && date.getFullYear() === year;
        })
        .reduce((sum, paycheck) => sum + paycheck.amount, 0);
      
      const monthExpenses = bills
        .filter(bill => {
          const date = new Date(bill.dueDate);
          return date.getMonth() === monthIndex && date.getFullYear() === year;
        })
        .reduce((sum, bill) => sum + bill.amount, 0);
      
      monthData.push({
        month: `${monthNames[monthIndex]} ${year}`,
        income: monthIncome,
        expenses: monthExpenses,
      });
    }
    
    setMonths(monthData);
  }, [bills, paychecks, monthBills.length, paidBills.length]);
  
  return (
    <ScrollView style={[commonStyles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[commonStyles.title, { color: theme.colors.text }]}>Dashboard</Text>
        <Text style={[styles.subtitle, { color: theme.colors.text }]}>
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
      </View>
      
      <View style={styles.summaryCards}>
        <Card style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Income</Text>
            <Text style={[styles.cardValue, { color: theme.colors.success }]}>
              ${totalIncome.toFixed(2)}
            </Text>
          </Card.Content>
        </Card>
        
        <Card style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Expenses</Text>
            <Text style={[styles.cardValue, { color: theme.colors.error }]}>
              ${totalExpenses.toFixed(2)}
            </Text>
          </Card.Content>
        </Card>
      </View>
      
      <Card style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Expense Breakdown</Text>
          
          {categoryData.length > 0 ? (
            <View style={styles.pieChartContainer}>
              <VictoryPie
                data={categoryData}
                width={300}
                height={300}
                colorScale={['tomato', 'orange', 'gold', 'cyan', 'navy']}
                style={{ labels: { fill: theme.colors.text, fontSize: 12 } }}
                labelRadius={({ innerRadius }) => (innerRadius || 0) * 1.5}
                innerRadius={70}
                padAngle={2}
                animate={{ duration: 500 }}
              />
              
              <View style={styles.legendContainer}>
                {categoryData.map((category, index) => (
                  <View key={index} style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendColor,
                        {
                          backgroundColor: ['tomato', 'orange', 'gold', 'cyan', 'navy'][
                            index % 5
                          ],
                        },
                      ]}
                    />
                    <Text style={[styles.legendText, { color: theme.colors.text }]}>
                      {category.x}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <Text style={[styles.noDataText, { color: theme.colors.text }]}>
              No expense data available
            </Text>
          )}
        </Card.Content>
      </Card>
      
      <Card style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Income vs Expenses</Text>
          
          {months.length > 0 ? (
            <View>
              <VictoryChart
                theme={VictoryTheme.material}
                domainPadding={{ x: 20 }}
                width={350}
                height={250}
              >
                <VictoryAxis
                  tickValues={[0, 1, 2, 3, 4, 5]}
                  tickFormat={months.map(m => m.month.substring(0, 3))}
                  style={{
                    axis: { stroke: theme.colors.text },
                    tickLabels: { fill: theme.colors.text, fontSize: 10 },
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  tickFormat={x => `$${x / 1000}k`}
                  style={{
                    axis: { stroke: theme.colors.text },
                    tickLabels: { fill: theme.colors.text, fontSize: 10 },
                  }}
                />
                <VictoryLine
                  data={months.map((month, index) => ({ x: index, y: month.income }))}
                  style={{
                    data: { stroke: theme.colors.success, strokeWidth: 3 },
                  }}
                  animate={{ duration: 500 }}
                />
                <VictoryLine
                  data={months.map((month, index) => ({ x: index, y: month.expenses }))}
                  style={{
                    data: { stroke: theme.colors.error, strokeWidth: 3 },
                  }}
                  animate={{ duration: 500 }}
                />
                <VictoryLegend
                  x={125}
                  y={10}
                  orientation="horizontal"
                  gutter={20}
                  style={{ labels: { fill: theme.colors.text } }}
                  data={[
                    { name: 'Income', symbol: { fill: theme.colors.success } },
                    { name: 'Expenses', symbol: { fill: theme.colors.error } },
                  ]}
                />
              </VictoryChart>
            </View>
          ) : (
            <Text style={[styles.noDataText, { color: theme.colors.text }]}>
              No monthly data available
            </Text>
          )}
        </Card.Content>
      </Card>
      
      <Card style={[styles.insightCard, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text style={[styles.insightTitle, { color: theme.colors.text }]}>Financial Insights</Text>
          
          <View style={styles.insightItem}>
            <IconButton
              icon="wallet"
              size={24}
              color={theme.colors.primary}
              style={styles.insightIcon}
            />
            <View style={styles.insightContent}>
              <Text style={styles.insightText}>
                {totalIncome > totalExpenses 
                  ? `You're saving $${(totalIncome - totalExpenses).toFixed(2)} this month.`
                  : `You're spending more than you earn this month.`}
              </Text>
              <Text style={styles.insightAction}>
                {totalIncome > totalExpenses 
                  ? "Consider allocating more to savings or debt repayment."
                  : "Look for expenses you can reduce to balance your budget."}
              </Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.insightItem}>
            <IconButton
              icon="calendar-check"
              size={24}
              color={theme.colors.primary}
              style={styles.insightIcon}
            />
            <View style={styles.insightContent}>
              <Text style={styles.insightText}>
                {billPaymentRate >= 0.9 
                  ? "You've paid most of your bills on time this month."
                  : `You still have ${monthBills.length - paidBills.length} unpaid bills this month.`}
              </Text>
              <Text style={styles.insightAction}>
                {billPaymentRate >= 0.9 
                  ? "Great job staying on top of your finances!"
                  : "Check your upcoming bills to avoid late fees."}
              </Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.insightItem}>
            <IconButton
              icon="chart-line"
              size={24}
              color={theme.colors.primary}
              style={styles.insightIcon}
            />
            <View style={styles.insightContent}>
              <Text style={styles.insightText}>
                {months[5].income > months[0].income 
                  ? "Your income has increased over the past 6 months."
                  : months[5].income < months[0].income 
                    ? "Your income has decreased over the past 6 months."
                    : "Your income has remained stable over the past 6 months."}
              </Text>
              <Text style={styles.insightAction}>
                {months[5].expenses > months[0].expenses 
                  ? "Your expenses have also increased. Monitor this trend."
                  : "Keep managing your expenses well to improve savings."}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
      
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('PaymentHistoryScreen' as never)}
          style={styles.footerButton}
        >
          View Detailed Reports
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  balanceContainer: {
    marginTop: spacing.md,
  },
  balanceLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: spacing.xs,
  },
  cardTitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: spacing.xs,
  },
  chartCard: {
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  divider: {
    marginVertical: spacing.sm,
  },
  footer: {
    padding: spacing.md,
  },
  footerButton: {
    marginBottom: spacing.md,
  },
  header: {
    padding: spacing.md,
  },
  insightAction: {
    fontSize: 12,
    marginTop: spacing.xs,
    opacity: 0.7,
  },
  insightCard: {
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  insightContent: {
    flex: 1,
  },
  insightIcon: {
    margin: 0,
  },
  insightItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: spacing.sm,
  },
  insightText: {
    fontSize: 14,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  legendColor: {
    borderRadius: borderRadius.xs,
    height: 12,
    marginRight: spacing.xs,
    width: 12,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginHorizontal: spacing.sm,
  },
  legendText: {
    fontSize: 12,
  },
  metricDescription: {
    fontSize: 12,
    marginTop: spacing.xs,
    opacity: 0.7,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
    marginTop: spacing.sm,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  noDataText: {
    opacity: 0.7,
    padding: spacing.lg,
    textAlign: 'center',
  },
  pieChartContainer: {
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
  },
  summaryCards: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
});

export default DashboardScreen;
