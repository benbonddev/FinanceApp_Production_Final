import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'information-outline',
  title,
  description,
  action,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name={icon}
        size={64}
        color={theme.colors.primary}
        style={styles.icon}
      />
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      {description && (
        <Text style={[styles.description, { color: theme.colors.text + '99' }]}>
          {description}
        </Text>
      )}
      {action && <View style={styles.actionContainer}>{action}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  actionContainer: {
    marginTop: 16,
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  description: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default EmptyState;
