import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme, Modal as PaperModal, Portal, Button } from 'react-native-paper';

interface ModalProps {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: Array<{
    label: string;
    onPress: () => void;
    mode?: 'text' | 'outlined' | 'contained';
    color?: string;
  }>;
  dismissable?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  visible,
  onDismiss,
  title,
  children,
  actions = [],
  dismissable = true,
}) => {
  const theme = useTheme();

  return (
    <Portal>
      <PaperModal
        visible={visible}
        onDismiss={dismissable ? onDismiss : undefined}
        dismissable={dismissable}
        contentContainerStyle={[
          styles.container,
          { backgroundColor: theme.colors.surface }
        ]}
      >
        {title && (
          <Text variant="titleLarge" style={styles.title}>
            {title}
          </Text>
        )}
        <View style={styles.content}>
          {children}
        </View>
        {actions.length > 0 && (
          <View style={styles.actions}>
            {actions.map((action, index) => (
              <Button
                key={`${action.label}-${index}`}
                mode={action.mode || 'text'}
                onPress={action.onPress}
                textColor={action.color || theme.colors.primary}
                style={styles.actionButton}
              >
                {action.label}
              </Button>
            ))}
          </View>
        )}
      </PaperModal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  container: {
    borderRadius: 8,
    elevation: 5,
    margin: 20,
    padding: 20,
  },
  content: {
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default Modal;
