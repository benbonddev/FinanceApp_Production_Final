import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getBillsData, saveBillsData } from '../../utils/storage';
import { Bill } from '../../types';
import { logger } from '../../utils/logger';

interface BillsState {
  bills: Bill[];
  loading: boolean;
  error: string | null;
}

const initialState: BillsState = {
  bills: [],
  loading: false,
  error: null,
};

export const billsSlice = createSlice({
  name: 'bills',
  initialState,
  reducers: {
    fetchBillsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchBillsSuccess: (state, action: PayloadAction<Bill[]>) => {
      state.bills = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchBillsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    addBill: (state, action: PayloadAction<Bill>) => {
      const newBills = [...state.bills, action.payload];
      state.bills = newBills;
      
      saveBillsData(newBills)
        .then(() => {
          // Bill saved successfully
        })
        .catch(() => {
          logger.error('Failed to save bill');
        });
    },
    updateBill: (state, action: PayloadAction<Bill>) => {
      const updatedBills = state.bills.map(bill => 
        bill.id === action.payload.id ? action.payload : bill
      );
      state.bills = updatedBills;
      
      saveBillsData(updatedBills)
        .then(() => {
          // Bill updated successfully
        })
        .catch(() => {
          logger.error('Failed to update bill');
        });
    },
    deleteBill: (state, action: PayloadAction<string>) => {
      const filteredBills = state.bills.filter(bill => bill.id !== action.payload);
      state.bills = filteredBills;
      
      saveBillsData(filteredBills)
        .then(() => {
          // Bill deleted successfully
        })
        .catch(() => {
          logger.error('Failed to delete bill');
        });
    },
    markBillAsPaid: (state, action: PayloadAction<{ id: string; isPaid: boolean }>) => {
      const updatedBills = state.bills.map(bill => 
        bill.id === action.payload.id 
          ? { ...bill, isPaid: action.payload.isPaid } 
          : bill
      );
      state.bills = updatedBills;
      
      saveBillsData(updatedBills)
        .then(() => {
          // Bill payment status updated successfully
        })
        .catch(() => {
          logger.error('Failed to update bill payment status');
        });
    },
    loadBills: (state) => {
      state.loading = true;
      getBillsData()
        .then((bills) => {
          if (bills) {
            state.bills = bills;
          }
          state.loading = false;
        })
        .catch(() => {
          state.loading = false;
          state.error = 'Failed to load bills';
          logger.error('Failed to load bills');
        });
    },
  },
});

export const { 
  fetchBillsStart,
  fetchBillsSuccess,
  fetchBillsFailure,
  addBill,
  updateBill,
  deleteBill,
  markBillAsPaid,
  loadBills,
} = billsSlice.actions;

export default billsSlice.reducer;
