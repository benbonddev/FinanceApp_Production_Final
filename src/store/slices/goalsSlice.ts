import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getGoalsData, saveGoalsData } from '../../utils/storage';
import { Goal } from '../../types';
import { logger } from '../../utils/logger';

interface GoalsState {
  goals: Goal[];
  loading: boolean;
  error: string | null;
}

const initialState: GoalsState = {
  goals: [],
  loading: false,
  error: null,
};

export const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    fetchGoalsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchGoalsSuccess: (state, action: PayloadAction<Goal[]>) => {
      state.goals = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchGoalsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    addGoal: (state, action: PayloadAction<Goal>) => {
      const newGoals = [...state.goals, action.payload];
      state.goals = newGoals;
      
      saveGoalsData(newGoals)
        .then(() => {
          // Goal saved successfully
        })
        .catch(() => {
          logger.error('Failed to save goal');
        });
    },
    updateGoal: (state, action: PayloadAction<Goal>) => {
      const updatedGoals = state.goals.map(goal => 
        goal.id === action.payload.id ? action.payload : goal
      );
      state.goals = updatedGoals;
      
      saveGoalsData(updatedGoals)
        .then(() => {
          // Goal updated successfully
        })
        .catch(() => {
          logger.error('Failed to update goal');
        });
    },
    deleteGoal: (state, action: PayloadAction<string>) => {
      const filteredGoals = state.goals.filter(goal => goal.id !== action.payload);
      state.goals = filteredGoals;
      
      saveGoalsData(filteredGoals)
        .then(() => {
          // Goal deleted successfully
        })
        .catch(() => {
          logger.error('Failed to delete goal');
        });
    },
    updateGoalProgress: (state, action: PayloadAction<{ id: string; currentAmount: number }>) => {
      const updatedGoals = state.goals.map(goal => 
        goal.id === action.payload.id 
          ? { ...goal, currentAmount: action.payload.currentAmount } 
          : goal
      );
      state.goals = updatedGoals;
      
      saveGoalsData(updatedGoals)
        .then(() => {
          // Goal progress updated successfully
        })
        .catch(() => {
          logger.error('Failed to update goal progress');
        });
    },
    loadGoals: (state) => {
      state.loading = true;
      getGoalsData()
        .then((goals) => {
          if (goals) {
            state.goals = goals;
          }
          state.loading = false;
        })
        .catch(() => {
          state.loading = false;
          state.error = 'Failed to load goals';
          logger.error('Failed to load goals');
        });
    },
  },
});

export const { 
  fetchGoalsStart,
  fetchGoalsSuccess,
  fetchGoalsFailure,
  addGoal,
  updateGoal,
  deleteGoal,
  updateGoalProgress,
  loadGoals,
} = goalsSlice.actions;

export default goalsSlice.reducer;
