import { DefaultTheme, DarkTheme as PaperDarkTheme, MD3Theme } from 'react-native-paper';
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { CustomTheme } from '../types';

// Create separate navigation themes
const navigationLightTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: '#6200ee',
    background: '#f6f6f6',
    card: '#ffffff',
    text: '#000000',
    border: '#e0e0e0',
    notification: '#f50057',
  }
};

const navigationDarkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: '#BB86FC',
    background: '#121212',
    card: '#1e1e1e',
    text: '#ffffff',
    border: '#2c2c2c',
    notification: '#f50057',
  }
};

// Create separate paper themes
const paperLightTheme: MD3Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    primaryContainer: '#e9ddff',
    secondary: '#03dac4',
    secondaryContainer: '#c8f4f0',
    background: '#f6f6f6',
    surface: '#ffffff',
    error: '#B00020',
    errorContainer: '#ffdad6',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#21005d',
    onSecondary: '#000000',
    onSecondaryContainer: '#00413e',
    onBackground: '#000000',
    onSurface: '#000000',
    onError: '#ffffff',
    onErrorContainer: '#410002',
    surfaceVariant: '#f2f2f2',
    onSurfaceVariant: '#757575',
    outline: '#757575',
    outlineVariant: '#c1c1c1',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#303030',
    inverseOnSurface: '#f5f5f5',
    inversePrimary: '#d0bcff',
    elevation: {
      level0: 'transparent',
      level1: '#f5f5f5',
      level2: '#eeeeee',
      level3: '#e6e6e6',
      level4: '#dfdfdf',
      level5: '#d9d9d9',
    },
    surfaceDisabled: 'rgba(0, 0, 0, 0.12)',
    onSurfaceDisabled: 'rgba(0, 0, 0, 0.38)',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    success: '#4CAF50',
    warning: '#FFC107',
    border: '#e0e0e0',
    accent: '#03dac4',
    notification: '#f50057',
    info: '#2196F3',
  },
  roundness: 8,
  animation: {
    scale: 1.0,
  },
};

const paperDarkTheme: MD3Theme = {
  ...PaperDarkTheme,
  colors: {
    ...PaperDarkTheme.colors,
    primary: '#BB86FC',
    primaryContainer: '#4e3c74',
    secondary: '#03dac4',
    secondaryContainer: '#00413e',
    background: '#121212',
    surface: '#1e1e1e',
    error: '#CF6679',
    errorContainer: '#8c0009',
    onPrimary: '#000000',
    onPrimaryContainer: '#e9ddff',
    onSecondary: '#000000',
    onSecondaryContainer: '#c8f4f0',
    onBackground: '#ffffff',
    onSurface: '#ffffff',
    onError: '#000000',
    onErrorContainer: '#ffdad6',
    surfaceVariant: '#2c2c2c',
    onSurfaceVariant: '#bbbbbb',
    outline: '#9e9e9e',
    outlineVariant: '#444444',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#f5f5f5',
    inverseOnSurface: '#303030',
    inversePrimary: '#6200ee',
    elevation: {
      level0: 'transparent',
      level1: '#232323',
      level2: '#282828',
      level3: '#2c2c2c',
      level4: '#323232',
      level5: '#383838',
    },
    surfaceDisabled: 'rgba(255, 255, 255, 0.12)',
    onSurfaceDisabled: 'rgba(255, 255, 255, 0.38)',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    success: '#4CAF50',
    warning: '#FFC107',
    border: '#2c2c2c',
    accent: '#70efde', // Adjusted for dark theme
    notification: '#ff80ab', // Adjusted for dark theme
    info: '#64b5f6',
  },
  roundness: 8,
  animation: {
    scale: 1.0,
  },
};

// Create fallback themes in case custom themes fail to load
const fallbackLightTheme: CustomTheme = {
  ...DefaultTheme,
  ...NavigationDefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    ...NavigationDefaultTheme.colors,
    primary: '#6200ee',
    accent: '#03dac4',
    background: '#f6f6f6',
    surface: '#ffffff',
    text: '#000000',
    error: '#B00020',
    success: '#4CAF50',
    warning: '#FFC107',
    notification: '#f50057',
    info: '#2196F3', // Added info
    card: '#ffffff',
    border: '#e0e0e0',
    outline: '#757575',
    onSurfaceVariant: '#757575',
  },
  roundness: 8,
  animation: {
    scale: 1.0,
  },
};

const fallbackDarkTheme: CustomTheme = {
  ...PaperDarkTheme,
  ...NavigationDarkTheme,
  colors: {
    ...PaperDarkTheme.colors,
    ...NavigationDarkTheme.colors,
    primary: '#BB86FC',
    accent: '#03dac4',
    background: '#121212',
    surface: '#1e1e1e',
    text: '#ffffff',
    error: '#CF6679',
    success: '#4CAF50',
    warning: '#FFC107',
    notification: '#ff80ab', // Adjusted for dark theme
    info: '#64b5f6', // Added info
    card: '#1e1e1e',
    border: '#2c2c2c',
    outline: '#9e9e9e',
    onSurfaceVariant: '#bbbbbb',
  },
  roundness: 8,
  animation: {
    scale: 1.0,
  },
};

// Create custom light theme with proper type extension and separate navigation/paper themes
export const lightTheme: CustomTheme = {
  ...navigationLightTheme,
  ...paperLightTheme,
  colors: {
    ...navigationLightTheme.colors,
    ...paperLightTheme.colors,
    primary: '#6200ee',
    accent: '#03dac4',
    background: '#f6f6f6',
    surface: '#ffffff',
    text: '#000000',
    error: '#B00020',
    success: '#4CAF50',
    warning: '#FFC107',
    notification: '#f50057', // Sourced from paperLightTheme
    info: '#2196F3', // Added info
    card: '#ffffff',
    border: '#e0e0e0',
    outline: '#757575',
    onSurfaceVariant: '#757575',
  },
  roundness: 8,
  animation: {
    scale: 1.0,
  },
};

// Create custom dark theme with proper type extension and separate navigation/paper themes
export const darkTheme: CustomTheme = {
  ...navigationDarkTheme,
  ...paperDarkTheme,
  colors: {
    ...navigationDarkTheme.colors,
    ...paperDarkTheme.colors,
    primary: '#BB86FC',
    accent: '#03dac4',
    background: '#121212',
    surface: '#1e1e1e',
    text: '#ffffff',
    error: '#CF6679',
    success: '#4CAF50',
    warning: '#FFC107',
    notification: '#ff80ab', // Sourced from paperDarkTheme (adjusted)
    info: '#64b5f6', // Added info
    card: '#1e1e1e',
    border: '#2c2c2c',
    outline: '#9e9e9e',
    onSurfaceVariant: '#bbbbbb',
  },
  roundness: 8,
  animation: {
    scale: 1.0,
  },
};

// Common spacing values for consistent layout
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Common border radius values
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

// Common font sizes
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Common shadow styles
export const shadows = {
  light: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
  dark: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.4,
      shadowRadius: 1.41,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.43,
      shadowRadius: 2.62,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
};

// Common layout styles
export const layout = {
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  spaceAround: {
    justifyContent: 'space-around',
  },
  flexStart: {
    justifyContent: 'flex-start',
  },
  flexEnd: {
    justifyContent: 'flex-end',
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  fullWidth: {
    width: '100%',
  },
  fullHeight: {
    height: '100%',
  },
};

// Export fallback themes
export { fallbackLightTheme, fallbackDarkTheme };
