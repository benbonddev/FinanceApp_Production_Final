import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

const TermsOfServiceScreen: React.FC = () => {
  const theme = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Terms of Service</Text>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>1. Acceptance of Terms</Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          By accessing or using the Finance App, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the app.
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>2. Description of Service</Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          Finance App provides tools for personal financial management, including budget tracking, bill management, debt tracking, and financial goal setting. All data is stored locally on your device unless you explicitly choose to back up or sync your data.
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>3. User Accounts</Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>4. User Data</Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          You retain all rights to your data. We do not claim ownership of any data you input into the app. You are solely responsible for the accuracy and completeness of your financial data.
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>5. Prohibited Activities</Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          You agree not to:
          • Use the app for any illegal purpose
          • Attempt to gain unauthorized access to the app's systems
          • Interfere with other users' use of the app
          • Reverse engineer or attempt to extract the source code of the app
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>6. Disclaimer of Warranties</Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          The app is provided "as is" without warranties of any kind, either express or implied. We do not warrant that the app will be error-free or uninterrupted, or that defects will be corrected.
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>7. Limitation of Liability</Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          In no event shall we be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>8. Changes to Terms</Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          We reserve the right to modify these terms at any time. We will provide notice of significant changes through the app. Your continued use of the app after such modifications constitutes your acceptance of the modified terms.
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>9. Governing Law</Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          These terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>10. Contact Information</Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          If you have any questions about these Terms, please contact us at support@financeapp.com.
        </Text>
        
        <Text style={[styles.lastUpdated, { color: theme.colors.text }]}>
          Last updated: April 27, 2025
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  lastUpdated: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 24,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
});

export default TermsOfServiceScreen;
