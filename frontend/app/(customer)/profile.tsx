import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabase';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const DT = {
  bgBase: '#F8FAFC',
  primary: '#0F766E',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  componentBg: '#FFFFFF',
  borderGray: '#E2E8F0',
  lightBg: '#F1F5F9',
  errorRed: '#EF4444',
};

// ─── Reusable Form Input Component ─────────────────────────────────────────────
interface FormInputProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  editable?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  rightElement?: React.ReactNode;
}

function FormInput({
  label,
  value,
  onChangeText,
  editable = true,
  keyboardType = 'default',
  rightElement,
}: FormInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          !editable && styles.inputDisabled,
          isFocused && styles.inputFocused,
        ]}
      >
        <TextInput
          style={[styles.textInput, !editable && styles.textInputDisabled]}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          keyboardType={keyboardType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#94A3B8"
        />
        {rightElement}
      </View>
    </View>
  );
}

// ─── Main Screen Component ────────────────────────────────────────────────────
export default function CustomerProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [email, setEmail] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');

  // Original State for dirty checking
  const [originalState, setOriginalState] = useState({
    fullName: '',
    contactNo: '',
    email: '',
    streetAddress: '',
    city: '',
    zipCode: '',
    country: '',
  });

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      const { data, error } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        const initialState = {
          fullName: data.full_name || '',
          contactNo: data.contact_no || '',
          email: data.email || user.email || '',
          streetAddress: data.tole || '', // using tole for street address
          city: data.city || '',
          zipCode: data.zip_code || '',
          country: data.country || '',
        };
        
        setFullName(initialState.fullName);
        setContactNo(initialState.contactNo);
        setEmail(initialState.email);
        setStreetAddress(initialState.streetAddress);
        setCity(initialState.city);
        setZipCode(initialState.zipCode);
        setCountry(initialState.country);
        
        setOriginalState(initialState);
      }
    }
    loadProfile();
  }, [user]);

  // Dirty check to highlight Save button
  const hasChanges = 
    fullName !== originalState.fullName ||
    contactNo !== originalState.contactNo ||
    email !== originalState.email ||
    streetAddress !== originalState.streetAddress ||
    city !== originalState.city ||
    zipCode !== originalState.zipCode ||
    country !== originalState.country;

  const handleSave = async () => {
    if (!hasChanges) return;
    
    try {
      const { error } = await supabase
        .from('customer_profiles')
        .update({
          full_name: fullName,
          contact_no: contactNo,
          email: email,
          tole: streetAddress,
          city: city,
          zip_code: zipCode,
          country: country,
        })
        .eq('user_id', user?.id);
        
      if (error) throw error;
      
      // Update original state to current
      setOriginalState({
        fullName, contactNo, email, streetAddress, city, zipCode, country
      });
      
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile');
    }
  };

  const handleDeleteRequest = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to request account deletion? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => console.log('Delete requested')
        }
      ]
    );
  };

  const handleDevLogout = async () => {
    if (user) {
      await supabase.from('user_roles').delete().eq('user_id', user.id);
    }
    await supabase.auth.signOut();
    await AsyncStorage.removeItem('hasSeenOnboarding');
    router.replace('/onboarding');
  };

  return (
    <View style={styles.rootContainer}>
      {/* 1. Sticky Header Navigation Container */}
      <View style={[styles.header, { paddingTop: insets.top, height: 60 + insets.top }]}>
        <Pressable 
          style={styles.headerBtn} 
          onPress={() => router.back()}
          hitSlop={8}
        >
          <MaterialIcons name="chevron-left" size={28} color={DT.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>My Profile Details</Text>
        <Pressable 
          style={styles.headerBtnRight} 
          onPress={handleSave}
          disabled={!hasChanges}
          hitSlop={8}
        >
          <Text style={[styles.saveButtonText, hasChanges && styles.saveButtonActive]}>
            Save
          </Text>
        </Pressable>
      </View>

      {/* 2. Scrollable Profile Setup Content */}
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar Management Center Area */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <MaterialIcons name="person" size={60} color="#CBD5E1" />
              </View>
              <Pressable style={styles.cameraTrigger}>
                <MaterialIcons name="photo-camera" size={16} color="#FFFFFF" />
              </Pressable>
            </View>
            <Text style={styles.avatarSubtext}>Tap to change photo</Text>
          </View>

          {/* Profile Core Information - Form Group Matrix */}
          <View style={styles.formMatrix}>
            
            {/* Input Group 1: Full Name */}
            <FormInput
              label="FULL NAME"
              value={fullName}
              onChangeText={setFullName}
            />

            {/* Input Group 2: Contact Number (Disabled) */}
            <FormInput
              label="CONTACT NUMBER"
              value={contactNo}
              editable={false}
              rightElement={<MaterialIcons name="lock" size={18} color={DT.textSecondary} />}
            />

            {/* Input Group 3: Email Address */}
            <FormInput
              label="EMAIL ADDRESS"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            {/* Input Group 4: Street Address */}
            <FormInput
              label="STREET ADDRESS"
              value={streetAddress}
              onChangeText={setStreetAddress}
            />

            {/* Input Group 5: City & Zip Split */}
            <View style={styles.splitRow}>
              <View style={styles.splitColumn}>
                <FormInput
                  label="CITY"
                  value={city}
                  onChangeText={setCity}
                />
              </View>
              <View style={styles.splitColumn}>
                <FormInput
                  label="ZIP CODE"
                  value={zipCode}
                  onChangeText={setZipCode}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Input Group 6: Country */}
            <FormInput
              label="COUNTRY"
              value={country}
              onChangeText={setCountry}
            />
          </View>

          {/* 3. Secondary Danger Zone Actions */}
          <View style={[styles.dangerZone, { paddingBottom: Math.max(insets.bottom, 40) }]}>
            <Pressable 
              style={({ pressed }) => [
                styles.deleteBtn,
                pressed && { backgroundColor: '#FEF2F2' }
              ]}
              onPress={handleDeleteRequest}
            >
              <Text style={styles.deleteBtnText}>Delete Account Request</Text>
            </Pressable>

            {/* Dev Logout Button */}
            <Pressable 
              style={({ pressed }) => [
                styles.devLogoutBtn,
                pressed && { backgroundColor: '#F1F5F9' }
              ]}
              onPress={handleDevLogout}
            >
              <Text style={styles.devLogoutText}>Force Logout & Reset (Dev)</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: DT.bgBase,
  },
  
  // 1. Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: DT.componentBg,
    borderBottomWidth: 1,
    borderBottomColor: DT.borderGray,
  },
  headerBtn: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerBtnRight: {
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: DT.textPrimary,
    textAlign: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: '#9CA3AF', // Inactive color
  },
  saveButtonActive: {
    color: DT.primary,
  },

  // 2. Body
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },

  // Avatar Area
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: DT.componentBg,
    borderBottomWidth: 1,
    borderBottomColor: DT.borderGray,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: DT.lightBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraTrigger: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: DT.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: DT.componentBg,
  },
  avatarSubtext: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    color: DT.primary,
    marginTop: 8,
  },

  // Form Matrix
  formMatrix: {
    padding: 16,
    gap: 16,
  },
  inputGroup: {
    marginBottom: 16, // using gap from parent, but this serves as fallback
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    letterSpacing: 0.5,
    color: DT.textSecondary,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DT.componentBg,
    borderWidth: 1,
    borderColor: DT.borderGray,
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 14,
  },
  inputFocused: {
    borderWidth: 2,
    borderColor: DT.primary,
  },
  inputDisabled: {
    backgroundColor: DT.lightBg,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: DT.textPrimary,
  },
  textInputDisabled: {
    color: DT.textSecondary,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  splitColumn: {
    width: '48%',
  },

  // Danger Zone
  dangerZone: {
    marginTop: 24,
    paddingHorizontal: 16,
    gap: 12,
  },
  deleteBtn: {
    width: '100%',
    height: 48,
    backgroundColor: '#0F766E',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  devLogoutBtn: {
    width: '100%',
    height: 48,
    backgroundColor: '#0F766E',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  devLogoutText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
