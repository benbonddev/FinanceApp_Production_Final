import React from 'react';
import { StyleSheet, View, ScrollView, Text, Dimensions } from 'react-native';
import { useTheme, Button } from 'react-native-paper';
import { 
  VictoryPie, 
  VictoryBar, 
  VictoryLine, 
  VictoryChart, 
  VictoryTheme, 
  VictoryAxis, 
  VictoryGroup,
  VictoryStack,
  VictoryLabel
} from 'victory-native';

const { width } = Dimensions.get('window');
const chartWidth = width - 48;

const ChartTest: React.FC = () => {
  const theme = useTheme();
  
  // Test data for expense breakdown chart (Budget screen)
  const budgetData = [
    { category: 'Housing', spent: 1200, limit: 1500 },
    { category: 'Food', spent: 450, limit: 500 },
    { category: 'Transportation', spent: 350, limit: 400 },
    { category: 'Entertainment', spent: 200, limit: 250 },
    { category: 'Utilities', spent: 300, limit: 350 },
  ];
  
  // Test data for income vs expenses chart (Month screen)
  const monthsData = [
    { month: 'Jan', expenses: 2500, income: 3000 },
    { month: 'Feb', expenses: 2300, income: 3000 },
    { month: 'Mar', expenses: 2700, income: 3200 },
    { month: 'Apr', expenses: 2400, income: 3200 },
    { month: 'May', expenses: 2600, income: 3500 },
    { month: 'Jun', expenses: 2200, income: 3500 },
  ];
  
  // Test data for debt payoff projection chart (Debt screen)
  const payoffData = [
    { month: 0, balance: 25000, label: 'Now' },
    { month: 6, balance: 22000, label: 'Jul 2025' },
    { month: 12, balance: 18500, label: 'Jan 2026' },
    { month: 18, balance: 14500, label: 'Jul 2026' },
    { month: 24, balance: 10000, label: 'Jan 2027' },
    { month: 30, balance: 5000, label: 'Jul 2027' },
    { month: 36, balance: 0, label: 'Jan 2028' },
  ];
  
  // Test data for goals progress chart (Goals screen)
  const goalsData = [
    { name: 'Emergency Fund', progress: 0.5, priority: 'high' },
    { name: 'Vacation', progress: 0.4, priority: 'medium' },
    { name: 'New Car', progress: 0.3, priority: 'medium' },
    { name: 'Home Down Payment', progress: 0.2, priority: 'high' },
    { name: 'Retirement', progress: 0.1, priority: 'low' },
  ];
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Chart Rendering Tests</Text>
      
      {/* Test 1: Expense Breakdown Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Expense Breakdown Chart</Text>
        <VictoryPie
          data={budgetData.map(budget => ({
            x: budget.category,
            y: budget.spent,
            label: `${budget.category}: $${budget.spent}`
          }))}
          width={chartWidth}
          height={250}
          colorScale={[
            theme.colors.primary,
            theme.colors.accent,
            theme.colors.notification,
            theme.colors.success,
            theme.colors.warning,
          ]}
          innerRadius={40}
          labelRadius={90}
          style={{ 
            labels: { 
              fill: theme.colors.text, 
              fontSize: 12 
            } 
          }}
          animate={{ duration: 500 }}
        />
      </View>
      
      {/* Test 2: Income vs Expenses Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Income vs Expenses Chart</Text>
        <VictoryChart
          width={chartWidth}
          height={220}
          theme={VictoryTheme.material}
          domainPadding={{ x: 25 }}
        >
          <VictoryAxis
            tickValues={[0, 1, 2, 3, 4, 5]}
            tickFormat={monthsData.map(d => d.month)}
            style={{
              axis: { stroke: theme.colors.text },
              tickLabels: { fill: theme.colors.text, fontSize: 10 },
            }}
          />
          <VictoryAxis
            dependentAxis
            style={{
              axis: { stroke: theme.colors.text },
              tickLabels: { fill: theme.colors.text, fontSize: 10 },
            }}
          />
          <VictoryGroup offset={20}>
            <VictoryBar
              data={monthsData.map((d, i) => ({ x: i, y: d.income }))}
              style={{ data: { fill: theme.colors.success, width: 15 } }}
              animate={{ duration: 500 }}
            />
            <VictoryBar
              data={monthsData.map((d, i) => ({ x: i, y: d.expenses }))}
              style={{ data: { fill: theme.colors.error, width: 15 } }}
              animate={{ duration: 500 }}
            />
          </VictoryGroup>
        </VictoryChart>
      </View>
      
      {/* Test 3: Debt Payoff Projection Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Debt Payoff Projection Chart</Text>
        <VictoryChart
          width={chartWidth}
          height={220}
          theme={VictoryTheme.material}
          domainPadding={{ y: [0, 20] }}
        >
          <VictoryAxis
            tickValues={payoffData.filter(d => d.label).map(d => d.month)}
            tickFormat={payoffData.filter(d => d.label).map(d => d.label)}
            style={{
              axis: { stroke: theme.colors.text },
              tickLabels: { fill: theme.colors.text, fontSize: 10, angle: -45 },
            }}
          />
          <VictoryAxis
            dependentAxis
            tickFormat={(y) => `$${Math.round(y / 1000)}k`}
            style={{
              axis: { stroke: theme.colors.text },
              tickLabels: { fill: theme.colors.text, fontSize: 10 },
            }}
          />
          <VictoryLine
            data={payoffData}
            x="month"
            y="balance"
            style={{
              data: { 
                stroke: theme.colors.primary,
                strokeWidth: 3 
              },
            }}
            animate={{ duration: 500 }}
          />
        </VictoryChart>
      </View>
      
      {/* Test 4: Goals Progress Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Goals Progress Chart</Text>
        <VictoryChart
          width={chartWidth}
          height={280}
          domainPadding={{ x: 25 }}
          theme={VictoryTheme.material}
        >
          <VictoryAxis
            tickValues={goalsData.map((_, i) => i)}
            tickFormat={goalsData.map(d => d.name)}
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
              data={goalsData.map((d, i) => ({ x: i, y: d.progress }))}
              style={{ 
                data: { 
                  fill: ({ datum }) => {
                    const goal = goalsData[datum.x];
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
                const progress = goalsData[datum.x].progress;
                return progress >= 0.1 ? `${Math.round(progress * 100)}%` : '';
              }}
              labelComponent={
                <VictoryLabel
                  style={{ fill: 'white', fontSize: 10 }}
                  dy={-10}
                />
              }
            />
            <VictoryBar
              data={goalsData.map((d, i) => ({ x: i, y: 1 - d.progress }))}
              style={{ 
                data: { 
                  fill: ({ datum }) => {
                    const goal = goalsData[datum.x];
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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 40,
    padding: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
});

export default ChartTest;
