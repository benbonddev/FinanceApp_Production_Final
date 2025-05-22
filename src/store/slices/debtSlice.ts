import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { Debt } from '../../types';
import { saveData, loadData, STORAGE_KEYS } from '../../utils/storage';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'react-native-uuid';

// Sample debts for development
const initialDebts: Debt[] = [
  { id: '1', name: 'Student Loan', initialAmount: 25000, currentBalance: 18500, interestRate: 4.5, minimumPayment: 250, dueDate: 15, category: 'loan' },
  { id: '2', name: 'Credit Card', initialAmount: 5000, currentBalance: 3200, interestRate: 19.99, minimumPayment: 100, dueDate: 20, category: 'credit_card' },
  { id: '3', name: 'Car Loan', initialAmount: 15000, currentBalance: 8000, interestRate: 3.9, minimumPayment: 300, dueDate: 5, category: 'loan' },
  { id: '4', name: 'Mortgage', initialAmount: 250000, currentBalance: 220000, interestRate: 3.25, minimumPayment: 1200, dueDate: 1, category: 'mortgage' },
];

interface AppSettings { // Define a type for general app settings if it doesn't exist
  debtStrategy?: 'avalanche' | 'snowball';
  // other app settings can go here
}

interface DebtsState {
  debts: Debt[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  isSaving: boolean;
  error: string | null;
  strategy: 'avalanche' | 'snowball';
}

const initialState: DebtsState = {
  debts: [],
  status: 'idle',
  isSaving: false,
  error: null,
  strategy: 'avalanche', // Default strategy
};

// Async Thunks
export const loadDebtsAsync = createAsyncThunk<
  { debts: Debt[]; strategy: 'avalanche' | 'snowball' }, // Return type includes strategy
  void,
  { rejectValue: string }
>(
  'debts/loadDebts',
  async (_, thunkAPI) => {
    try {
      const debts = await loadData<Debt[]>(STORAGE_KEYS.DEBTS, []);
      const settings = await loadData<AppSettings>(STORAGE_KEYS.SETTINGS, {});
      const strategy = settings?.debtStrategy || initialState.strategy;
      return { debts: debts && debts.length > 0 ? debts : initialDebts, strategy };
    } catch (error: any) {
      logger.error('Failed to load debts or strategy:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to load debts or strategy');
    }
  }
);

// Type for debt data before ID is assigned
type NewDebtData = Omit<Debt, 'id'>;

export const addDebtAsync = createAsyncThunk<Debt, NewDebtData, { state: RootState; rejectValue: string }>(
  'debts/addDebt',
  async (debtData, thunkAPI) => {
    try {
      const debtWithId: Debt = { ...debtData, id: uuidv4() as string };
      const currentDebts = thunkAPI.getState().debts.debts;
      const newDebtsArray = [...currentDebts, debtWithId];
      await saveData(STORAGE_KEYS.DEBTS, newDebtsArray);
      return debtWithId;
    } catch (error: any) {
      logger.error('Failed to save new debt:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to save new debt');
    }
  }
);

export const updateDebtAsync = createAsyncThunk<Debt, Debt, { state: RootState; rejectValue: string }>(
  'debts/updateDebt',
  async (updatedDebt, thunkAPI) => {
    try {
      const currentDebts = thunkAPI.getState().debts.debts;
      const newDebtsArray = currentDebts.map(d => d.id === updatedDebt.id ? updatedDebt : d);
      await saveData(STORAGE_KEYS.DEBTS, newDebtsArray);
      return updatedDebt;
    } catch (error: any) {
      logger.error('Failed to update debt:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to update debt');
    }
  }
);

export const deleteDebtAsync = createAsyncThunk<string, string, { state: RootState; rejectValue: string }>(
  'debts/deleteDebt',
  async (debtId, thunkAPI) => {
    try {
      const currentDebts = thunkAPI.getState().debts.debts;
      const newDebtsArray = currentDebts.filter(d => d.id !== debtId);
      await saveData(STORAGE_KEYS.DEBTS, newDebtsArray);
      return debtId;
    } catch (error: any) {
      logger.error('Failed to delete debt:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to delete debt');
    }
  }
);

export const makePaymentAsync = createAsyncThunk<
  { id: string; amount: number },
  { id: string; amount: number },
  { state: RootState; rejectValue: string }
>(
  'debts/makePayment',
  async (payload, thunkAPI) => {
    try {
      const currentDebts = thunkAPI.getState().debts.debts;
      const newDebtsArray = currentDebts.map(d =>
        d.id === payload.id ? { ...d, currentBalance: Math.max(0, d.currentBalance - payload.amount) } : d
      );
      await saveData(STORAGE_KEYS.DEBTS, newDebtsArray);
      return payload;
    } catch (error: any) {
      logger.error('Failed to make payment:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to make payment');
    }
  }
);

export const setStrategyAsync = createAsyncThunk<
  'avalanche' | 'snowball',
  'avalanche' | 'snowball',
  { rejectValue: string }
>(
  'debts/setStrategy',
  async (newStrategy, thunkAPI) => {
    try {
      const settings = await loadData<AppSettings>(STORAGE_KEYS.SETTINGS, {});
      const updatedSettings = { ...settings, debtStrategy: newStrategy };
      await saveData(STORAGE_KEYS.SETTINGS, updatedSettings);
      return newStrategy;
    } catch (error: any) {
      logger.error('Failed to save strategy:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to save strategy');
    }
  }
);

export const loadSampleDebtsAsync = createAsyncThunk<Debt[], void, { rejectValue: string }>(
  'debts/loadSampleDebts',
  async (_, thunkAPI) => {
    try {
      await saveData(STORAGE_KEYS.DEBTS, initialDebts);
      // Also reset strategy to default when loading sample debts?
      // For now, only affects debts array.
      return initialDebts;
    } catch (error: any) {
      logger.error('Failed to save sample debts:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to save sample debts');
    }
  }
);


export const debtsSlice = createSlice({
  name: 'debts',
  initialState,
  reducers: {
    setDebts: (state, action: PayloadAction<Debt[]>) => { // Kept for direct setting if needed
      state.debts = action.payload;
      state.status = 'succeeded';
      saveData(STORAGE_KEYS.DEBTS, action.payload).catch(e => logger.error("Error in setDebts direct save", e));
    },
    debtAdded: (state, action: PayloadAction<Debt>) => {
      state.debts.push(action.payload);
    },
    debtUpdated: (state, action: PayloadAction<Debt>) => {
      const index = state.debts.findIndex(d => d.id === action.payload.id);
      if (index !== -1) state.debts[index] = action.payload;
    },
    debtDeleted: (state, action: PayloadAction<string>) => {
      state.debts = state.debts.filter(d => d.id !== action.payload);
    },
    paymentMade: (state, action: PayloadAction<{ id: string; amount: number }>) => {
      const index = state.debts.findIndex(d => d.id === action.payload.id);
      if (index !== -1) {
        state.debts[index].currentBalance = Math.max(0, state.debts[index].currentBalance - action.payload.amount);
      }
    },
    strategySet: (state, action: PayloadAction<'avalanche' | 'snowball'>) => {
      state.strategy = action.payload;
    },
    sampleDebtsLoaded: (state, action: PayloadAction<Debt[]>) => {
        state.debts = action.payload;
        state.status = 'succeeded'; // Or 'idle' if samples are just a starting point
    },
  },
  extraReducers: (builder) => {
    builder
      // Load Debts (and strategy)
      .addCase(loadDebtsAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadDebtsAsync.fulfilled, (state, action: PayloadAction<{ debts: Debt[]; strategy: 'avalanche' | 'snowball' }>) => {
        state.debts = action.payload.debts;
        state.strategy = action.payload.strategy;
        state.status = 'succeeded';
      })
      .addCase(loadDebtsAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.debts = initialDebts; // Fallback
        state.strategy = initialState.strategy; // Fallback strategy
      })
      // Add Debt
      .addCase(addDebtAsync.pending, (state) => { state.isSaving = true; state.error = null; })
      .addCase(addDebtAsync.fulfilled, (state, action) => {
        debtsSlice.caseReducers.debtAdded(state, action);
        state.isSaving = false;
      })
      .addCase(addDebtAsync.rejected, (state, action) => { state.isSaving = false; state.error = action.payload as string; })
      // Update Debt
      .addCase(updateDebtAsync.pending, (state) => { state.isSaving = true; state.error = null; })
      .addCase(updateDebtAsync.fulfilled, (state, action) => {
        debtsSlice.caseReducers.debtUpdated(state, action);
        state.isSaving = false;
      })
      .addCase(updateDebtAsync.rejected, (state, action) => { state.isSaving = false; state.error = action.payload as string; })
      // Delete Debt
      .addCase(deleteDebtAsync.pending, (state) => { state.isSaving = true; state.error = null; })
      .addCase(deleteDebtAsync.fulfilled, (state, action) => {
        debtsSlice.caseReducers.debtDeleted(state, action);
        state.isSaving = false;
      })
      .addCase(deleteDebtAsync.rejected, (state, action) => { state.isSaving = false; state.error = action.payload as string; })
      // Make Payment
      .addCase(makePaymentAsync.pending, (state) => { state.isSaving = true; state.error = null; })
      .addCase(makePaymentAsync.fulfilled, (state, action) => {
        debtsSlice.caseReducers.paymentMade(state, action);
        state.isSaving = false;
      })
      .addCase(makePaymentAsync.rejected, (state, action) => { state.isSaving = false; state.error = action.payload as string; })
      // Set Strategy
      .addCase(setStrategyAsync.pending, (state) => { state.isSaving = true; state.error = null; })
      .addCase(setStrategyAsync.fulfilled, (state, action) => {
        debtsSlice.caseReducers.strategySet(state, action);
        state.isSaving = false;
      })
      .addCase(setStrategyAsync.rejected, (state, action) => { state.isSaving = false; state.error = action.payload as string; })
      // Load Sample Debts
      .addCase(loadSampleDebtsAsync.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(loadSampleDebtsAsync.fulfilled, (state, action) => {
        debtsSlice.caseReducers.sampleDebtsLoaded(state, action);
        state.status = 'succeeded';
      })
      .addCase(loadSampleDebtsAsync.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload as string; });
  },
});

