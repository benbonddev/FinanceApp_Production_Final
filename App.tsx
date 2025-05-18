import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { loadBillsAsync } from './src/store/slices/billsSlice';
import { loadPaychecksAsync } from './src/store/slices/paychecksSlice';
import { loadThemeAsync } from './src/store/slices/themeSlice';
import AppProvider from './src/navigation/AppProvider';

const App: React.FC = () => {
  // Load data from storage when app starts
  useEffect(() => {
    // Dispatch async actions to load data from storage
    store.dispatch(loadThemeAsync());
    store.dispatch(loadBillsAsync());
    store.dispatch(loadPaychecksAsync());
  }, []);

  return (
    <Provider store={store}>
      <AppProvider />
    </Provider>
  );
};

export default App;
