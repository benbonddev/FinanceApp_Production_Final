import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { getPaychecksData, savePaychecksData } from '../../utils/storage';
import { Paycheck } from '../../types';
import { logger } from '../../utils/logger';
import { RootState } from '../index';

interface PaychecksState {
  paychecks: Paycheck[];
  loading: boolean;
  isSaving: boolean;
  error: string | null;
}

const initialState: PaychecksState = {
  paychecks: [],
  loading: false,
  isSaving: false,
  error: null,
};

// Async Thunks
export const loadPaychecksAsync = createAsyncThunk<Paycheck[], void, { rejectValue: string }>(
  'paychecks/loadPaychecks',
  async (_, thunkAPI) => {
    try {
      const paychecks = await getPaychecksData();
      return paychecks || [];
    } catch (error: any) {
      logger.error('Failed to load paychecks:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to load paychecks');
    }
  }
);

export const addPaycheckAsync = createAsyncThunk<Paycheck, Paycheck, { state: RootState; rejectValue: string }>(
  'paychecks/addPaycheck',
  async (newPaycheck, thunkAPI) => {
    try {
      const currentPaychecks = thunkAPI.getState().paychecks.paychecks;
      const newPaychecksArray = [...currentPaychecks, newPaycheck];
      await savePaychecksData(newPaychecksArray);
      return newPaycheck;
    } catch (error: any) {
      logger.error('Failed to save paycheck:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to save paycheck');
    }
  }
);

export const updatePaycheckAsync = createAsyncThunk<Paycheck, Paycheck, { state: RootState; rejectValue: string }>(
  'paychecks/updatePaycheck',
  async (updatedPaycheck, thunkAPI) => {
    try {
      const currentPaychecks = thunkAPI.getState().paychecks.paychecks;
      const newPaychecksArray = currentPaychecks.map(paycheck =>
        paycheck.id === updatedPaycheck.id ? updatedPaycheck : paycheck
      );
      await savePaychecksData(newPaychecksArray);
      return updatedPaycheck;
    } catch (error: any) {
      logger.error('Failed to update paycheck:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to update paycheck');
    }
  }
);

export const deletePaycheckAsync = createAsyncThunk<string, string, { state: RootState; rejectValue: string }>(
  'paychecks/deletePaycheck',
  async (paycheckId, thunkAPI) => {
    try {
      const currentPaychecks = thunkAPI.getState().paychecks.paychecks;
      const newPaychecksArray = currentPaychecks.filter(paycheck => paycheck.id !== paycheckId);
      await savePaychecksData(newPaychecksArray);
      return paycheckId;
    } catch (error: any) {
      logger.error('Failed to delete paycheck:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to delete paycheck');
    }
  }
);

export const paychecksSlice = createSlice({
  name: 'paychecks',
  initialState,
  reducers: {
    paycheckAdded: (state, action: PayloadAction<Paycheck>) => {
      state.paychecks.push(action.payload);
    },
    paycheckUpdated: (state, action: PayloadAction<Paycheck>) => {
      const index = state.paychecks.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.paychecks[index] = action.payload;
      }
    },
    paycheckDeleted: (state, action: PayloadAction<string>) => {
      state.paychecks = state.paychecks.filter(p => p.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Load Paychecks
      .addCase(loadPaychecksAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadPaychecksAsync.fulfilled, (state, action: PayloadAction<Paycheck[]>) => {
        state.paychecks = action.payload;
        state.loading = false;
      })
      .addCase(loadPaychecksAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load paychecks';
      })
      // Add Paycheck
      .addCase(addPaycheckAsync.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(addPaycheckAsync.fulfilled, (state, action: PayloadAction<Paycheck>) => {
        paychecksSlice.caseReducers.paycheckAdded(state, action);
        state.isSaving = false;
      })
      .addCase(addPaycheckAsync.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload || 'Failed to save paycheck';
      })
      // Update Paycheck
      .addCase(updatePaycheckAsync.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updatePaycheckAsync.fulfilled, (state, action: PayloadAction<Paycheck>) => {
        paychecksSlice.caseReducers.paycheckUpdated(state, action);
        state.isSaving = false;
      })
      .addCase(updatePaycheckAsync.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload || 'Failed to update paycheck';
      })
      // Delete Paycheck
      .addCase(deletePaycheckAsync.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(deletePaycheckAsync.fulfilled, (state, action: PayloadAction<string>) => {
        paychecksSlice.caseReducers.paycheckDeleted(state, action);
        state.isSaving = false;
      })
      .addCase(deletePaycheckAsync.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload || 'Failed to delete paycheck';
      });
  },
});

export const {
  paycheckAdded,
  paycheckUpdated,
  paycheckDeleted,
} = paychecksSlice.actions;

export default paychecksSlice.reducer;