export const { 
  setDebts, // Kept for direct setting if needed
  debtAdded,
  debtUpdated,
  debtDeleted,
  paymentMade,
  strategySet,
  sampleDebtsLoaded,
} = debtsSlice.actions;

// Selectors with proper null safety
export const selectAllDebts = (state: RootState) => state.debts.debts || [];
export const selectDebtById = (state: RootState, debtId: string | undefined) => 
  debtId ? (state.debts.debts || []).find(debt => debt.id === debtId) : undefined;
export const selectDebtsStatus = (state: RootState) => state.debts.status;
export const selectDebtsError = (state: RootState) => state.debts.error;
export const selectStrategy = (state: RootState) => state.debts.strategy || 'avalanche';

// Select sorted debts based on strategy with proper null safety
export const selectSortedDebts = (state: RootState) => {
  const { debts = [], strategy = 'avalanche' } = state.debts || { debts: [], strategy: 'avalanche' }; // Provide default for state.debts itself
  
  return [...debts].sort((a, b) => {
    if (!a || !b) return 0;
    
    if (strategy === 'avalanche') {
      return (b.interestRate || 0) - (a.interestRate || 0);
    } else {
      return (a.currentBalance || 0) - (b.currentBalance || 0);
    }
  });
};

// Additional selectors with proper null safety
export const selectDebtsByCategory = (state: RootState, category: string | undefined) => {
  if (!category) return [];
  return (state.debts.debts || []).filter(debt => debt.category === category);
};

export const selectTotalDebtAmount = (state: RootState) => {
  return (state.debts.debts || []).reduce((total, debt) => total + (debt.currentBalance || 0), 0);
};

export default debtsSlice.reducer;
