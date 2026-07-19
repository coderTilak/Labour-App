import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

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
  placeholder: string;
  value: string;
  onChangeText?: (text: string) => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
  error?: boolean;
  multiline?: boolean;
  height?: number;
  rightElement?: React.ReactNode;
  editable?: boolean;
  onPress?: () => void;
}

function FormInput({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  error,
  multiline = false,
  height = 48,
  rightElement,
  editable = true,
  onPress,
}: FormInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const containerStyle = [
    styles.inputContainer,
    { height },
    isFocused && styles.inputFocused,
    error && styles.inputError,
  ];

  const content = (
    <View style={containerStyle}>
      {icon && (
        <MaterialIcons
          name={icon as any}
          size={20}
          color={isFocused ? DT.primary : DT.textSecondary}
          style={styles.inputIcon}
        />
      )}
      <TextInput
        style={[
          styles.textInput,
          multiline && { textAlignVertical: 'top', paddingTop: 12, paddingBottom: 12 }
        ]}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        multiline={multiline}
        editable={editable && !onPress}
        pointerEvents={onPress ? 'none' : 'auto'}
      />
      {rightElement}
    </View>
  );

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      {onPress ? (
        <Pressable onPress={onPress}>{content}</Pressable>
      ) : (
        content
      )}
      {error && <Text style={styles.errorText}>This field is required</Text>}
    </View>
  );
}

// ─── Main Screen Component ────────────────────────────────────────────────────
export default function BookServiceScreen() {
  const insets = useSafeAreaInsets();
  const { provider_id, provider_name, provider_title, provider_type } = useLocalSearchParams<{
    provider_id?: string;
    provider_name?: string;
    provider_title?: string;
    provider_type?: string;
  }>();

  const displayName = provider_name || 'Ram Bahadur Thapa';
  const displayTitle = provider_title || 'Mason • Verified Expert';
  
  // Form State
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [notes, setNotes] = useState('');
  
  // Validation State (true means error)
  const [errors, setErrors] = useState({
    description: false,
    location: false,
    startDate: false,
  });

  const handleNext = () => {
    // Validate required fields
    const newErrors = {
      description: description.trim() === '',
      location: location.trim() === '',
      startDate: startDate.trim() === '',
    };
    
    setErrors(newErrors);
    
    const hasErrors = Object.values(newErrors).some(err => err);
    if (!hasErrors) {
      // Proceed to next step
      console.log('Proceeding with:', { description, location, startDate, notes });
      // router.push('/(customer)/booking-confirmation');
    }
  };

  return (
    <View style={styles.rootContainer}>
      {/* 1. Sticky Top Navigation Bar */}
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <Pressable 
          style={styles.backButton} 
          onPress={() => router.back()}
          hitSlop={8}
        >
          <MaterialIcons name="arrow-back" size={24} color={DT.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Book Service</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* 2. Scrollable Parameters Body Container */}
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Target Worker Brief Component */}
          <View style={styles.workerBrief}>
            <View style={styles.workerAvatar}>
              <MaterialIcons name={provider_type === 'company' ? 'business' : 'person'} size={28} color="#CBD5E1" />
            </View>
            <View style={styles.workerInfo}>
              <Text style={styles.workerName}>{displayName}</Text>
              <Text style={styles.workerTitle}>{displayTitle}</Text>
            </View>
          </View>

          {/* Form Input Matrix */}
          <View style={styles.formMatrix}>
            {/* Input Group 1: Problem Description Box */}
            <FormInput
              label="WHAT DO YOU NEED HELP WITH?"
              placeholder="Describe your job requirements in detail (e.g., Brick wall plastering, tile cracks layout, room extension...)"
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                if (errors.description) setErrors(prev => ({ ...prev, description: false }));
              }}
              multiline
              height={120}
              error={errors.description}
            />

            {/* Input Group 2: Work Location Field Selector */}
            <FormInput
              label="WORK LOCATION ADDRESS"
              placeholder="Select or enter your service address"
              value={location}
              onChangeText={(text) => {
                setLocation(text);
                if (errors.location) setErrors(prev => ({ ...prev, location: false }));
              }}
              icon="place"
              error={errors.location}
              rightElement={
                <Pressable style={styles.locateBtn} hitSlop={8}>
                  <MaterialIcons name="my-location" size={16} color={DT.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.locateText}>Locate</Text>
                </Pressable>
              }
            />

            {/* Input Group 3: Preferred Date Selector Matrix */}
            <FormInput
              label="PREFERRED START DATE"
              placeholder="Select Date"
              value={startDate}
              icon="calendar-today"
              error={errors.startDate}
              editable={false}
              onPress={() => {
                setStartDate('Tomorrow, 10:00 AM');
                if (errors.startDate) setErrors(prev => ({ ...prev, startDate: false }));
              }}
              rightElement={
                <MaterialIcons name="keyboard-arrow-down" size={20} color={DT.textSecondary} />
              }
            />

            {/* Input Group 4: Additional Notes / Special Instructions - Optional */}
            <FormInput
              label="ADDITIONAL NOTES FOR WORKER"
              placeholder="Any tools required, specific timing details, etc..."
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 3. Fixed Sticky Bottom Action Footer */}
      <View style={[styles.bottomFooter, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Pressable 
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }
          ]}
          onPress={handleNext}
        >
          <Text style={styles.primaryButtonText}>Next</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: DT.bgBase,
  },
  
  // 1. Sticky Top Navigation Bar
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: DT.componentBg,
    borderBottomWidth: 1,
    borderBottomColor: DT.borderGray,
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: DT.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 24,
    height: 24,
  },

  // 2. Body Container
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  // Worker Brief Component
  workerBrief: {
    flexDirection: 'row',
    backgroundColor: DT.componentBg,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: DT.borderGray,
    marginBottom: 20,
    alignItems: 'center',
  },
  workerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DT.lightBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workerInfo: {
    paddingLeft: 10,
    flex: 1,
  },
  workerName: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: DT.textPrimary,
  },
  workerTitle: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: DT.primary,
    marginTop: 2,
  },

  // Form Matrix
  formMatrix: {
    gap: 18,
  },
  inputGroup: {
    // Gap handled by parent
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
    paddingHorizontal: 14,
  },
  inputFocused: {
    borderColor: DT.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: DT.errorRed,
    borderWidth: 1.5,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: DT.textPrimary,
  },
  locateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  locateText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: DT.primary,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: DT.errorRed,
  },

  // 3. Fixed Sticky Bottom Action Footer
  bottomFooter: {
    backgroundColor: DT.componentBg,
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
    paddingHorizontal: 20,
    paddingTop: 12,
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 10,
  },
  primaryButton: {
    width: '100%',
    height: 54,
    backgroundColor: DT.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: DT.primary,
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
