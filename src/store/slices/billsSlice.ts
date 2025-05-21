import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { getBillsData, saveBillsData } from '../../utils/storage';
import { Bill } from '../../types';
import { logger } from '../../utils/logger';
import { RootState } from '../index'; // Import RootState for thunkAPI.getState()

interface BillsState {
  bills: Bill[];
  loading: boolean; // For loading operations
  isSaving: boolean; // For add/update/delete operations
  error: string | null;
}

const initialState: BillsState = {
  bills: [],
  loading: false,
  isSaving: false,
  error: null,
};

// Async thunk for loading bills
export const loadBillsAsync = createAsyncThunk<
  Bill[],
  void,
  { rejectValue: string }
>(
  'bills/loadBills',
  async (_, thunkAPI) => {
    try {
      const bills = await getBillsData();
      return bills || []; // Ensure we always return an array, even if null is returned
    } catch (error: any) {
      logger.error('Failed to load bills:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to load bills');
    }
  }
);

// Async thunk for adding a bill
export const addBillAsync = createAsyncThunk<
  Bill, // Return type: the new bill
  Bill, // Argument type: the bill to add
  { state: RootState; rejectValue: string }
>(
  'bills/addBill',
  async (newBill, thunkAPI) => {
    try {
      const currentBills = thunkAPI.getState().bills.bills;
      const newBillsArray = [...currentBills, newBill];
      await saveBillsData(newBillsArray);
      return newBill;
    } catch (error: any) {
      logger.error('Failed to save bill:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to save bill');
    }
  }
);

// Async thunk for updating a bill
export const updateBillAsync = createAsyncThunk<
  Bill, // Return type: the updated bill
  Bill, // Argument type: the bill to update
  { state: RootState; rejectValue: string }
>(
  'bills/updateBill',
  async (updatedBill, thunkAPI) => {
    try {
      const currentBills = thunkAPI.getState().bills.bills;
      const newBillsArray = currentBills.map(bill =>
        bill.id === updatedBill.id ? updatedBill : bill
      );
      await saveBillsData(newBillsArray);
      return updatedBill;
    } catch (error: any) {
      logger.error('Failed to update bill:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to update bill');
    }
  }
);

// Async thunk for deleting a bill
export const deleteBillAsync = createAsyncThunk<
  string, // Return type: the ID of the deleted bill
  string, // Argument type: the ID of the bill to delete
  { state: RootState; rejectValue: string }
>(
  'bills/deleteBill',
  async (billId, thunkAPI) => {
    try {
      const currentBills = thunkAPI.getState().bills.bills;
      const newBillsArray = currentBills.filter(bill => bill.id !== billId);
      await saveBillsData(newBillsArray);
      return billId;
    } catch (error: any) {
      logger.error('Failed to delete bill:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to delete bill');
    }
  }
);

// Async thunk for marking a bill as paid/unpaid
export const markBillAsPaidAsync = createAsyncThunk<
  { id: string; isPaid: boolean; paidDate?: string }, // Return type
  { id: string; isPaid: boolean }, // Argument type
  { state: RootState; rejectValue: string }
>(
  'bills/markBillAsPaid',
  async (payload, thunkAPI) => {
    try {
      const currentBills = thunkAPI.getState().bills.bills;
      const paidDate = payload.isPaid ? new Date().toISOString() : undefined;
      const newBillsArray = currentBills.map(bill =>
        bill.id === payload.id ? { ...bill, isPaid: payload.isPaid, paidDate } : bill
      );
      await saveBillsData(newBillsArray);
      return { ...payload, paidDate };
    } catch (error: any) {
      logger.error('Failed to update bill payment status:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to update bill payment status');
    }
  }
);

export const billsSlice = createSlice({
  name: 'bills',
  initialState,
  reducers: {
    // Synchronous reducers to update state based on fulfilled thunk actions
    billAdded: (state, action: PayloadAction<Bill>) => {
      state.bills.push(action.payload);
    },
    billUpdated: (state, action: PayloadAction<Bill>) => {
      const index = state.bills.findIndex(bill => bill.id === action.payload.id);
      if (index !== -1) {
        state.bills[index] = action.payload;
      }
    },
    billDeleted: (state, action: PayloadAction<string>) => {
      state.bills = state.bills.filter(bill => bill.id !== action.payload);
    },
    billPaymentStatusUpdated: (state, action: PayloadAction<{ id: string; isPaid: boolean; paidDate?: string }>) => {
      const index = state.bills.findIndex(bill => bill.id === action.payload.id);
      if (index !== -1) {
        state.bills[index].isPaid = action.payload.isPaid;
        state.bills[index].paidDate = action.payload.paidDate;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Load Bills
      .addCase(loadBillsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadBillsAsync.fulfilled, (state, action: PayloadAction<Bill[]>) => {
        state.bills = action.payload;
        state.loading = false;
      })
      .addCase(loadBillsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load bills';
      })
      // Add Bill
      .addCase(addBillAsync.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(addBillAsync.fulfilled, (state, action: PayloadAction<Bill>) => {
        // state.bills.push(action.payload); // Directly update or call reducer
        billsSlice.caseReducers.billAdded(state, action);
        state.isSaving = false;
      })
      .addCase(addBillAsync.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload || 'Failed to save bill';
      })
      // Update Bill
      .addCase(updateBillAsync.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateBillAsync.fulfilled, (state, action: PayloadAction<Bill>) => {
        billsSlice.caseReducers.billUpdated(state, action);
        state.isSaving = false;
      })
      .addCase(updateBillAsync.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload || 'Failed to update bill';
      })
      // Delete Bill
      .addCase(deleteBillAsync.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(deleteBillAsync.fulfilled, (state, action: PayloadAction<string>) => {
        billsSlice.caseReducers.billDeleted(state, action);
        state.isSaving = false;
      })
      .addCase(deleteBillAsync.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload || 'Failed to delete bill';
      })
      // Mark Bill As Paid
      .addCase(markBillAsPaidAsync.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(markBillAsPaidAsync.fulfilled, (state, action: PayloadAction<{ id: string; isPaid: boolean; paidDate?: string }>) => {
        billsSlice.caseReducers.billPaymentStatusUpdated(state, action);
        state.isSaving = false;
      })
      .addCase(markBillAsPaidAsync.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload || 'Failed to update bill payment status';
      });
  },
});

export const {
  billAdded,
  billUpdated,
  billDeleted,
  billPaymentStatusUpdated,
} = billsSlice.actions;

export default billsSlice.reducer;
