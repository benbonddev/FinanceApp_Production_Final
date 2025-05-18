import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

const PrivacyPolicyScreen: React.FC = () => {
  const theme = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Privacy Policy</Text>
        
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          This Privacy Policy describes how your personal information is collected, used, and shared when you use the Finance App.
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Information We Collect</Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          The Finance App is designed to store all your financial data locally on your device. We do not collect or store your financial information on our servers. The data you input into the app, including bills, paychecks, budgets, debts, and financial goals, remains on your device unless you explicitly choose to back it up or sync it.
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Device Information</Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          When you use our app, we may automatically collect certain information about your device, including information about your mobile device, operating system, and app version. This information is used solely for troubleshooting and improving the app's performance.
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>How We Use Your Information</Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          We use the information we collect to:
          • Provide, maintain, and improve our app
          • Respond to your requests, questions, and feedback
          • Monitor and analyze usage patterns and trends
          • Debug and fix issues in our app
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Sharing Your Information</Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          We do not share your personal information with third parties except as described in this privacy policy. We may share your information with service providers who perform services on our behalf, such as hosting and analytics.
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Data Security</Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. However, no security system is impenetrable, and we cannot guarantee the security of your information.
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your Rights</Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          You have the right to access, update, or delete your information at any time. Since your financial data is stored locally on your device, you can directly manage it through the app's interface.
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Changes to This Privacy Policy</Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          We may update this privacy policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any changes by posting the new privacy policy in the app.
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Contact Us</Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          If you have any questions about this privacy policy or our privacy practices, please contact us at privacy@financeapp.com.
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

export default PrivacyPolicyScreen;
