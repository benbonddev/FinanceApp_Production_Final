import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface ListItemProps {
  title: string;
  description?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}

const ListItem: React.FC<ListItemProps> = ({
  title,
  description,
  leftIcon,
  rightIcon,
  onPress,
  disabled = false,
}) => {
  const theme = useTheme();
  
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.border || 'rgba(0,0,0,0.1)'
        }
      ]}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
    >
      {leftIcon && (
        <View style={styles.leftIcon}>
          {leftIcon}
        </View>
      )}
      <View style={styles.content}>
        <Text 
          variant="bodyLarge" 
          style={[
            styles.title, 
            { color: disabled ? theme.colors.outline : theme.colors.text }
          ]}
        >
          {title}
        </Text>
        {description && (
          <Text 
            variant="bodyMedium" 
            style={[
              styles.description, 
              { color: disabled ? theme.colors.outline : theme.colors.onSurfaceVariant }
            ]}
          >
            {description}
          </Text>
        )}
      </View>
      {rightIcon && (
        <View style={styles.rightIcon}>
          {rightIcon}
        </View>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  content: {
    flex: 1,
  },
  description: {
    marginTop: 2,
  },
  leftIcon: {
    marginRight: 16,
  },
  rightIcon: {
    marginLeft: 16,
  },
  title: {
    fontWeight: '500',
  },
});

export default ListItem;
