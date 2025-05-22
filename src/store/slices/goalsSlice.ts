import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { getGoalsData, saveGoalsData } from '../../utils/storage';
import { Goal } from '../../types';
import { logger } from '../../utils/logger';
import { RootState } from '../index';
import { v4 as uuidv4 } from 'react-native-uuid';

interface GoalsState {
  goals: Goal[];
  loading: boolean;
  isSaving: boolean;
  error: string | null;
}

const initialState: GoalsState = {
  goals: [],
  loading: false,
  isSaving: false,
  error: null,
};

// Async Thunks
export const loadGoalsAsync = createAsyncThunk<Goal[], void, { rejectValue: string }>(
  'goals/loadGoals',
  async (_, thunkAPI) => {
    try {
      const goals = await getGoalsData();
      return goals || [];
    } catch (error: any) {
      logger.error('Failed to load goals:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to load goals');
    }
  }
);

// Type for goal data before ID is assigned
type NewGoalData = Omit<Goal, 'id'>;

export const addGoalAsync = createAsyncThunk<Goal, NewGoalData, { state: RootState; rejectValue: string }>(
  'goals/addGoal',
  async (goalData, thunkAPI) => {
    try {
      const goalWithId: Goal = {
        ...goalData,
        id: uuidv4() as string,
        // Initialize currentAmount and contributionHistory if not part of goalData or should be defaulted
        currentAmount: goalData.currentAmount !== undefined ? goalData.currentAmount : 0,
        contributionHistory: goalData.contributionHistory !== undefined ? goalData.contributionHistory : [],
      };
      const currentGoals = thunkAPI.getState().goals.goals;
      const newGoalsArray = [...currentGoals, goalWithId];
      await saveGoalsData(newGoalsArray);
      return goalWithId;
    } catch (error: any) {
      logger.error('Failed to save goal:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to save goal');
    }
  }
);

export const updateGoalAsync = createAsyncThunk<Goal, Goal, { state: RootState; rejectValue: string }>(
  'goals/updateGoal',
  async (updatedGoal, thunkAPI) => {
    try {
      const currentGoals = thunkAPI.getState().goals.goals;
      const newGoalsArray = currentGoals.map(goal =>
        goal.id === updatedGoal.id ? updatedGoal : goal
      );
      await saveGoalsData(newGoalsArray);
      return updatedGoal;
    } catch (error: any) {
      logger.error('Failed to update goal:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to update goal');
    }
  }
);

export const deleteGoalAsync = createAsyncThunk<string, string, { state: RootState; rejectValue: string }>(
  'goals/deleteGoal',
  async (goalId, thunkAPI) => {
    try {
      const currentGoals = thunkAPI.getState().goals.goals;
      const newGoalsArray = currentGoals.filter(goal => goal.id !== goalId);
      await saveGoalsData(newGoalsArray);
      return goalId;
    } catch (error: any) {
      logger.error('Failed to delete goal:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to delete goal');
    }
  }
);

export const updateGoalProgressAsync = createAsyncThunk<
  { id: string; currentAmount: number },
  { id: string; currentAmount: number },
  { state: RootState; rejectValue: string }
>(
  'goals/updateGoalProgress',
  async (payload, thunkAPI) => {
    try {
      const currentGoals = thunkAPI.getState().goals.goals;
      const newGoalsArray = currentGoals.map(goal =>
        goal.id === payload.id ? { ...goal, currentAmount: payload.currentAmount } : goal
      );
      await saveGoalsData(newGoalsArray);
      return payload;
    } catch (error: any) {
      logger.error('Failed to update goal progress:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to update goal progress');
    }
  }
);

export const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    goalAdded: (state, action: PayloadAction<Goal>) => {
      state.goals.push(action.payload);
    },
    goalUpdated: (state, action: PayloadAction<Goal>) => {
      const index = state.goals.findIndex(goal => goal.id === action.payload.id);
      if (index !== -1) {
        state.goals[index] = action.payload;
      }
    },
    goalDeleted: (state, action: PayloadAction<string>) => {
      state.goals = state.goals.filter(goal => goal.id !== action.payload);
    },
    goalProgressUpdated: (state, action: PayloadAction<{ id: string; currentAmount: number }>) => {
      const index = state.goals.findIndex(goal => goal.id === action.payload.id);
      if (index !== -1) {
        state.goals[index].currentAmount = action.payload.currentAmount;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Load Goals
      .addCase(loadGoalsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadGoalsAsync.fulfilled, (state, action: PayloadAction<Goal[]>) => {
        state.goals = action.payload;
        state.loading = false;
      })
      .addCase(loadGoalsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load goals';
      })
      // Add Goal
      .addCase(addGoalAsync.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(addGoalAsync.fulfilled, (state, action: PayloadAction<Goal>) => {
        goalsSlice.caseReducers.goalAdded(state, action);
        state.isSaving = false;
      })
      .addCase(addGoalAsync.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload || 'Failed to save goal';
      })
      // Update Goal
      .addCase(updateGoalAsync.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateGoalAsync.fulfilled, (state, action: PayloadAction<Goal>) => {
        goalsSlice.caseReducers.goalUpdated(state, action);
        state.isSaving = false;
      })
      .addCase(updateGoalAsync.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload || 'Failed to update goal';
      })
      // Delete Goal
      .addCase(deleteGoalAsync.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(deleteGoalAsync.fulfilled, (state, action: PayloadAction<string>) => {
        goalsSlice.caseReducers.goalDeleted(state, action);
        state.isSaving = false;
      })
      .addCase(deleteGoalAsync.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload || 'Failed to delete goal';
      })
      // Update Goal Progress
      .addCase(updateGoalProgressAsync.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateGoalProgressAsync.fulfilled, (state, action: PayloadAction<{ id: string; currentAmount: number }>) => {
        goalsSlice.caseReducers.goalProgressUpdated(state, action);
        state.isSaving = false;
      })
      .addCase(updateGoalProgressAsync.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload || 'Failed to update goal progress';
      });
  },
});

export const {
  goalAdded,
  goalUpdated,
  goalDeleted,
  goalProgressUpdated,
} = goalsSlice.actions;

export default goalsSlice.reducer;
