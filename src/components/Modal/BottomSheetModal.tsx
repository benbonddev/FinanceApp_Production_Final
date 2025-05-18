import React, { useRef, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';
import { 
  BottomSheetModal as GorhomBottomSheetModal, 
  BottomSheetModalProvider, 
  BottomSheetBackdrop,
  BottomSheetBackdropProps 
} from '@gorhom/bottom-sheet';

interface BottomSheetModalProps {
  children: React.ReactNode;
  title?: string;
  snapPoints?: (string | number)[];
  isOpen: boolean;
  onClose: () => void;
  showDragIndicator?: boolean;
}

const BottomSheetModal: React.FC<BottomSheetModalProps> = ({
  children,
  title,
  snapPoints = ['50%', '75%'],
  isOpen,
  onClose,
  showDragIndicator = true,
}) => {
  const theme = useTheme();
  const bottomSheetRef = useRef<GorhomBottomSheetModal>(null);

  // Callbacks
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  // Memoized snap points
  const snapPointsMemo = useMemo(() => snapPoints, [snapPoints]);

  // Handle close
  const handleClose = useCallback(() => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.close();
    }
    onClose();
  }, [onClose]);

  // Render backdrop
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  return (
    <BottomSheetModalProvider>
      <GorhomBottomSheetModal
        ref={bottomSheetRef}
        index={isOpen ? 0 : -1}
        snapPoints={snapPointsMemo}
        onChange={handleSheetChanges}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: theme.colors.surface,
        }}
        handleIndicatorStyle={{
          backgroundColor: showDragIndicator ? (theme.dark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)') : 'transparent',
          width: showDragIndicator ? 40 : 0,
        }}
      >
        <View style={styles.contentContainer}>
          {title && (
            <View style={styles.header}>
              <Text variant="titleMedium" style={styles.title}>{title}</Text>
              <IconButton
                icon="close"
                size={20}
                onPress={handleClose}
                style={styles.closeButton}
              />
            </View>
          )}
          <View style={styles.content}>
            {children}
          </View>
        </View>
      </GorhomBottomSheetModal>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    margin: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  title: {
    flex: 1,
    fontWeight: 'bold',
  },
});

export default BottomSheetModal;
