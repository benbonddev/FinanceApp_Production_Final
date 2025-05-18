import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getPaychecksData, savePaychecksData } from '../../utils/storage';
import { Paycheck } from '../../types';
import { logger } from '../../utils/logger';

interface PaychecksState {
  paychecks: Paycheck[];
  loading: boolean;
  error: string | null;
}

const initialState: PaychecksState = {
  paychecks: [],
  loading: false,
  error: null,
};

export const paychecksSlice = createSlice({
  name: 'paychecks',
  initialState,
  reducers: {
    fetchPaychecksStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPaychecksSuccess: (state, action: PayloadAction<Paycheck[]>) => {
      state.paychecks = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchPaychecksFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    addPaycheck: (state, action: PayloadAction<Paycheck>) => {
      const newPaychecks = [...state.paychecks, action.payload];
      state.paychecks = newPaychecks;
      
      savePaychecksData(newPaychecks)
        .then(() => {
          // Paycheck saved successfully
        })
        .catch(() => {
          logger.error('Failed to save paycheck');
        });
    },
    updatePaycheck: (state, action: PayloadAction<Paycheck>) => {
      const updatedPaychecks = state.paychecks.map(paycheck => 
        paycheck.id === action.payload.id ? action.payload : paycheck
      );
      state.paychecks = updatedPaychecks;
      
      savePaychecksData(updatedPaychecks)
        .then(() => {
          // Paycheck updated successfully
        })
        .catch(() => {
          logger.error('Failed to update paycheck');
        });
    },
    deletePaycheck: (state, action: PayloadAction<string>) => {
      const filteredPaychecks = state.paychecks.filter(paycheck => paycheck.id !== action.payload);
      state.paychecks = filteredPaychecks;
      
      savePaychecksData(filteredPaychecks)
        .then(() => {
          // Paycheck deleted successfully
        })
        .catch(() => {
          logger.error('Failed to delete paycheck');
        });
    },
    loadPaychecks: (state) => {
      state.loading = true;
      getPaychecksData()
        .then((paychecks) => {
          if (paychecks) {
            state.paychecks = paychecks;
          }
          state.loading = false;
        })
        .catch(() => {
          state.loading = false;
          state.error = 'Failed to load paychecks';
          logger.error('Failed to load paychecks');
        });
    },
  },
});

export const { 
  fetchPaychecksStart,
  fetchPaychecksSuccess,
  fetchPaychecksFailure,
  addPaycheck,
  updatePaycheck,
  deletePaycheck,
  loadPaychecks,
} = paychecksSlice.actions;

export default paychecksSlice.reducer;
