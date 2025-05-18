import React from 'react';
import { StyleSheet, View, ScrollView, Switch } from 'react-native';
import { Text, useTheme, Divider, List, IconButton } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { toggleTheme } from '../../store/slices/themeSlice';
import ListItem from '../../components/List/ListItem';

const ThemePreviewScreen: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector(state => state.theme.isDarkMode);
  
  // Handle theme toggle
  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Theme Preview</Text>
        <Text style={[styles.subtitle, { color: theme.colors.text }]}>
          Currently using {isDarkMode ? 'Dark' : 'Light'} theme
        </Text>
      </View>
      
      <View style={styles.toggleContainer}>
        <Text style={[styles.toggleLabel, { color: theme.colors.text }]}>Dark Mode</Text>
        <Switch
          value={isDarkMode}
          onValueChange={handleThemeToggle}
          color={theme.colors.primary}
        />
      </View>
      
      <Divider style={styles.divider} />
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Colors</Text>
        
        <View style={styles.colorGrid}>
          <View style={styles.colorRow}>
            <View style={[styles.colorItem, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.colorLabel}>Primary</Text>
            </View>
            <View style={[styles.colorItem, { backgroundColor: theme.colors.accent }]}>
              <Text style={styles.colorLabel}>Accent</Text>
            </View>
          </View>
          
          <View style={styles.colorRow}>
            <View style={[styles.colorItem, { backgroundColor: theme.colors.background }]}>
              <Text style={[styles.colorLabel, { color: theme.colors.text }]}>Background</Text>
            </View>
            <View style={[styles.colorItem, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.colorLabel, { color: theme.colors.text }]}>Surface</Text>
            </View>
          </View>
          
          <View style={styles.colorRow}>
            <View style={[styles.colorItem, { backgroundColor: theme.colors.error }]}>
              <Text style={styles.colorLabel}>Error</Text>
            </View>
            <View style={[styles.colorItem, { backgroundColor: theme.colors.success }]}>
              <Text style={styles.colorLabel}>Success</Text>
            </View>
          </View>
          
          <View style={styles.colorRow}>
            <View style={[styles.colorItem, { backgroundColor: theme.colors.warning }]}>
              <Text style={styles.colorLabel}>Warning</Text>
            </View>
            <View style={[styles.colorItem, { backgroundColor: theme.colors.notification }]}>
              <Text style={styles.colorLabel}>Notification</Text>
            </View>
          </View>
        </View>
      </View>
      
      <Divider style={styles.divider} />
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Typography</Text>
        
        <View style={[styles.typographyItem, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.heading1, { color: theme.colors.text }]}>Heading 1</Text>
          <Text style={[styles.heading2, { color: theme.colors.text }]}>Heading 2</Text>
          <Text style={[styles.heading3, { color: theme.colors.text }]}>Heading 3</Text>
          <Text style={[styles.body, { color: theme.colors.text }]}>
            This is body text. The quick brown fox jumps over the lazy dog.
          </Text>
          <Text style={[styles.caption, { color: theme.colors.text }]}>
            This is caption text - smaller and lighter.
          </Text>
        </View>
      </View>
      
      <Divider style={styles.divider} />
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>UI Elements</Text>
        
        <View style={[styles.elementsContainer, { backgroundColor: theme.colors.surface }]}>
          <ListItem
            title="List Item"
            description="With description text"
            leftIcon={<IconButton icon="star" size={24} color={theme.colors.primary} />}
          />
          
          <Divider />
          
          <ListItem
            title="Another List Item"
            description="With toggle switch"
            rightContent={
              <Switch
                value={true}
                onValueChange={() => {}}
                color={theme.colors.primary}
              />
            }
          />
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.colors.text }]}>
          Theme preview helps you visualize how your app will look in different modes.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  body: {
    fontSize: 16,
    marginBottom: 8,
  },
  caption: {
    fontSize: 14,
    opacity: 0.7,
  },
  colorGrid: {
    marginBottom: 16,
  },
  colorItem: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    height: 80,
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  colorLabel: {
    color: 'white',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  colorRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  container: {
    flex: 1,
  },
  divider: {
    marginVertical: 16,
  },
  elementsContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  footer: {
    alignItems: 'center',
    padding: 16,
  },
  footerText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  header: {
    padding: 16,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
    opacity: 0.7,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  toggleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  toggleLabel: {
    fontSize: 16,
  },
  typographyItem: {
    borderRadius: 8,
    padding: 16,
  },
});

export default ThemePreviewScreen;
