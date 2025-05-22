import React, { useState } from 'react';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Share, Alert } from 'react-native';
import { Button, Card, Divider, List, Switch, Text, useTheme, TextInput as PaperTextInput } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState, AppDispatch } from '../../store'; // Import AppDispatch
import { saveThemeAsync, loadThemeAsync } from '../../store/slices/themeSlice'; // Assuming themeSlice is refactored
import ListItem from '../../components/List/ListItem';
import CustomModal from '../../components/Modal/Modal'; // Aliasing for clarity
import { exportData, importData, clearAllData } from '../../utils/storage'; // Import clearAllData
import { logger } from '../../utils/logger';
import { loadBillsAsync } from '../../store/slices/billsSlice';
import { loadBudgetsAsync } from '../../store/slices/budgetSlice';
import { loadDebtsAsync } from '../../store/slices/debtSlice';
import { loadGoalsAsync } from '../../store/slices/goalsSlice';
import { loadPaychecksAsync } from '../../store/slices/paychecksSlice';


const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>(); // Use AppDispatch
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const notificationLevel = useSelector((state: RootState) => state.theme.notificationLevel);
  const defaultView = useSelector((state: RootState) => state.theme.defaultView);
  const currentCurrency = useSelector((state: RootState) => state.theme.currency); // Get current currency
  
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showDefaultViewModal, setShowDefaultViewModal] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [isCurrencyModalVisible, setIsCurrencyModalVisible] = useState(false); // State for currency modal
  const [jsonInput, setJsonInput] = useState('');

  const availableCurrencies = [
    { label: 'USD - US Dollar', value: 'USD' },
    { label: 'EUR - Euro', value: 'EUR' },
    { label: 'GBP - British Pound', value: 'GBP' },
    { label: 'JPY - Japanese Yen', value: 'JPY' },
    { label: 'CAD - Canadian Dollar', value: 'CAD' },
    { label: 'AUD - Australian Dollar', value: 'AUD' },
  ];
  
  const handleThemeChange = () => {
    // Assuming themeSlice is refactored to use saveThemeAsync
    dispatch(saveThemeAsync({ isDarkMode: !isDarkMode }));
  };
  
  const handleNotificationLevelChange = (level: string) => {
    dispatch(saveThemeAsync({ notificationLevel: level }));
    setShowNotificationModal(false);
  };
  
  const handleDefaultViewChange = (view: string) => {
    dispatch(saveThemeAsync({ defaultView: view }));
    setShowDefaultViewModal(false);
  };

  const handleCurrencyChange = (currencyCode: string) => {
    dispatch(saveThemeAsync({ currency: currencyCode }));
    setIsCurrencyModalVisible(false);
  };
  
  const handleExportData = async () => {
    try {
      const jsonData = await exportData();
      if (jsonData) {
        try {
          const result = await Share.share({
            title: 'Finance App Data Export',
            message: jsonData,
            // (Optional) Consider using a file for very large data on iOS
            // For simplicity, direct message sharing is used here.
          });
          if (result.action === Share.sharedAction) {
            if (result.activityType) {
              logger.info(`Data shared via ${result.activityType}`);
            } else {
              logger.info('Data shared');
            }
            // Optionally, show a success alert to the user
            // Alert.alert('Success', 'Data has been prepared for sharing.');
          } else if (result.action === Share.dismissedAction) {
            logger.info('Share dismissed');
          }
        } catch (shareError: any) {
          logger.error('Error sharing data:', shareError);
          Alert.alert('Sharing Error', `Failed to share data: ${shareError.message}`);
        }
      } else {
        Alert.alert('No Data', 'There is no data to export.');
      }
    } catch (error: any) {
      logger.error('Error exporting data:', error);
      Alert.alert('Export Error', `Failed to export data: ${error.message}`);
    }
  };
  
  const handleShowImportModal = () => {
    setJsonInput('');
    setIsImportModalVisible(true);
  };

  const handleConfirmImportData = async () => {
    if (!jsonInput.trim()) {
      Alert.alert('Validation Error', 'JSON input cannot be empty.');
      return;
    }
    try {
      await importData(jsonInput);
      // Dispatch all loadAsync thunks to refresh app state
      dispatch(loadBillsAsync());
      dispatch(loadBudgetsAsync());
      dispatch(loadDebtsAsync());
      dispatch(loadGoalsAsync());
      dispatch(loadPaychecksAsync());
      dispatch(loadThemeAsync()); // Also reload theme settings if they are part of export/import

      Alert.alert('Success', 'Data imported successfully. The app state has been refreshed.');
    } catch (error: any) {
      logger.error('Failed to import data:', error);
      Alert.alert('Import Error', `Failed to import data: ${error.message}. Ensure the data is valid JSON.`);
    } finally {
      setIsImportModalVisible(false);
    }
  };
  
  const executeClearData = async () => {
    try {
      await clearAllData(); // The storage function
      // Dispatch all loadAsync thunks
      dispatch(loadBillsAsync());
      dispatch(loadBudgetsAsync());
      dispatch(loadDebtsAsync());
      dispatch(loadGoalsAsync());
      dispatch(loadPaychecksAsync());
      dispatch(loadThemeAsync()); // To reset theme to default from storage if applicable
      Alert.alert('Success', 'All data cleared successfully.');
    } catch (error) {
      logger.error('Error clearing all data:', error);
      Alert.alert('Error', 'Failed to clear data.');
    }
  };

  const handleClearData = () => { // This is called by the ListItem
    Alert.alert(
      'Clear All Data?',
      'Are you sure you want to delete all app data? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear Data',
          onPress: executeClearData, // Call the actual clearing logic
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };
  
  const handleTermsOfService = () => {
    navigation.navigate('TermsOfServiceScreen' as never);
  };
  
  const handlePrivacyPolicy = () => {
    navigation.navigate('PrivacyPolicyScreen' as never);
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Appearance</Text>
          <ListItem
            title="Dark Mode"
            description="Toggle dark mode on/off"
            rightContent={
              <Switch
                value={isDarkMode}
                onValueChange={handleThemeChange}
                color={theme.colors.primary}
              />
            }
          />
          <ListItem
            title="Theme Preview"
            description="Preview app themes"
            onPress={() => navigation.navigate('ThemePreviewScreen' as never)}
          />
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Notifications</Text>
          <ListItem
            title="Notification Level"
            description={notificationLevel === 'normal' ? 'Standard reminders' : 'Aggressive reminders'}
            rightContent={
              <Text style={{ color: theme.colors.primary }}>
                {notificationLevel === 'normal' ? 'Normal' : 'Aggressive'}
              </Text>
            }
            onPress={() => setShowNotificationModal(true)}
          />
          <ListItem
            title="Notification Settings"
            description="Configure detailed notification settings"
            onPress={() => navigation.navigate('NotificationsScreen' as never)}
          />
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>App Settings</Text>
          <ListItem
            title="Default Home View"
            description={defaultView === 'paycheck' ? 'Group bills by paycheck' : 'Group bills by month'}
            rightContent={
              <Text style={{ color: theme.colors.primary }}>
                {defaultView === 'paycheck' ? 'Paycheck' : 'Month'}
              </Text>
            }
            onPress={() => setShowDefaultViewModal(true)}
          />
          <ListItem
            title="Currency"
            description={`Current: ${currentCurrency}`}
            rightContent={
              <Text style={{ color: theme.colors.primary }}>{currentCurrency}</Text>
            }
            onPress={() => setIsCurrencyModalVisible(true)}
          />
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Data Management</Text>
          <ListItem
            title="Export Data"
            description="Export your financial data"
            onPress={handleExportData}
          />
          <ListItem
            title="Import Data"
            description="Import financial data"
            onPress={handleShowImportModal}
          />
          <ListItem
            title="Clear All Data"
            description="Delete all app data"
            onPress={handleClearData}
          />
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>About</Text>
          <ListItem
            title="Version"
            rightContent={
              <Text>1.0.2</Text>
            }
          />
          <ListItem
            title="Terms of Service"
            onPress={handleTermsOfService}
          />
          <ListItem
            title="Privacy Policy"
            onPress={handlePrivacyPolicy}
          />
        </View>
      </ScrollView>
      
      {/* Notification Level Modal */}
      <Modal
        visible={showNotificationModal}
        onDismiss={() => setShowNotificationModal(false)}
        title="Notification Level"
        actions={[
          {
            label: 'Cancel',
            onPress: () => setShowNotificationModal(false),
            mode: 'text',
          },
        ]}
      >
        <List.Item
          title="Normal"
          description="Standard reminders for due bills and important events"
          onPress={() => handleNotificationLevelChange('normal')}
          left={props => (
            <List.Icon
              {...props}
              icon={notificationLevel === 'normal' ? 'radiobox-marked' : 'radiobox-blank'}
              color={theme.colors.primary}
            />
          )}
        />
        <List.Item
          title="Aggressive"
          description="Hourly reminders when bills are due until paid, with snooze options"
          onPress={() => handleNotificationLevelChange('aggressive')}
          left={props => (
            <List.Icon
              {...props}
              icon={notificationLevel === 'aggressive' ? 'radiobox-marked' : 'radiobox-blank'}
              color={theme.colors.primary}
            />
          )}
        />
      </Modal>
      
      {/* Default View Modal */}
      <Modal
        visible={showDefaultViewModal}
        onDismiss={() => setShowDefaultViewModal(false)}
        title="Default Home View"
        actions={[
          {
            label: 'Cancel',
            onPress: () => setShowDefaultViewModal(false),
            mode: 'text',
          },
        ]}
      >
        <List.Item
          title="Paycheck View"
          description="Group bills by paycheck"
          onPress={() => handleDefaultViewChange('paycheck')}
          left={props => (
            <List.Icon
              {...props}
              icon={defaultView === 'paycheck' ? 'radiobox-marked' : 'radiobox-blank'}
              color={theme.colors.primary}
            />
          )}
        />
        <List.Item
          title="Month View"
          description="Group bills by month"
          onPress={() => handleDefaultViewChange('month')}
          left={props => (
            <List.Icon
              {...props}
              icon={defaultView === 'month' ? 'radiobox-marked' : 'radiobox-blank'}
              color={theme.colors.primary}
            />
          )}
        />
      </Modal>

      {/* Currency Selection Modal */}
      <CustomModal
        visible={isCurrencyModalVisible}
        onDismiss={() => setIsCurrencyModalVisible(false)}
        title="Select Currency"
        actions={[{ label: 'Cancel', onPress: () => setIsCurrencyModalVisible(false), mode: 'text' }]}
      >
        <ScrollView>
          {availableCurrencies.map((currency) => (
            <List.Item
              key={currency.value}
              title={currency.label}
              onPress={() => handleCurrencyChange(currency.value)}
              left={props => (
                <List.Icon
                  {...props}
                  icon={currentCurrency === currency.value ? 'radiobox-marked' : 'radiobox-blank'}
                  color={theme.colors.primary}
                />
              )}
            />
          ))}
        </ScrollView>
      </CustomModal>

      {/* Import Data Modal */}
      <CustomModal
        visible={isImportModalVisible}
        onDismiss={() => setIsImportModalVisible(false)}
        title="Import Data from JSON"
        actions={[
          {
            label: 'Cancel',
            onPress: () => setIsImportModalVisible(false),
            mode: 'outlined',
          },
          {
            label: 'Import',
            onPress: handleConfirmImportData,
            mode: 'contained',
          },
        ]}
      >
        <Text style={styles.modalText}>Paste your exported JSON data below. This will overwrite existing data.</Text>
        <PaperTextInput
          label="JSON Data"
          value={jsonInput}
          onChangeText={setJsonInput}
          multiline
          numberOfLines={10}
          style={styles.textInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </CustomModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  divider: {
    height: 8,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalText: {
    marginBottom: 16,
    fontSize: 16,
    lineHeight: 24,
  },
  textInput: {
    maxHeight: 200, // Limit height for very long JSON strings
    marginBottom: 16,
  }
});

export default SettingsScreen;
