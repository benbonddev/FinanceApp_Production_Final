import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bill, Paycheck, Budget, Debt, Goal } from '../types';
import { logger } from './logger';

export const saveThemePreference = async (theme: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('themePreference', theme);
  } catch (error) {
    logger.error('Error saving theme preference:', error);
  }
};

export const getThemePreference = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('themePreference');
  } catch (error) {
    logger.error('Error getting theme preference:', error);
    return null;
  }
};

export const saveBillsData = async (bills: Bill[]): Promise<void> => {
  try {
    await AsyncStorage.setItem('bills', JSON.stringify(bills));
  } catch (error) {
    logger.error('Error saving bills data:', error);
  }
};

export const getBillsData = async (): Promise<Bill[] | null> => {
  try {
    const data = await AsyncStorage.getItem('bills');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error('Error getting bills data:', error);
    return null;
  }
};

export const savePaychecksData = async (paychecks: Paycheck[]): Promise<void> => {
  try {
    await AsyncStorage.setItem('paychecks', JSON.stringify(paychecks));
  } catch (error) {
    logger.error('Error saving paychecks data:', error);
  }
};

export const getPaychecksData = async (): Promise<Paycheck[] | null> => {
  try {
    const data = await AsyncStorage.getItem('paychecks');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error('Error getting paychecks data:', error);
    return null;
  }
};

export const saveBudgetData = async (budget: Budget[]): Promise<void> => {
  try {
    await AsyncStorage.setItem('budget', JSON.stringify(budget));
  } catch (error) {
    logger.error('Error saving budget data:', error);
  }
};

export const getBudgetData = async (): Promise<Budget[] | null> => {
  try {
    const data = await AsyncStorage.getItem('budget');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error('Error getting budget data:', error);
    return null;
  }
};

export const saveDebtData = async (debt: Debt[]): Promise<void> => {
  try {
    await AsyncStorage.setItem('debt', JSON.stringify(debt));
  } catch (error) {
    logger.error('Error saving debt data:', error);
  }
};

export const getDebtData = async (): Promise<Debt[] | null> => {
  try {
    const data = await AsyncStorage.getItem('debt');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error('Error getting debt data:', error);
    return null;
  }
};

export const saveGoalsData = async (goals: Goal[]): Promise<void> => {
  try {
    await AsyncStorage.setItem('goals', JSON.stringify(goals));
  } catch (error) {
    logger.error('Error saving goals data:', error);
  }
};

export const getGoalsData = async (): Promise<Goal[] | null> => {
  try {
    const data = await AsyncStorage.getItem('goals');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error('Error getting goals data:', error);
    return null;
  }
};

export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    logger.error('Error clearing all data:', error);
  }
};
