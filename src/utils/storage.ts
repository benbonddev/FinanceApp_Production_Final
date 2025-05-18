import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bill, Paycheck, Budget, Debt, Goal } from '../types';
import { logger } from './logger';

// Keys used to persist various pieces of app state
export const STORAGE_KEYS = {
  BILLS: 'bills',
  PAYCHECKS: 'paychecks',
  BUDGETS: 'budget',
  DEBTS: 'debt',
  GOALS: 'goals',
  SETTINGS: 'settings',
  THEME: 'themePreference',
} as const;

/**
 * Generic save function used by slices. Errors are thrown so calling code
 * can handle them if needed.
 */
export const saveData = async (key: string, data: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    logger.error(`Error saving data for key ${key}:`, error);
    throw error;
  }
};

/**
 * Generic load function that returns a default value when nothing is stored.
 */
export const loadData = async <T>(key: string, defaultValue: T): Promise<T> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue === null ? defaultValue : (JSON.parse(jsonValue) as T);
  } catch (error) {
    logger.error(`Error loading data for key ${key}:`, error);
    throw error;
  }
};

/** Remove a single entry from storage. */
export const clearData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    logger.error(`Error clearing data for key ${key}:`, error);
    throw error;
  }
};

/** Wipe all persisted state used by the app. */
export const clearAllData = async (): Promise<void> => {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    logger.error('Error clearing all data:', error);
    throw error;
  }
};

/**
 * Export all stored data as a JSON string. Useful for backup functionality.
 */
export const exportData = async (): Promise<string | null> => {
  try {
    const exportObject: Record<string, any> = {};
    for (const key of Object.values(STORAGE_KEYS)) {
      const data = await AsyncStorage.getItem(key);
      if (data) {
        exportObject[key] = JSON.parse(data);
      }
    }
    return JSON.stringify(exportObject);
  } catch (error) {
    logger.error('Error exporting data:', error);
    throw error;
  }
};

/**
 * Import data previously exported by {@link exportData}.
 */
export const importData = async (jsonData: string): Promise<void> => {
  try {
    const importObject = JSON.parse(jsonData);
    for (const key of Object.keys(importObject)) {
      if (Object.values(STORAGE_KEYS).includes(key as any)) {
        await AsyncStorage.setItem(key, JSON.stringify(importObject[key]));
      }
    }
  } catch (error) {
    logger.error('Error importing data:', error);
    throw error;
  }
};

export const saveThemePreference = async (theme: string): Promise<void> => {
  try {
    await saveData(STORAGE_KEYS.THEME, theme);
  } catch (error) {
    logger.error('Error saving theme preference:', error);
  }
};

export const getThemePreference = async (): Promise<string | null> => {
  try {
    return await loadData<string | null>(STORAGE_KEYS.THEME, null);
  } catch (error) {
    logger.error('Error getting theme preference:', error);
    return null;
  }
};

export const saveBillsData = async (bills: Bill[]): Promise<void> => {
  try {
    await saveData(STORAGE_KEYS.BILLS, bills);
  } catch (error) {
    logger.error('Error saving bills data:', error);
  }
};

export const getBillsData = async (): Promise<Bill[] | null> => {
  try {
    return await loadData<Bill[]>(STORAGE_KEYS.BILLS, []);
  } catch (error) {
    logger.error('Error getting bills data:', error);
    return null;
  }
};

export const savePaychecksData = async (paychecks: Paycheck[]): Promise<void> => {
  try {
    await saveData(STORAGE_KEYS.PAYCHECKS, paychecks);
  } catch (error) {
    logger.error('Error saving paychecks data:', error);
  }
};

export const getPaychecksData = async (): Promise<Paycheck[] | null> => {
  try {
    return await loadData<Paycheck[]>(STORAGE_KEYS.PAYCHECKS, []);
  } catch (error) {
    logger.error('Error getting paychecks data:', error);
    return null;
  }
};

export const saveBudgetData = async (budget: Budget[]): Promise<void> => {
  try {
    await saveData(STORAGE_KEYS.BUDGETS, budget);
  } catch (error) {
    logger.error('Error saving budget data:', error);
  }
};

export const getBudgetData = async (): Promise<Budget[] | null> => {
  try {
    return await loadData<Budget[]>(STORAGE_KEYS.BUDGETS, []);
  } catch (error) {
    logger.error('Error getting budget data:', error);
    return null;
  }
};

export const saveDebtData = async (debt: Debt[]): Promise<void> => {
  try {
    await saveData(STORAGE_KEYS.DEBTS, debt);
  } catch (error) {
    logger.error('Error saving debt data:', error);
  }
};

export const getDebtData = async (): Promise<Debt[] | null> => {
  try {
    return await loadData<Debt[]>(STORAGE_KEYS.DEBTS, []);
  } catch (error) {
    logger.error('Error getting debt data:', error);
    return null;
  }
};

export const saveGoalsData = async (goals: Goal[]): Promise<void> => {
  try {
    await saveData(STORAGE_KEYS.GOALS, goals);
  } catch (error) {
    logger.error('Error saving goals data:', error);
  }
};

export const getGoalsData = async (): Promise<Goal[] | null> => {
  try {
    return await loadData<Goal[]>(STORAGE_KEYS.GOALS, []);
  } catch (error) {
    logger.error('Error getting goals data:', error);
    return null;
  }
};

// Deprecated export kept for backwards compatibility
// Calls the enhanced clearAllData implementation above
export const legacyClearAllData = async (): Promise<void> => {
  try {
    await clearAllData();
  } catch (error) {
    // error already logged in clearAllData
  }
};
