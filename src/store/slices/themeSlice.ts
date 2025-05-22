import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { getThemePreference, saveThemePreference, STORAGE_KEYS, loadData, saveData } from '../../utils/storage';
import { logger } from '../../utils/logger';
import { RootState } from '../index';

interface ThemeState {
  isDarkMode: boolean;
  notificationLevel: string;
  defaultView: string;
  currency: string; // Added currency
  loading: boolean;
  isSaving: boolean;
  error: string | null;
}

const initialState: ThemeState = {
  isDarkMode: false,
  notificationLevel: 'normal',
  defaultView: 'month',
  currency: 'USD', // Default currency
  loading: false,
  isSaving: false,
  error: null,
};

// Redefine saveThemePreference and getThemePreference to work with ThemeState object
// This aligns with how the original setTheme reducer was using it.
const saveThemePreferenceObject = async (themeState: ThemeState): Promise<void> => {
  await saveData(STORAGE_KEYS.THEME, themeState); // saveData already stringifies
};

const getThemePreferenceObject = async (): Promise<ThemeState | null> => {
  return await loadData<ThemeState | null>(STORAGE_KEYS.THEME, null);
};


export const loadThemeAsync = createAsyncThunk<
  ThemeState, // Return type: the full theme state
  void,
  { rejectValue: string }
>(
  'theme/loadTheme',
  async (_, thunkAPI) => {
    try {
      const preference = await getThemePreferenceObject();
      // If no preference is found (e.g., first launch), return the initial state.
      // Otherwise, merge preference with initial state to ensure all keys are present.
      return preference ? { ...initialState, ...preference, loading: false, isSaving: false, error: null } : { ...initialState, loading: false, isSaving: false, error: null };
    } catch (error: any) {
      logger.error('Failed to load theme preference:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to load theme preference');
    }
  }
);

export const saveThemeAsync = createAsyncThunk<
  ThemeState, // Return type: the new theme state
  Partial<ThemeState>, // Argument type: settings to update
  { state: RootState; rejectValue: string }
>(
  'theme/saveTheme',
  async (themeSettings, thunkAPI) => {
    const currentThemeState = thunkAPI.getState().theme;
    // Create the new state by merging current state with incoming settings
    // Ensure status fields are handled correctly and not persisted if they are part of themeSettings
    const { loading, isSaving, error, ...currentSettings } = currentThemeState;
    const newSettingsToSave = { ...currentSettings, ...themeSettings };

    // Construct the full new state including operational fields, but don't save these operational fields
    const newStateForApp = {
        ...currentThemeState, // preserve existing loading, isSaving, error
        ...themeSettings, // apply incoming changes
    };

    try {
      // Save only the actual theme settings, not operational state like loading/error
      await saveThemePreferenceObject(newSettingsToSave as ThemeState);
      return newStateForApp; // Return the full new state for the app, including operational fields
    } catch (error: any) {
      logger.error('Failed to save theme preference:', error);
      return thunkAPI.rejectWithValue(error.message || 'Failed to save theme preference');
    }
  }
);

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    // Synchronous reducers can be added here if needed for other direct state manipulations
    // For example, if a part of the theme could be changed without saving.
  },
  extraReducers: (builder) => {
    builder
      // Load Theme
      .addCase(loadThemeAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadThemeAsync.fulfilled, (state, action: PayloadAction<ThemeState>) => {
        // Object.assign(state, action.payload);
        // Ensure all parts of the state are updated correctly
        state.isDarkMode = action.payload.isDarkMode;
        state.notificationLevel = action.payload.notificationLevel;
        state.defaultView = action.payload.defaultView;
        state.currency = action.payload.currency; // Load currency
        state.loading = false;
      })
      .addCase(loadThemeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load theme';
        // Optionally, ensure state is reset to initial or a safe default
        Object.assign(state, { ...initialState, loading: false, error: action.payload || 'Failed to load theme' });
      })
      // Save Theme
      .addCase(saveThemeAsync.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(saveThemeAsync.fulfilled, (state, action: PayloadAction<ThemeState>) => {
        // Update state with the successfully saved theme settings
        state.isDarkMode = action.payload.isDarkMode;
        state.notificationLevel = action.payload.notificationLevel;
        state.defaultView = action.payload.defaultView;
        state.currency = action.payload.currency; // Save currency
        state.isSaving = false;
      })
      .addCase(saveThemeAsync.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload || 'Failed to save theme';
      });
  },
});

// Export any synchronous actions if defined in reducers:
// export const { /* your synchronous actions */ } = themeSlice.actions;

export default themeSlice.reducer;
