import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { View, Text, Button as RNButton } from 'react-native'; // RNButton for mock close
import { PaperProvider } from 'react-native-paper'; // Theme provider
import Dropdown from '../Dropdown'; // The component to test
import { lightTheme as theme } from '../../../theme'; // Using lightTheme as an example

// Mock BottomSheetModal
const mockCloseModal = jest.fn();
const MockBottomSheetModal = jest.fn(({ isOpen, onClose, children, title }) => {
  mockCloseModal.mockImplementation(onClose); // Store the onClose function for later use
  if (!isOpen) return null;
  return (
    <View testID="mock-bottom-sheet-modal">
      <Text>{title}</Text>
      {/* Render children to allow interaction with ListItems */}
      {children}
      {/* Basic close button for testing, not part of Dropdown's direct interaction */}
      <RNButton title="Close Mock Modal" onPress={onClose} />
    </View>
  );
});

jest.mock('../../Modal/BottomSheetModal', () => MockBottomSheetModal);

// Mock ListItem to simplify, or ensure it can be simply rendered
// For this test, ListItem is simple enough that direct rendering via BottomSheetModal's children is fine.
// If ListItem had complex internal logic or its own modals, mocking it would be more beneficial.

const options = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3' },
];

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <PaperProvider theme={theme}>{children}</PaperProvider>
);

describe('Dropdown Component', () => {
  beforeEach(() => {
    // Clear mock call history before each test
    MockBottomSheetModal.mockClear();
    mockCloseModal.mockClear();
  });

  // 1. Renders correctly
  test('displays the label if provided', () => {
    render(<Dropdown label="Test Label" options={options} onSelect={jest.fn()} />, { wrapper: Wrapper });
    expect(screen.getByText('Test Label')).toBeTruthy();
  });

  test('displays the placeholder if no value is selected', () => {
    render(<Dropdown placeholder="Select Me" options={options} onSelect={jest.fn()} />, { wrapper: Wrapper });
    expect(screen.getByText('Select Me')).toBeTruthy();
  });

  test('displays the selected option\'s label if a value is provided', () => {
    render(<Dropdown options={options} onSelect={jest.fn()} value="2" />, { wrapper: Wrapper });
    expect(screen.getByText('Option 2')).toBeTruthy();
  });

  test('displays an error message if an error prop is provided', () => {
    render(<Dropdown options={options} onSelect={jest.fn()} error="Test Error" />, { wrapper: Wrapper });
    expect(screen.getByText('Test Error')).toBeTruthy();
  });

  // 2. Modal Interaction
  test('opens BottomSheetModal when pressed', () => {
    render(<Dropdown options={options} onSelect={jest.fn()} label="My Dropdown" />, { wrapper: Wrapper });

    // Initially, modal should not be visible
    expect(screen.queryByTestId('mock-bottom-sheet-modal')).toBeNull();
    expect(MockBottomSheetModal).toHaveBeenCalledWith(expect.objectContaining({ isOpen: false }), {});


    fireEvent.press(screen.getByText('My Dropdown')); // Press the dropdown (or its placeholder/value)

    // Modal should now be visible
    expect(screen.getByTestId('mock-bottom-sheet-modal')).toBeTruthy();
    // Check if MockBottomSheetModal was called with isOpen: true
    // The last call to MockBottomSheetModal should have isOpen: true
    const lastCall = MockBottomSheetModal.mock.calls[MockBottomSheetModal.mock.calls.length - 1][0];
    expect(lastCall.isOpen).toBe(true);
    expect(lastCall.title).toBe('My Dropdown');
  });

  test('passes options to BottomSheetModal and renders them', () => {
    render(<Dropdown options={options} onSelect={jest.fn()} label="Dropdown with Options" />, { wrapper: Wrapper });

    fireEvent.press(screen.getByText('Dropdown with Options'));

    expect(screen.getByTestId('mock-bottom-sheet-modal')).toBeTruthy();
    // Check if options are rendered (assuming ListItem renders a Text with the label)
    options.forEach(option => {
      expect(screen.getByText(option.label)).toBeTruthy();
    });
  });
  
  test('does not open modal if no options are provided and no custom onPress', () => {
    render(<Dropdown options={[]} onSelect={jest.fn()} label="Empty Dropdown" />, { wrapper: Wrapper });
    fireEvent.press(screen.getByText('Empty Dropdown'));
    expect(screen.queryByTestId('mock-bottom-sheet-modal')).toBeNull();
     // Check it was called but with isOpen: false
    expect(MockBottomSheetModal).toHaveBeenCalledWith(expect.objectContaining({ isOpen: false }), {});
  });

  test('calls custom onPress if provided and no options', () => {
    const mockCustomOnPress = jest.fn();
    render(
      <Dropdown options={[]} onSelect={jest.fn()} onPress={mockCustomOnPress} label="Custom Press Dropdown" />,
      { wrapper: Wrapper }
    );
    fireEvent.press(screen.getByText('Custom Press Dropdown'));
    expect(mockCustomOnPress).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('mock-bottom-sheet-modal')).toBeNull();
  });


  // 3. Option Selection
  test('calls onSelect with the correct option and closes modal when an option is selected', () => {
    const mockOnSelect = jest.fn();
    render(<Dropdown options={options} onSelect={mockOnSelect} label="Select Option Test" />, { wrapper: Wrapper });

    // Open the modal
    fireEvent.press(screen.getByText('Select Option Test'));
    expect(screen.getByTestId('mock-bottom-sheet-modal')).toBeTruthy();

    // Simulate selecting the second option (ListItem should render its title as Text)
    // This relies on ListItem rendering its title in a way that `getByText` can find.
    fireEvent.press(screen.getByText(options[1].label));

    // Check if onSelect was called correctly
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith(options[1]);

    // Check if the modal was closed (onClose prop of BottomSheetModal was called)
    // This is checked by verifying our mockCloseModal (which is set to the onClose prop) was called.
    expect(mockCloseModal).toHaveBeenCalledTimes(1);

    // To further verify modal closure, re-render or check that MockBottomSheetModal's isOpen prop is false in its next call
    // For this, we'd typically rely on the component's re-render cycle.
    // After selection, the Dropdown component should set its internal state to close the modal.
    // The mock will then be called with isOpen: false.
    // We can check the arguments of the last call to MockBottomSheetModal
     const lastCall = MockBottomSheetModal.mock.calls[MockBottomSheetModal.mock.calls.length - 1][0];
     expect(lastCall.isOpen).toBe(false); // This confirms the modal was told to close
  });
});

// Helper to get the props of the last call to a jest.fn()
// const getLastCallProps = (mockFn: jest.Mock) => {
//   if (mockFn.mock.calls.length > 0) {
//     return mockFn.mock.calls[mockFn.mock.calls.length - 1][0];
//   }
//   return null;
// };
