import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { Budget } from '../../types';
import { saveData, loadData, STORAGE_KEYS } from '../../utils/storage';
import { logger } from '../../utils/logger';

// Sample budgets for development
const initialBudgets: Budget[] = [
  { id: '1', category: 'Housing', limit: 1500, spent: 1200, period: 'monthly' },
  { id: '2', category: 'Food', limit: 600, spent: 450, period: 'monthly' },
  { id: '3', category: 'Transportation', limit: 300, spent: 275, period: 'monthly' },
  { id: '4', category: 'Entertainment', limit: 200, spent: 150, period: 'monthly' },
  { id: '5', category: 'Utilities', limit: 400, spent: 380, period: 'monthly' }
];

interface BudgetsState {
  budgets: Budget[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  isSaving: boolean;
  error: string | null;
}

const initialState: BudgetsState = {
  budgets: [],
  status: 'idle',
  isSaving: false,
  error: null,
};

// Async Thunks
export const loadBudgetsAsync = createAsyncThunk<Budget[], void, { rejectValue: string }>(
  'budgets/loadBudgets',
  async (_, thunkAPI) => {
    try {
      const budgets = await loadData<Budget[]>(STORAGE_KEYS.BUDGETS, []);
      return budgets && budgets.length > 0 ? budgets : initialBudgets; // Fallback to initialBudgets if storage is empty
    } catch (error: any) {
      logger.error('Failed to load budgets from storage:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to load budgets');
    }
  }
);

export const addBudgetAsync = createAsyncThunk<Budget, Budget, { state: RootState; rejectValue: string }>(
  'budgets/addBudget',
  async (newBudget, thunkAPI) => {
    try {
      const currentBudgets = thunkAPI.getState().budgets.budgets;
      const newBudgetsArray = [...currentBudgets, newBudget];
      await saveData(STORAGE_KEYS.BUDGETS, newBudgetsArray);
      return newBudget;
    } catch (error: any) {
      logger.error('Failed to save new budget:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to save new budget');
    }
  }
);

export const updateBudgetAsync = createAsyncThunk<Budget, Budget, { state: RootState; rejectValue: string }>(
  'budgets/updateBudget',
  async (updatedBudget, thunkAPI) => {
    try {
      const currentBudgets = thunkAPI.getState().budgets.budgets;
      const newBudgetsArray = currentBudgets.map(b => b.id === updatedBudget.id ? updatedBudget : b);
      await saveData(STORAGE_KEYS.BUDGETS, newBudgetsArray);
      return updatedBudget;
    } catch (error: any) {
      logger.error('Failed to update budget:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to update budget');
    }
  }
);

export const deleteBudgetAsync = createAsyncThunk<string, string, { state: RootState; rejectValue: string }>(
  'budgets/deleteBudget',
  async (budgetId, thunkAPI) => {
    try {
      const currentBudgets = thunkAPI.getState().budgets.budgets;
      const newBudgetsArray = currentBudgets.filter(b => b.id !== budgetId);
      await saveData(STORAGE_KEYS.BUDGETS, newBudgetsArray);
      return budgetId;
    } catch (error: any) {
      logger.error('Failed to delete budget:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to delete budget');
    }
  }
);

export const updateSpendingAsync = createAsyncThunk<
  { id: string; amount: number },
  { id: string; amount: number },
  { state: RootState; rejectValue: string }
>(
  'budgets/updateSpending',
  async (payload, thunkAPI) => {
    try {
      const currentBudgets = thunkAPI.getState().budgets.budgets;
      const newBudgetsArray = currentBudgets.map(b =>
        b.id === payload.id ? { ...b, spent: b.spent + payload.amount } : b
      );
      await saveData(STORAGE_KEYS.BUDGETS, newBudgetsArray);
      return payload;
    } catch (error: any) {
      logger.error('Failed to update spending:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to update spending');
    }
  }
);

export const loadSampleBudgetsAsync = createAsyncThunk<Budget[], void, { rejectValue: string }>(
    'budgets/loadSampleBudgets',
    async (_, thunkAPI) => {
        try {
            await saveData(STORAGE_KEYS.BUDGETS, initialBudgets);
            return initialBudgets;
        } catch (error: any) {
            logger.error('Failed to save sample budgets:', error);
            return thunkAPI.rejectWithValue(error.message || 'Failed to save sample budgets');
        }
    }
);


export const budgetsSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    setBudgets: (state, action: PayloadAction<Budget[]>) => {
      state.budgets = action.payload;
      state.status = 'succeeded';
      // Persist to storage - This direct save might be redundant if setBudgets is always called by a thunk.
      // Consider if this action is still needed or if all state changes should go through thunks.
      saveData(STORAGE_KEYS.BUDGETS, action.payload).catch(e => logger.error("Error in setBudgets direct save", e));
    },
    // Synchronous reducers for state updates from thunks
    budgetAdded: (state, action: PayloadAction<Budget>) => {
      state.budgets.push(action.payload);
    },
    budgetUpdated: (state, action: PayloadAction<Budget>) => {
      const index = state.budgets.findIndex(budget => budget.id === action.payload.id);
      if (index !== -1) {
        state.budgets[index] = action.payload;
      }
    },
    budgetDeleted: (state, action: PayloadAction<string>) => {
      state.budgets = state.budgets.filter(budget => budget.id !== action.payload);
    },
    spendingUpdated: (state, action: PayloadAction<{ id: string; amount: number }>) => {
      const index = state.budgets.findIndex(budget => budget.id === action.payload.id);
      if (index !== -1) {
        state.budgets[index].spent += action.payload.amount;
      }
    },
    sampleBudgetsLoaded: (state, action: PayloadAction<Budget[]>) => {
        state.budgets = action.payload;
        state.status = 'succeeded';
    }
  },
  extraReducers: (builder) => {
    builder
      // Load Budgets
      .addCase(loadBudgetsAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadBudgetsAsync.fulfilled, (state, action: PayloadAction<Budget[]>) => {
        state.budgets = action.payload;
        state.status = 'succeeded';
      })
      .addCase(loadBudgetsAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.budgets = initialBudgets; // Fallback to initial budgets on load failure
      })
      // Add Budget
      .addCase(addBudgetAsync.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(addBudgetAsync.fulfilled, (state, action: PayloadAction<Budget>) => {
        budgetsSlice.caseReducers.budgetAdded(state, action);
        state.isSaving = false;
      })
      .addCase(addBudgetAsync.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      })
      // Update Budget
      .addCase(updateBudgetAsync.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateBudgetAsync.fulfilled, (state, action: PayloadAction<Budget>) => {
        budgetsSlice.caseReducers.budgetUpdated(state, action);
        state.isSaving = false;
      })
      .addCase(updateBudgetAsync.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      })
      // Delete Budget
      .addCase(deleteBudgetAsync.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(deleteBudgetAsync.fulfilled, (state, action: PayloadAction<string>) => {
        budgetsSlice.caseReducers.budgetDeleted(state, action);
        state.isSaving = false;
      })
      .addCase(deleteBudgetAsync.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      })
      // Update Spending
      .addCase(updateSpendingAsync.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateSpendingAsync.fulfilled, (state, action: PayloadAction<{ id: string; amount: number }>) => {
        budgetsSlice.caseReducers.spendingUpdated(state, action);
        state.isSaving = false;
      })
      .addCase(updateSpendingAsync.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      })
      // Load Sample Budgets
      .addCase(loadSampleBudgetsAsync.pending, (state) => {
        state.status = 'loading'; // Or isSaving = true, depending on desired UI feedback
        state.error = null;
      })
      .addCase(loadSampleBudgetsAsync.fulfilled, (state, action: PayloadAction<Budget[]>) => {
        budgetsSlice.caseReducers.sampleBudgetsLoaded(state, action);
        state.status = 'succeeded'; // Or isSaving = false
      })
      .addCase(loadSampleBudgetsAsync.rejected, (state, action) => {
        state.status = 'failed'; // Or isSaving = false
        state.error = action.payload as string;
      });
  },
});

export const { 
  setBudgets, // Keep if direct setting is still needed
  budgetAdded,
  budgetUpdated,
  budgetDeleted,
  spendingUpdated,
  sampleBudgetsLoaded,
} = budgetsSlice.actions;

// Selectors with proper null safety
export const selectAllBudgets = (state: RootState) => state.budgets.budgets || [];
export const selectBudgetById = (state: RootState, budgetId: string | undefined) => 
  budgetId ? (state.budgets.budgets || []).find(budget => budget.id === budgetId) : undefined;
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
