import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { VictoryBar, VictoryChart, VictoryGroup, VictoryLine, VictoryPie, VictoryStack, VictoryTheme, VictoryAxis, VictoryLabel } from 'victory-native';

const ChartTest: React.FC = () => {
  const theme = useTheme();
  
  // Sample data for expense breakdown chart
  const expenseData = [
    { x: 'Housing', y: 1200 },
    { x: 'Food', y: 500 },
    { x: 'Transport', y: 300 },
    { x: 'Utilities', y: 250 },
    { x: 'Other', y: 400 },
  ];
  
  // Sample data for income vs expenses chart
  const monthsData = [
    { month: 'Jan', income: 3000, expenses: 2500 },
    { month: 'Feb', income: 3200, expenses: 2700 },
    { month: 'Mar', income: 3100, expenses: 2900 },
    { month: 'Apr', income: 3400, expenses: 2800 },
    { month: 'May', income: 3300, expenses: 2600 },
    { month: 'Jun', income: 3500, expenses: 2750 },
  ];
  
  // Sample data for debt payoff projection
  const payoffData = [
    { month: 0, balance: 25000, label: 'Now' },
    { month: 6, balance: 22000, label: '6 mo' },
    { month: 12, balance: 18500, label: '1 yr' },
    { month: 18, balance: 14500, label: '18 mo' },
    { month: 24, balance: 10000, label: '2 yr' },
    { month: 30, balance: 5000, label: '30 mo' },
    { month: 36, balance: 0, label: '3 yr' },
  ];
  
  // Sample data for goals progress
  const goalsData = [
    { name: 'Emergency', progress: 0.75, priority: 'high' },
    { name: 'Vacation', progress: 0.4, priority: 'medium' },
    { name: 'Car', progress: 0.2, priority: 'medium' },
    { name: 'House', progress: 0.1, priority: 'high' },
    { name: 'Education', progress: 0.6, priority: 'low' },
  ];
  
  const chartWidth = 350;
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Chart Visualizations Test</Text>
      
      {/* Test 1: Expense Breakdown Chart */}
      <View style={[styles.chartContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Expense Breakdown Chart</Text>
        <VictoryPie
          data={expenseData}
          width={chartWidth}
          height={300}
          colorScale={['tomato', 'orange', 'gold', 'cyan', 'navy']}
          style={{ labels: { fill: theme.colors.text, fontSize: 12 } }}
          labelRadius={({ innerRadius }) => (innerRadius || 0) * 1.5}
          innerRadius={70}
          padAngle={2}
          animate={{ duration: 500 }}
        />
      </View>
      
      {/* Test 2: Income vs Expenses Chart */}
      <View style={[styles.chartContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Income vs Expenses Chart</Text>
        <VictoryChart
          width={chartWidth}
          height={250}
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
            tickFormat={(y) => `$${y / 1000}k`}
            style={{
              axis: { stroke: theme.colors.text },
              tickLabels: { fill: theme.colors.text, fontSize: 10 },
            }}
          />
          <VictoryGroup offset={15} colorScale={["green", "red"]}>
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
      <View style={[styles.chartContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Debt Payoff Projection Chart</Text>
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
      <View style={[styles.chartContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Goals Progress Chart</Text>
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
                  style={{ fontSize: 10 }}
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
