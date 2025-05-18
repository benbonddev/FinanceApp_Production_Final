import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getThemePreference, saveThemePreference } from '../../utils/storage';
import { logger } from '../../utils/logger';

interface ThemeState {
  isDarkMode: boolean;
  notificationLevel: string;
  defaultView: string;
}

const initialState: ThemeState = {
  isDarkMode: false,
  notificationLevel: 'normal',
  defaultView: 'month',
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Partial<ThemeState>>) => {
      const newState = { ...state, ...action.payload };
      saveThemePreference(newState)
        .then(() => {
          // Theme preference saved successfully
        })
        .catch(() => {
          // Handle error saving theme preference
          logger.error('Failed to save theme preference');
        });
      return newState;
    },
    loadTheme: (state) => {
      getThemePreference()
        .then((preference) => {
          if (preference) {
            Object.assign(state, preference);
          }
        })
        .catch(() => {
          // Handle error loading theme preference
          logger.error('Failed to load theme preference');
        });
    },
  },
});

export const { setTheme, loadTheme } = themeSlice.actions;

export default themeSlice.reducer;
