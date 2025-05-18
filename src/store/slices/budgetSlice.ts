import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { Budget } from '../../types';
import { saveData, loadData, STORAGE_KEYS } from '../../utils/storage';

// Sample budgets for development
const initialBudgets: Budget[] = [
  {
    id: '1',
    category: 'Housing',
    limit: 1500,
    spent: 1200,
    period: 'monthly',
  },
  {
    id: '2',
    category: 'Food',
    limit: 600,
    spent: 450,
    period: 'monthly',
  },
  {
    id: '3',
    category: 'Transportation',
    limit: 300,
    spent: 275,
    period: 'monthly',
  },
  {
    id: '4',
    category: 'Entertainment',
    limit: 200,
    spent: 150,
    period: 'monthly',
  },
  {
    id: '5',
    category: 'Utilities',
    limit: 400,
    spent: 380,
    period: 'monthly',
  }
];

interface BudgetsState {
  budgets: Budget[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: BudgetsState = {
  budgets: [],
  status: 'idle',
  error: null,
};

export const budgetsSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    setBudgets: (state, action: PayloadAction<Budget[]>) => {
      state.budgets = action.payload;
      state.status = 'succeeded';
      // Persist to storage
      saveData(STORAGE_KEYS.BUDGETS, action.payload);
    },
    addBudget: (state, action: PayloadAction<Budget>) => {
      state.budgets.push(action.payload);
      // Persist to storage
      saveData(STORAGE_KEYS.BUDGETS, state.budgets);
    },
    updateBudget: (state, action: PayloadAction<Budget>) => {
      const index = state.budgets.findIndex(budget => budget.id === action.payload.id);
      if (index !== -1) {
        state.budgets[index] = action.payload;
        // Persist to storage
        saveData(STORAGE_KEYS.BUDGETS, state.budgets);
      }
    },
    deleteBudget: (state, action: PayloadAction<string>) => {
      state.budgets = state.budgets.filter(budget => budget.id !== action.payload);
      // Persist to storage
      saveData(STORAGE_KEYS.BUDGETS, state.budgets);
    },
    updateSpending: (state, action: PayloadAction<{ id: string, amount: number }>) => {
      const index = state.budgets.findIndex(budget => budget.id === action.payload.id);
      if (index !== -1) {
        state.budgets[index].spent += action.payload.amount;
        // Persist to storage
        saveData(STORAGE_KEYS.BUDGETS, state.budgets);
      }
    },
    loadSampleBudgets: (state) => {
      state.budgets = initialBudgets;
      state.status = 'succeeded';
      // Persist to storage
      saveData(STORAGE_KEYS.BUDGETS, initialBudgets);
    },
    loadBudgetsFromStorage: (state) => {
      state.status = 'loading';
    },
    loadBudgetsSuccess: (state, action: PayloadAction<Budget[]>) => {
      state.budgets = action.payload;
      state.status = 'succeeded';
    },
    loadBudgetsFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.status = 'failed';
    },
  },
});

export const { 
  setBudgets, 
  addBudget, 
  updateBudget, 
  deleteBudget, 
  updateSpending,
  loadSampleBudgets,
  loadBudgetsFromStorage,
  loadBudgetsSuccess,
  loadBudgetsFailure
} = budgetsSlice.actions;

// Thunk to load budgets from storage with proper null safety
export const loadBudgetsAsync = () => async (dispatch: any) => {
  dispatch(loadBudgetsFromStorage());
  try {
    const budgets = await loadData<Budget[]>(STORAGE_KEYS.BUDGETS, []);
    dispatch(loadBudgetsSuccess(budgets && budgets.length > 0 ? budgets : initialBudgets));
  } catch (error) {
    dispatch(loadBudgetsFailure(error instanceof Error ? error.message : 'Unknown error'));
    dispatch(loadBudgetsSuccess(initialBudgets)); // Fallback to sample data
  }
};

// Selectors with proper null safety
export const selectAllBudgets = (state: RootState) => state.budgets.budgets || [];
export const selectBudgetById = (state: RootState, budgetId: string | undefined) => 
  budgetId ? state.budgets.budgets.find(budget => budget.id === budgetId) : undefined;
export const selectBudgetsByPeriod = (state: RootState, period: 'monthly' | 'paycheck' | undefined) => 
  period ? (state.budgets.budgets || []).filter(budget => budget.period === period) : [];
export const selectBudgetsStatus = (state: RootState) => state.budgets.status;
export const selectBudgetsError = (state: RootState) => state.budgets.error;

// Additional selectors with proper null safety
export const selectBudgetsByCategory = (state: RootState, category: string | undefined) => {
  if (!category) return [];
  return (state.budgets.budgets || []).filter(budget => budget.category === category);
};

export const selectBudgetsByMonth = (state: RootState, month: string | undefined) => {
  if (!month) return [];
  return (state.budgets.budgets || []).filter(budget => {
    if (!budget || !budget.month) return false;
    return budget.month === month;
  });
};

export default budgetsSlice.reducer;
