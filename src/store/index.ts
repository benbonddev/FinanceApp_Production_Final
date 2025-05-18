import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import themeReducer from './slices/themeSlice';
import billsReducer from './slices/billsSlice';
import paychecksReducer from './slices/paychecksSlice';
import budgetReducer from './slices/budgetSlice';
import debtReducer from './slices/debtSlice';
import goalsReducer from './slices/goalsSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['theme', 'bills', 'paychecks', 'budget', 'debt', 'goals'],
};

const rootReducer = combineReducers({
  theme: themeReducer,
  bills: billsReducer,
  paychecks: paychecksReducer,
  budget: budgetReducer,
  debt: debtReducer,
  goals: goalsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
