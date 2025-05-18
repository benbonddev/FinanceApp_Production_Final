import React, { useEffect } from 'react';
import { useColorScheme, StyleSheet } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAppSelector, useAppDispatch } from '../hooks/reduxHooks';
import { setDarkMode } from '../store/slices/themeSlice';
import { lightTheme, darkTheme } from '../theme';
import AppNavigator from './AppNavigator';

const AppProvider: React.FC = () => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector(state => state.theme.isDarkMode);
  const colorScheme = useColorScheme();
  
  // Set initial theme based on device settings
  useEffect(() => {
    dispatch(setDarkMode(colorScheme === 'dark'));
  }, [colorScheme, dispatch]);
  
  // Select theme based on state
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  return (
    <GestureHandlerRootView style={styles.container}>
      <PaperProvider theme={theme}>
        <NavigationContainer theme={theme}>
          <AppNavigator />
        </NavigationContainer>
      </PaperProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});

export default AppProvider;
