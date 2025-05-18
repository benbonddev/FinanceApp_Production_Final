import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Text, useTheme, Button, Divider, List, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { selectAllBills, updateBill } from '../../store/slices/billsSlice';
import ListItem from '../../components/List/ListItem';
import EmptyState from '../../components/EmptyState/EmptyState';
import { Bill, RootStackParamList } from '../../types';
import { format, parseISO, addHours } from 'date-fns';

type NotificationsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const NotificationsScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NotificationsScreenNavigationProp>();
  const bills = useAppSelector(selectAllBills);
  
  // Filter bills that are due soon (within 3 days) or overdue
  const today = new Date();
  const dueSoonBills = bills.filter(bill => {
    if (bill.isPaid) return false;
    
    const dueDate = parseISO(bill.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= -7 && diffDays <= 3; // Include bills up to 7 days overdue and 3 days upcoming
  });
  
  // Sort bills by due date (closest first)
  dueSoonBills.sort((a, b) => {
    return parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime();
  });
  
  // Handle notification actions
  const handlePayNow = (bill: Bill) => {
    Alert.alert(
      "Pay Bill",
      `Are you sure you want to mark "${bill.name}" as paid?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Pay", 
          onPress: () => {
            // Mark bill as paid
            const updatedBill = { ...bill, isPaid: true };
            dispatch(updateBill(updatedBill));
            
            // Show confirmation
            Alert.alert("Success", `${bill.name} has been marked as paid.`);
          }
        }
      ]
    );
  };
  
  const handleSnooze = (bill: Bill, hours: number) => {
    // Create a snoozed notification
    const snoozeUntil = addHours(new Date(), hours);
    
    Alert.alert(
      "Notification Snoozed",
      `You'll be reminded about "${bill.name}" in ${hours} ${hours === 1 ? 'hour' : 'hours'}.`,
      [{ text: "OK" }]
    );
    
    // In a real app, this would update the notification settings in the database
  };
  
  // Handle settings navigation
  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };
  
  // Render notification item
  const renderNotificationItem = (bill: Bill) => {
    const dueDate = parseISO(bill.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let statusText = '';
    let statusColor = theme.colors.text;
    
    if (diffDays < 0) {
      statusText = `Overdue by ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'day' : 'days'}`;
      statusColor = theme.colors.error;
    } else if (diffDays === 0) {
      statusText = 'Due today';
      statusColor = theme.colors.warning;
    } else {
      statusText = `Due in ${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
      statusColor = diffDays <= 1 ? theme.colors.warning : theme.colors.primary;
    }
    
    return (
      <View key={bill.id} style={styles.notificationItem}>
        <View style={styles.notificationHeader}>
          <View style={styles.notificationInfo}>
            <Text style={styles.notificationTitle}>{bill.name}</Text>
            <Text style={[styles.notificationStatus, { color: statusColor }]}>
              {statusText}
            </Text>
          </View>
          <Text style={styles.notificationAmount}>${bill.amount.toFixed(2)}</Text>
        </View>
        
        <Text style={styles.notificationDate}>
          Due date: {format(dueDate, 'MMM d, yyyy')}
        </Text>
        
        <View style={styles.notificationActions}>
          <Button 
            mode="contained" 
            onPress={() => handlePayNow(bill)}
            style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          >
            Pay Now
          </Button>
          
          <View style={styles.snoozeButtons}>
            <Button 
              mode="outlined" 
              onPress={() => handleSnooze(bill, 3)}
              style={styles.snoozeButton}
            >
              3h
            </Button>
            <Button 
              mode="outlined" 
              onPress={() => handleSnooze(bill, 12)}
              style={styles.snoozeButton}
            >
              12h
            </Button>
            <Button 
              mode="outlined" 
              onPress={() => handleSnooze(bill, 24)}
              style={styles.snoozeButton}
            >
              1d
            </Button>
          </View>
        </View>
        
        <Divider style={styles.divider} />
      </View>
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
          <IconButton
            icon="cog"
            size={24}
            onPress={handleSettingsPress}
          />
        </View>
        
        {dueSoonBills.length > 0 ? (
          <View style={styles.notificationsList}>
            {dueSoonBills.map(renderNotificationItem)}
          </View>
        ) : (
          <EmptyState
            icon="bell-outline"
            title="No Notifications"
            description="You don't have any bills due soon. Great job staying on top of your finances!"
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
    marginRight: 8,
  },
  container: {
    flex: 1,
  },
  divider: {
    height: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  notificationActions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  notificationAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  notificationDate: {
    fontSize: 14,
    marginBottom: 12,
    opacity: 0.7,
  },
  notificationHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationItem: {
    marginBottom: 16,
  },
  notificationStatus: {
    fontSize: 14,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notificationsList: {
    padding: 16,
  },
  snoozeButton: {
    flex: 1,
    marginHorizontal: 2,
  },
  snoozeButtons: {
    flexDirection: 'row',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default NotificationsScreen;
