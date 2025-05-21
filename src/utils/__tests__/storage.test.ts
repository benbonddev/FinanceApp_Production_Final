import {
  saveBillsData,
  savePaychecksData,
  saveBudgetData,
  saveDebtData,
  saveGoalsData,
  saveThemePreference,
  saveData, // This will be the mocked version
  STORAGE_KEYS,
} from '../storage'; // Adjust path as needed
import { logger } from '../logger'; // Adjust path

// Mock the saveData function from the same module
jest.mock('../storage', () => ({
  ...jest.requireActual('../storage'), // Import and retain original functions/constants
  saveData: jest.fn(), // Mock specific function
}));

// Mock the logger
jest.mock('../logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('Storage Utility - Save Functions Error Handling', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  // Test suite for saveBillsData
  describe('saveBillsData', () => {
    const mockBills = [{ id: '1', name: 'Test Bill', amount: 100, dueDate: '2023-01-01', isPaid: false, category: 'test', isRecurring: false }];

    it('should call saveData with correct parameters for bills', async () => {
      (saveData as jest.Mock).mockResolvedValueOnce(undefined);
      await saveBillsData(mockBills);
      expect(saveData).toHaveBeenCalledWith(STORAGE_KEYS.BILLS, mockBills);
    });

    it('should log an error and re-throw if saveData fails for bills', async () => {
      const mockError = new Error('AsyncStorage failed for bills');
      (saveData as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(saveBillsData(mockBills)).rejects.toThrow(mockError);
      expect(logger.error).toHaveBeenCalledWith('Error saving bills data:', mockError);
    });
  });

  // Test suite for savePaychecksData
  describe('savePaychecksData', () => {
    const mockPaychecks = [{ id: 'p1', name: 'Test Paycheck', amount: 2000, date: '2023-01-15', isRecurring: true, owner: 'user' }];

    it('should call saveData with correct parameters for paychecks', async () => {
      (saveData as jest.Mock).mockResolvedValueOnce(undefined);
      await savePaychecksData(mockPaychecks);
      expect(saveData).toHaveBeenCalledWith(STORAGE_KEYS.PAYCHECKS, mockPaychecks);
    });

    it('should log an error and re-throw if saveData fails for paychecks', async () => {
      const mockError = new Error('AsyncStorage failed for paychecks');
      (saveData as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(savePaychecksData(mockPaychecks)).rejects.toThrow(mockError);
      expect(logger.error).toHaveBeenCalledWith('Error saving paychecks data:', mockError);
    });
  });

  // Test suite for saveBudgetData
  describe('saveBudgetData', () => {
    const mockBudgets = [{ id: 'b1', category: 'Groceries', limit: 300, spent: 150, period: 'monthly' as const }];

    it('should call saveData with correct parameters for budgets', async () => {
      (saveData as jest.Mock).mockResolvedValueOnce(undefined);
      await saveBudgetData(mockBudgets);
      expect(saveData).toHaveBeenCalledWith(STORAGE_KEYS.BUDGETS, mockBudgets);
    });

    it('should log an error and re-throw if saveData fails for budgets', async () => {
      const mockError = new Error('AsyncStorage failed for budgets');
      (saveData as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(saveBudgetData(mockBudgets)).rejects.toThrow(mockError);
      expect(logger.error).toHaveBeenCalledWith('Error saving budget data:', mockError);
    });
  });

  // Test suite for saveDebtData
  describe('saveDebtData', () => {
    const mockDebts = [{ id: 'd1', name: 'Credit Card', initialAmount: 5000, currentBalance: 4500, interestRate: 19.9, minimumPayment: 100, dueDate: 1, category: 'credit_card' as const }];

    it('should call saveData with correct parameters for debts', async () => {
      (saveData as jest.Mock).mockResolvedValueOnce(undefined);
      await saveDebtData(mockDebts);
      expect(saveData).toHaveBeenCalledWith(STORAGE_KEYS.DEBTS, mockDebts);
    });

    it('should log an error and re-throw if saveData fails for debts', async () => {
      const mockError = new Error('AsyncStorage failed for debts');
      (saveData as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(saveDebtData(mockDebts)).rejects.toThrow(mockError);
      expect(logger.error).toHaveBeenCalledWith('Error saving debt data:', mockError);
    });
  });

  // Test suite for saveGoalsData
  describe('saveGoalsData', () => {
    const mockGoals = [{ id: 'g1', name: 'Vacation', type: 'travel' as const, targetAmount: 2000, currentAmount: 500, targetDate: '2024-12-31', isRecurring: false, priority: 'medium' as const }];

    it('should call saveData with correct parameters for goals', async () => {
      (saveData as jest.Mock).mockResolvedValueOnce(undefined);
      await saveGoalsData(mockGoals);
      expect(saveData).toHaveBeenCalledWith(STORAGE_KEYS.GOALS, mockGoals);
    });

    it('should log an error and re-throw if saveData fails for goals', async () => {
      const mockError = new Error('AsyncStorage failed for goals');
      (saveData as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(saveGoalsData(mockGoals)).rejects.toThrow(mockError);
      expect(logger.error).toHaveBeenCalledWith('Error saving goals data:', mockError);
    });
  });

  // Test suite for saveThemePreference
  // Note: The original saveThemePreference in storage.ts takes a string.
  // If the intention was to save a ThemeState object, the function in storage.ts might need adjustment,
  // or this test needs to reflect that it saves a string.
  // Based on the previous refactoring of themeSlice, saveThemePreferenceObject was introduced
  // which saves an object. The original saveThemePreference in storage.ts saves a string.
  // The subtask is to test the functions in storage.ts as they are.
  describe('saveThemePreference', () => {
    const mockThemePreference = 'dark'; // Assuming it saves a string theme name or mode

    it('should call saveData with correct parameters for theme preference', async () => {
      (saveData as jest.Mock).mockResolvedValueOnce(undefined);
      await saveThemePreference(mockThemePreference);
      expect(saveData).toHaveBeenCalledWith(STORAGE_KEYS.THEME, mockThemePreference);
    });

    it('should log an error and re-throw if saveData fails for theme preference', async () => {
      const mockError = new Error('AsyncStorage failed for theme preference');
      (saveData as jest.Mock).mockRejectedValueOnce(mockError);

      await expect(saveThemePreference(mockThemePreference)).rejects.toThrow(mockError);
      expect(logger.error).toHaveBeenCalledWith('Error saving theme preference:', mockError);
    });
  });
});
