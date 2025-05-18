import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { Debt } from '../../types';
import { saveData, loadData, STORAGE_KEYS } from '../../utils/storage';

// Sample debts for development
const initialDebts: Debt[] = [
  {
    id: '1',
    name: 'Student Loan',
    initialAmount: 25000,
    currentBalance: 18500,
    interestRate: 4.5,
    minimumPayment: 250,
    dueDate: 15,
    category: 'loan',
  },
  {
    id: '2',
    name: 'Credit Card',
    initialAmount: 5000,
    currentBalance: 3200,
    interestRate: 19.99,
    minimumPayment: 100,
    dueDate: 20,
    category: 'credit_card',
  },
  {
    id: '3',
    name: 'Car Loan',
    initialAmount: 15000,
    currentBalance: 8000,
    interestRate: 3.9,
    minimumPayment: 300,
    dueDate: 5,
    category: 'loan',
  },
  {
    id: '4',
    name: 'Mortgage',
    initialAmount: 250000,
    currentBalance: 220000,
    interestRate: 3.25,
    minimumPayment: 1200,
    dueDate: 1,
    category: 'mortgage',
  },
];

interface DebtsState {
  debts: Debt[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  strategy: 'avalanche' | 'snowball';
}

const initialState: DebtsState = {
  debts: [],
  status: 'idle',
  error: null,
  strategy: 'avalanche',
};

export const debtsSlice = createSlice({
  name: 'debts',
  initialState,
  reducers: {
    setDebts: (state, action: PayloadAction<Debt[]>) => {
      state.debts = action.payload;
      state.status = 'succeeded';
      // Persist to storage
      saveData(STORAGE_KEYS.DEBTS, action.payload);
    },
    addDebt: (state, action: PayloadAction<Debt>) => {
      state.debts.push(action.payload);
      // Persist to storage
      saveData(STORAGE_KEYS.DEBTS, state.debts);
    },
    updateDebt: (state, action: PayloadAction<Debt>) => {
      const index = state.debts.findIndex(debt => debt.id === action.payload.id);
      if (index !== -1) {
        state.debts[index] = action.payload;
        // Persist to storage
        saveData(STORAGE_KEYS.DEBTS, state.debts);
      }
    },
    deleteDebt: (state, action: PayloadAction<string>) => {
      state.debts = state.debts.filter(debt => debt.id !== action.payload);
      // Persist to storage
      saveData(STORAGE_KEYS.DEBTS, state.debts);
    },
    makePayment: (state, action: PayloadAction<{ id: string, amount: number }>) => {
      const index = state.debts.findIndex(debt => debt.id === action.payload.id);
      if (index !== -1) {
        state.debts[index].currentBalance -= action.payload.amount;
        if (state.debts[index].currentBalance < 0) {
          state.debts[index].currentBalance = 0;
        }
        // Persist to storage
        saveData(STORAGE_KEYS.DEBTS, state.debts);
      }
    },
    setStrategy: (state, action: PayloadAction<'avalanche' | 'snowball'>) => {
      state.strategy = action.payload;
      // Persist to storage
      saveData(STORAGE_KEYS.SETTINGS, { ...state, strategy: action.payload });
    },
    loadSampleDebts: (state) => {
      state.debts = initialDebts;
      state.status = 'succeeded';
      // Persist to storage
      saveData(STORAGE_KEYS.DEBTS, initialDebts);
    },
    loadDebtsFromStorage: (state) => {
      state.status = 'loading';
    },
    loadDebtsSuccess: (state, action: PayloadAction<Debt[]>) => {
      state.debts = action.payload;
      state.status = 'succeeded';
    },
    loadDebtsFailure: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.status = 'failed';
    },
  },
});

export const { 
  setDebts, 
  addDebt, 
  updateDebt, 
  deleteDebt, 
  makePayment,
  setStrategy,
  loadSampleDebts,
  loadDebtsFromStorage,
  loadDebtsSuccess,
  loadDebtsFailure
} = debtsSlice.actions;

// Thunk to load debts from storage with proper null safety
export const loadDebtsAsync = () => async (dispatch: any) => {
  dispatch(loadDebtsFromStorage());
  try {
    const debts = await loadData<Debt[]>(STORAGE_KEYS.DEBTS, []);
    dispatch(loadDebtsSuccess(debts && debts.length > 0 ? debts : initialDebts));
  } catch (error) {
    dispatch(loadDebtsFailure(error instanceof Error ? error.message : 'Unknown error'));
    dispatch(loadDebtsSuccess(initialDebts)); // Fallback to sample data
  }
};

// Selectors with proper null safety
export const selectAllDebts = (state: RootState) => state.debts.debts || [];
export const selectDebtById = (state: RootState, debtId: string | undefined) => 
  debtId ? state.debts.debts.find(debt => debt.id === debtId) : undefined;
export const selectDebtsStatus = (state: RootState) => state.debts.status;
export const selectDebtsError = (state: RootState) => state.debts.error;
export const selectStrategy = (state: RootState) => state.debts.strategy || 'avalanche';

// Select sorted debts based on strategy with proper null safety
export const selectSortedDebts = (state: RootState) => {
  const { debts = [], strategy = 'avalanche' } = state.debts || {};
  
  return [...debts].sort((a, b) => {
    if (!a || !b) return 0;
    
    if (strategy === 'avalanche') {
      // Sort by highest interest rate first (Debt Avalanche)
      return (b.interestRate || 0) - (a.interestRate || 0);
    } else {
      // Sort by lowest balance first (Debt Snowball)
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
