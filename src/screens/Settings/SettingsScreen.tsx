import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, List, Modal, Switch, Text, useTheme } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../store';
import { setTheme } from '../../store/slices/themeSlice';
import ListItem from '../../components/List/ListItem';

const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const notificationLevel = useSelector((state: RootState) => state.theme.notificationLevel);
  const defaultView = useSelector((state: RootState) => state.theme.defaultView);
  
  const [showNotificationModal, setShowNotificationModal] = React.useState(false);
  const [showDefaultViewModal, setShowDefaultViewModal] = React.useState(false);
  
  const handleThemeChange = () => {
    dispatch(setTheme({ isDarkMode: !isDarkMode }));
  };
  
  const handleNotificationLevelChange = (level: string) => {
    dispatch(setTheme({ notificationLevel: level }));
    setShowNotificationModal(false);
  };
  
  const handleDefaultViewChange = (view: string) => {
    dispatch(setTheme({ defaultView: view }));
    setShowDefaultViewModal(false);
  };
  
  const handleExportData = () => {
    // In a production app, this would export data to a file
    alert('Data exported successfully');
  };
  
  const handleImportData = () => {
    // In a production app, this would import data from a file
    alert('Data imported successfully');
  };
  
  const handleClearData = () => {
    // In a production app, this would clear all data after confirmation
    alert('All data cleared');
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
            description="Set your preferred currency"
            rightContent={
              <Text style={{ color: theme.colors.primary }}>USD</Text>
            }
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
            onPress={handleImportData}
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
});

export default SettingsScreen;
