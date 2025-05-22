import { MD3Theme } from 'react-native-paper';

// Extend the MD3Theme type to include our custom colors
declare module 'react-native-paper' {
  export interface MD3Colors {
    success: string;
    warning: string;
    border: string;
    outline: string;
    onSurfaceVariant: string;
    accent: string;
    notification: string;
    info: string;
  }
}

// Our custom theme type that extends the React Native Paper theme
export interface CustomTheme extends MD3Theme {
  colors: MD3Theme['colors'] & {
    success: string;
    warning: string;
    border: string;
    outline: string;
    onSurfaceVariant: string;
    accent: string;
    notification: string;
    info: string;
  };
}

// Type definitions for the app

// Bill types
export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string; // ISO date string
  isPaid: boolean;
  isRecurring: boolean;
  recurringFrequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  category: string;
  notes?: string;
  payPeriodId?: string; // Which paycheck this bill is assigned to
  paidDate?: string; // When the bill was paid
  paidFrom?: string; // Which paycheck paid this bill
  isDynamic?: boolean; // For bills with variable amounts like utilities
  history?: BillPayment[]; // Payment history
}

export interface BillPayment {
  id: string;
  billId: string;
  amount: number;
  date: string;
  payPeriodId?: string;
}

// Paycheck types
export interface Paycheck {
  id: string;
  name: string;
  amount: number;
  date: string; // ISO date string
  isRecurring: boolean;
  recurringFrequency?: 'weekly' | 'biweekly' | 'monthly';
  owner: string; // Who the paycheck belongs to
  forSavings?: boolean; // Whether this paycheck is marked for savings
  notes?: string;
}

// Budget types
export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: 'monthly' | 'paycheck';
  payPeriodId?: string; // If budget is per paycheck
  month?: string; // If budget is monthly (YYYY-MM format)
  notes?: string;
}

// Debt types
export interface Debt {
  id: string;
  name: string;
  initialAmount: number;
  currentBalance: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: number; // Day of month (1-31)
  category: 'loan' | 'credit_card' | 'mortgage' | 'other';
  notes?: string;
}

// Goal types
export interface Goal {
  id: string;
  name: string;
  type: 'emergency_fund' | 'travel' | 'large_purchase' | 'debt_payoff' | 'retirement' | 'custom';
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // ISO date string
  isRecurring: boolean;
  recurringFrequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  priority: 'high' | 'medium' | 'low';
  fundingSource?: 'manual' | 'fixed_recurring';
  payPeriodId?: string; // If linked to a specific paycheck
  contributionAmount?: number; // For recurring contributions
  notes?: string;
  description?: string;
}

// Transaction types
export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  billId?: string;
  debtId?: string;
  goalId?: string;
  payPeriodId?: string;
  notes?: string;
}

// Notification types
export interface Notification {
  id: string;
  type: 'bill_due' | 'goal_achieved' | 'budget_exceeded' | 'payment_reminder' | 'other';
  title: string;
  message: string;
  date: string;
  read: boolean;
  relatedId?: string; // ID of related bill, goal, etc.
}

// Settings types
export interface Settings {
  theme: 'light' | 'dark' | 'system';
  currency: string;
  notificationLevel: 'aggressive' | 'medium' | 'light';
  billReminders: boolean;
  goalAlerts: boolean;
  budgetAlerts: boolean;
  firstDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.
  paychecksToShow: number; // How many paychecks to show ahead
  budgetMethod: 'zero_based' | 'fifty_thirty_twenty' | 'envelope' | 'custom';
}

// Navigation types
export type RootStackParamList = {
  Main: undefined;
  BillDetail: { billId: string };
  AddBill: undefined;
  EditBill: { billId: string };
  PaycheckDetail: { paycheckId: string };
  AddPaycheck: undefined;
  EditPaycheck: { paycheckId: string };
  BudgetDetail: { budgetId: string };
  AddBudget: undefined;
  EditBudget: { budgetId: string };
  DebtDetail: { debtId: string };
  AddDebt: undefined;
  EditDebt: { debtId: string };
  GoalDetail: { goalId: string };
  AddGoal: undefined;
  EditGoal: { goalId: string };
  Settings: undefined;
  Notifications: undefined;
  AllTransactions: undefined;
  AddTransaction: undefined;
  Dashboard: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Month: undefined;
  Paychecks: undefined;
  Budget: undefined;
  Debt: undefined;
  Goals: undefined;
};

// Use CustomTheme instead of the previous Theme interface
export type Theme = CustomTheme;
