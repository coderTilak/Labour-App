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
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../utils/supabase';

try {
  WebBrowser.maybeCompleteAuthSession();
} catch (e) {
  console.log('WebBrowser.maybeCompleteAuthSession error:', e);
}

const DT = {
  bgBase: '#FFFFFF',
  primary: '#0F766E',
  primaryDark: '#0D6B64',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  inputBg: '#F8FAFC',
  borderGray: '#E2E8F0',
  errorRed: '#EF4444',
  successGreen: '#10B981',
  facebook: '#1877F2',
};

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fbLoading, setFbLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    const redirectTo = Linking.createURL('/');

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: redirectTo,
      }
    });
    
    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }
    
    if (data?.user) {
      const pendingRole = await AsyncStorage.getItem('pendingRole');
      const targetRole = pendingRole || 'customer';

      await supabase.from('user_roles').upsert({
        user_id: data.user.id,
        role: targetRole,
      }, { onConflict: 'user_id' });

      await AsyncStorage.removeItem('pendingRole');

      if (data?.session === null) {
        setSuccessMsg('Success! Please check your inbox for an email verification link.');
      } else {
        if (targetRole === 'customer') {
          router.replace('/(customer)/profile-setup' as any);
        } else if (targetRole === 'worker') {
          router.replace('/(worker)/profile-setup' as any);
        } else if (targetRole === 'company') {
          router.replace('/(company)/profile-setup' as any);
        }
      }
    }
    
    setLoading(false);
  };

  const handleFacebookLogin = async () => {
    setFbLoading(true);
    setErrorMsg('');
    
    try {
      const redirectUrl = makeRedirectUri();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      
      if (data?.url) {
        const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        if (res.type === 'success' && res.url) {
          const url = res.url;
          if (url.includes('#access_token=')) {
            const hashPart = url.split('#')[1];
            const params = hashPart.split('&').reduce((acc, current) => {
              const [key, value] = current.split('=');
              acc[key] = value;
              return acc;
            }, {} as Record<string, string>);
            
            if (params.access_token && params.refresh_token) {
              await supabase.auth.setSession({
                access_token: params.access_token,
                refresh_token: params.refresh_token,
              });
            }
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Facebook login failed.');
    } finally {
      setFbLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <MaterialIcons name="person-add" size={36} color={DT.primary} />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Labour Connect to find or offer services</Text>
          </View>

          {/* Form container wrapping all elements */}
          <View style={styles.formContainer}>
            {errorMsg ? (
              <View style={styles.errorBox}>
                <MaterialIcons name="error" size={20} color={DT.errorRed} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {successMsg ? (
              <View style={[styles.errorBox, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                <MaterialIcons name="check-circle" size={20} color={DT.successGreen} />
                <Text style={[styles.errorText, { color: '#065F46' }]}>{successMsg}</Text>
              </View>
            ) : null}

            {/* Facebook Login */}
            <Pressable 
              style={({ pressed }) => [
                styles.socialButton, 
                { backgroundColor: '#0F766E' },
                pressed ? { opacity: 0.85 } : undefined
              ]}
              onPress={handleFacebookLogin}
              disabled={fbLoading || loading}
            >
              {fbLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <FontAwesome5 name="facebook" size={20} color="#FFFFFF" style={styles.socialIcon} />
                  <Text style={styles.socialButtonText}>Sign up with Facebook</Text>
                </>
              )}
            </Pressable>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or register with email</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={styles.input}
                placeholder="name@example.com"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                editable={!loading && !fbLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Create a password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading && !fbLoading}
                />
                <Pressable
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialIcons
                    name={showPassword ? 'visibility' : 'visibility-off'}
                    size={20}
                    color="#94A3B8"
                  />
                </Pressable>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm your password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!loading && !fbLoading}
                />
                <Pressable
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialIcons
                    name={showPassword ? 'visibility' : 'visibility-off'}
                    size={20}
                    color="#94A3B8"
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: loading ? '#0D6B64' : (pressed ? '#0D6B64' : '#0F766E') }
              ]}
              onPress={handleSignUp}
              disabled={loading || fbLoading}
            >
              {loading ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={styles.primaryButtonText}>Creating Account...</Text>
                </View>
              ) : (
                <Text style={styles.primaryButtonText}>Create Account</Text>
              )}
            </Pressable>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable onPress={() => router.push('/(auth)/sign-in')}>
              <Text style={styles.footerLink}>Sign In</Text>
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
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  title: {
    fontSize: 30,
    fontFamily: 'Inter-Bold',
    color: DT.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: DT.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  errorBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    marginBottom: 24,
    gap: 10,
  },
  errorText: {
    flex: 1,
    color: '#991B1B',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  socialButton: {
    height: 54,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#1877F2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  socialIcon: {
    marginRight: 10,
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: DT.borderGray,
  },
  dividerText: {
    marginHorizontal: 14,
    fontSize: 14,
    color: DT.textSecondary,
    fontFamily: 'Inter-Medium',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: DT.textPrimary,
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1.5,
    borderColor: DT.borderGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: DT.textPrimary,
    backgroundColor: DT.inputBg,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderWidth: 1.5,
    borderColor: DT.borderGray,
    borderRadius: 12,
    backgroundColor: DT.inputBg,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: DT.textPrimary,
  },
  eyeIcon: {
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 36,
  },
  footerText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: DT.textSecondary,
  },
  footerLink: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    color: DT.primary,
  },
});
