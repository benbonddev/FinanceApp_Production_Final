# Finance App Developer Guide

## Project Overview
The Finance App is a comprehensive personal finance management application built with React Native and Expo. It provides users with tools to track expenses, manage budgets, monitor debt, set financial goals, and analyze their financial health.

## Project Structure
```
FinanceApp_Production/
├── assets/                 # Static assets like images and fonts
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Form/           # Form input components
│   │   ├── List/           # List and list item components
│   │   └── Progress/       # Progress indicators
│   ├── hooks/              # Custom React hooks
│   ├── navigation/         # Navigation configuration
│   ├── screens/            # Screen components
│   │   ├── Bill/           # Bill management screens
│   │   ├── Budget/         # Budget management screens
│   │   ├── Dashboard/      # Main dashboard screen
│   │   ├── Debt/           # Debt management screens
│   │   ├── Goals/          # Financial goals screens
│   │   ├── Month/          # Monthly overview screen
│   │   ├── Notifications/  # Notifications screen
│   │   ├── Payment/        # Payment history screens
│   │   ├── Paychecks/      # Paycheck management screens
│   │   ├── Settings/       # App settings screens
│   │   └── Test/           # Test screens
│   ├── store/              # Redux store configuration
│   │   └── slices/         # Redux slices for state management
│   ├── theme/              # Theme configuration
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── test/                   # Test components and utilities
└── docs/                   # Documentation
```

## Technology Stack
- **React Native**: Core framework for building the mobile app
- **Expo**: Development platform for React Native
- **TypeScript**: For type-safe code
- **Redux Toolkit**: For state management
- **React Navigation**: For screen navigation
- **React Native Paper**: UI component library
- **Victory Native**: For data visualization and charts
- **Formik & Yup**: For form handling and validation
- **AsyncStorage**: For local data persistence

## Development Setup
1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npx expo start
   ```

3. Run on specific platforms:
   ```
   npx expo start --android
   npx expo start --ios
   npx expo start --web
   ```

## State Management
The app uses Redux Toolkit for state management with the following slices:
- `billsSlice`: Manages bill data and operations
- `budgetSlice`: Manages budget categories and allocations
- `debtSlice`: Manages debt accounts and payments
- `goalsSlice`: Manages financial goals and progress
- `paychecksSlice`: Manages income sources and paychecks
- `themeSlice`: Manages app theme preferences

## Data Persistence
Data is persisted locally using AsyncStorage with the following key structures:
- `bills_data`: Array of bill objects
- `budget_data`: Array of budget category objects
- `debt_data`: Array of debt account objects
- `goals_data`: Array of financial goal objects
- `paychecks_data`: Array of paycheck objects
- `theme_preference`: Theme settings object

## Navigation Structure
The app uses a combination of stack and tab navigators:
- `AppNavigator`: Root navigator that handles authentication state
- `HomeNavigator`: Bottom tab navigator for main app sections
- `BillsNavigator`: Stack navigator for bill management screens
- `BudgetNavigator`: Stack navigator for budget management screens
- `DebtNavigator`: Stack navigator for debt management screens
- `GoalsNavigator`: Stack navigator for goals management screens
- `PaychecksNavigator`: Stack navigator for paycheck management screens
- `SettingsNavigator`: Stack navigator for settings screens

## Data Visualization
The app uses Victory Native for chart visualizations:
- `VictoryPie`: For expense breakdown and budget allocation
- `VictoryLine`: For income vs expenses trends and debt payoff projections
- `VictoryBar`: For goal progress tracking
- `VictoryStack`: For comparative financial data

## Testing
The app includes test screens for verifying functionality:
- `ComponentTest`: Tests UI components
- `ChartTest`: Tests chart visualizations
- `NavigationAnalysisScreen`: Tests navigation structure
- `AppTest`: Tests overall app functionality

## Building for Production
1. Run linting checks:
   ```
   npm run lint
   ```

2. Build for all platforms:
   ```
   npx expo export
   ```

3. Build for specific platforms using EAS:
   ```
   npm run build:android
   npm run build:ios
   ```

4. Web deployment:
   - Use the files in the `dist` directory for web deployment

## Adding New Features
When adding new features:
1. Create new screen components in the appropriate directory
2. Update navigation configuration to include new screens
3. Create or update Redux slices for new data requirements
4. Add persistence handling in storage.ts if needed
5. Update types in types/index.ts
6. Add UI components in the components directory
7. Update tests to cover new functionality

## Theming
The app supports light and dark themes:
1. Theme configuration is in src/theme/theme.ts
2. Use the useTheme hook to access theme colors and properties
3. Theme preferences are stored in AsyncStorage

## Best Practices
- Use TypeScript types for all components and functions
- Follow the established project structure for new files
- Use React Native Paper components for consistent UI
- Implement proper error handling for async operations
- Use Redux for global state, local state for component-specific state
- Write meaningful comments for complex logic
- Follow the established naming conventions
