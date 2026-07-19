import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../utils/supabase';

const DT = {
  bgBase: '#F8FAFC',
  primary: '#0F766E',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  componentBg: '#FFFFFF',
  borderGray: '#E2E8F0',
  errorRed: '#EF4444',
  successGreen: '#10B981',
};

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleReset = async () => {
    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    // Send reset instructions
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    
    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg('Check your email for the password reset link.');
    }
    
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Back Button */}
          <Pressable 
            style={styles.backButton}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(auth)/sign-in' as any);
              }
            }}
          >
            <MaterialIcons name="arrow-back" size={24} color={DT.textPrimary} />
          </Pressable>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="vpn-key" size={32} color={DT.primary} />
            </View>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Enter your email address and we will send you instructions to reset your password.</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {errorMsg ? (
              <View style={styles.errorBox}>
                <MaterialIcons name="error-outline" size={20} color={DT.errorRed} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {successMsg ? (
              <View style={[styles.errorBox, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                <MaterialIcons name="check-circle-outline" size={20} color={DT.successGreen} />
                <Text style={[styles.errorText, { color: DT.successGreen }]}>{successMsg}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                editable={!loading && !successMsg}
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: loading ? '#0D6B64' : (pressed ? '#0D6B64' : '#0F766E') }
              ]}
              onPress={handleReset}
              disabled={loading || successMsg !== ''}
            >
              {loading ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.primaryButtonText}>Sending Link...</Text>
                </View>
              ) : (
                <Text style={styles.primaryButtonText}>Send Reset Link</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DT.bgBase,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DT.componentBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: DT.borderGray,
    marginBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: DT.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: DT.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  formContainer: {
    backgroundColor: DT.componentBg,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DT.borderGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  errorBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: DT.errorRed,
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: DT.textPrimary,
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: DT.borderGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: DT.textPrimary,
    backgroundColor: DT.bgBase,
  },
  primaryButton: {
    height: 56,
    backgroundColor: '#0F766E',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
