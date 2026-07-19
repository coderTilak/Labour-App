import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Animated,
  Easing,
  Dimensions,
  TextInput as RNTextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';
import { Colors, Shadows } from '../../constants/Theme';
import { supabase } from '../../utils/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH > 600;

// ─── Design Tokens ────────────────────────────────────────────────────────────
const DT = {
  bgBase: '#F8FAFC',
  primary: '#0F766E',
  primaryDark: '#0D6B64',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  componentBg: '#FFFFFF',
  borderGray: '#E2E8F0',
  activeTint: '#F1F5F9',
  placeholder: '#94A3B8',
  errorRed: '#EF4444',
  tealTint: '#F0FDFA',
} as const;

// ─── Animated Form Input ──────────────────────────────────────────────────────
interface FormInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad' | 'numeric';
  autoCapitalize?: 'none' | 'words' | 'sentences';
  icon: keyof typeof MaterialIcons.glyphMap;
  error?: string;
  animDelay?: number;
  rightElement?: React.ReactNode;
}

function FormInput({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  autoCapitalize = 'words',
  icon,
  error,
  animDelay = 0,
  rightElement,
}: FormInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Entrance
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(18)).current;
  // Focus
  const borderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 420,
        delay: animDelay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideY, {
        toValue: 0,
        duration: 420,
        delay: animDelay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideY, animDelay]);

  useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 160,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [isFocused, borderAnim]);

  const borderColor = error
    ? DT.errorRed
    : borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [DT.borderGray, DT.primary],
      });

  const borderWidth = error
    ? 1.5
    : borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 2],
      });

  const bgColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [DT.componentBg, DT.tealTint],
  });

  return (
    <Animated.View
      style={[
        styles.inputGroup,
        { opacity: fadeAnim, transform: [{ translateY: slideY }] },
      ]}
    >
      <Text style={styles.inputLabel}>{label}</Text>
      <Animated.View
        style={[
          styles.inputContainer,
          { borderColor, borderWidth, backgroundColor: bgColor },
        ]}
      >
        <MaterialIcons
          name={icon}
          size={18}
          color={isFocused ? DT.primary : DT.textSecondary}
          style={styles.inputIconLeft}
        />
        <RNTextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor={DT.placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {rightElement}
      </Animated.View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CustomerProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // Form state
  const [fullName, setFullName] = useState('');
  const [contactNo, setContactNo] = useState('');
  
  // New Location Fields
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [tole, setTole] = useState('');
  const [landmark, setLandmark] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Pre-fill existing data if any
  useEffect(() => {
    async function loadExisting() {
      if (!user) return;
      const { data } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (data) {
        if (data.full_name) setFullName(data.full_name);
        if (data.contact_no) setContactNo(data.contact_no);
        if (data.country) setCountry(data.country);
        if (data.city) setCity(data.city);
        if (data.zip_code) setZipCode(data.zip_code);
        if (data.tole) setTole(data.tole);
        if (data.landmark) setLandmark(data.landmark);
      }
    }
    loadExisting();
  }, [user]);

  // Validation errors
  const [errors, setErrors] = useState<{
    fullName?: string;
    contactNo?: string;
    city?: string;
    country?: string;
  }>({});

  // Touched tracking for inline validation
  const [touched, setTouched] = useState<{
    fullName?: boolean;
    contactNo?: boolean;
  }>({});

  // Entrance animations
  const headerFade = useRef(new Animated.Value(0)).current;
  const avatarFade = useRef(new Animated.Value(0)).current;
  const avatarScale = useRef(new Animated.Value(0.88)).current;
  const footerFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Header
    Animated.timing(headerFade, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    // Avatar
    Animated.sequence([
      Animated.delay(150),
      Animated.parallel([
        Animated.timing(avatarFade, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(avatarScale, {
          toValue: 1,
          friction: 8,
          tension: 55,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Footer
    Animated.sequence([
      Animated.delay(650),
      Animated.timing(footerFade, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerFade, avatarFade, avatarScale, footerFade]);

  // ── Validation ──
  const validateContact = useCallback((val: string) => {
    if (!val.trim()) return 'Contact number is required';
    if (val.length < 7) return 'Please enter a valid phone number';
    return undefined;
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: typeof errors = {};
    if (!fullName.trim()) newErrors.fullName = 'Field is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!country.trim()) newErrors.country = 'Country is required';
    const contactErr = validateContact(contactNo);
    if (contactErr) newErrors.contactNo = contactErr;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [fullName, contactNo, city, country, validateContact]);

  // Inline validation on change
  useEffect(() => {
    if (touched.fullName) {
      setErrors((prev) => ({
        ...prev,
        fullName: fullName.trim() ? undefined : 'Field is required',
      }));
    }
  }, [fullName, touched.fullName]);

  useEffect(() => {
    if (touched.contactNo) {
      setErrors((prev) => ({
        ...prev,
        contactNo: validateContact(contactNo),
      }));
    }
  }, [contactNo, touched.contactNo, validateContact]);

  // ── Submit ──
  const handleSubmit = async () => {
    // Mark all as touched
    setTouched({ fullName: true, contactNo: true });

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Upsert instead of just insert so if they are updating it doesn't fail
      const { error } = await supabase.from('customer_profiles').upsert({
        user_id: user?.id || null,
        full_name: fullName.trim(),
        contact_no: contactNo.trim(),
        country: country.trim() || null,
        city: city.trim() || null,
        zip_code: zipCode.trim() || null,
        tole: tole.trim() || null,
        landmark: landmark.trim() || null,
        email: user?.email || null, // Auto-populate from auth session
      }, { onConflict: 'user_id' });

      if (error) {
        console.error('Supabase insert error:', error.message);
      }

      router.replace('/(customer)/home');
    } catch (err) {
      console.error('Network error:', err);
      router.replace('/(customer)/home');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = fullName.trim().length > 0 && contactNo.trim().length > 6 && city.trim().length > 0 && country.trim().length > 0 && !errors.contactNo;

  const handleLocateMe = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        setIsLocating(false);
        return;
      }

      let locationData = await Location.getLastKnownPositionAsync({});
      if (!locationData) {
        locationData = await Location.getCurrentPositionAsync({});
      }
      
      if (!locationData) {
        throw new Error('Could not determine location');
      }

      const geocode = await Location.reverseGeocodeAsync({
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
      });

      if (geocode.length > 0) {
        const result = geocode[0];
        if (result.country) setCountry(result.country);
        if (result.city || result.subregion) setCity(result.city || result.subregion || '');
        if (result.postalCode) setZipCode(result.postalCode);
        if (result.street || result.district) setTole(result.street || result.district || '');
        if (result.name) setLandmark(result.name);
      }
    } catch (err) {
      console.warn('Location Error:', err);
      alert('Could not fetch location automatically. Please enter it manually.');
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <View style={[styles.rootContainer, { paddingTop: insets.top }]}>
      {/* ═══════════════════════════════════════════════════════════════════
          STICKY HEADER — 64px fixed
         ═══════════════════════════════════════════════════════════════════ */}
      <Animated.View style={[styles.stickyHeader, { opacity: headerFade }]}>
        <Pressable
          style={({ pressed }) => [
            styles.backBtn,
            pressed && styles.backBtnPressed,
          ]}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/role-selection');
            }
          }}
          hitSlop={12}
        >
          <MaterialIcons name="chevron-left" size={24} color={DT.textPrimary} />
        </Pressable>

        <Text style={styles.headerTitle} numberOfLines={1}>
          Create Customer Account
        </Text>

        {/* Right spacer for centering symmetry */}
        <View style={styles.headerSpacer} />
      </Animated.View>

      {/* ═══════════════════════════════════════════════════════════════════
          SCROLLABLE FORM BODY
         ═══════════════════════════════════════════════════════════════════ */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 64}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Avatar Upload Block ── */}
          <Animated.View
            style={[
              styles.avatarBlock,
              { opacity: avatarFade, transform: [{ scale: avatarScale }] },
            ]}
          >
            <Pressable
              style={({ pressed }) => [
                styles.avatarPressable,
                pressed && { opacity: 0.75 },
              ]}
            >
              {/* Base circle */}
              <View style={styles.avatarCircle}>
                <MaterialIcons name="person-outline" size={38} color="#CBD5E1" />
              </View>
              {/* Camera badge */}
              <View style={styles.cameraBadge}>
                <MaterialIcons name="photo-camera" size={13} color="#FFFFFF" />
              </View>
            </Pressable>
            <Text style={styles.avatarCaption}>
              Upload Profile Photo (Optional)
            </Text>
          </Animated.View>

          {/* ── Form Input Matrix ── */}
          <View style={styles.formMatrix}>
            {/* Full Name */}
            <FormInput
              label="FULL NAME"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={(v) => {
                setFullName(v);
                if (!touched.fullName) setTouched((p) => ({ ...p, fullName: true }));
              }}
              icon="badge"
              error={errors.fullName}
              autoCapitalize="words"
              animDelay={300}
            />

            {/* Contact Number */}
            <FormInput
              label="CONTACT NUMBER"
              placeholder="e.g. 9812345678"
              value={contactNo}
              onChangeText={(v) => {
                setContactNo(v);
                if (!touched.contactNo) setTouched((p) => ({ ...p, contactNo: true }));
              }}
              icon="phone"
              keyboardType="phone-pad"
              autoCapitalize="none"
              error={errors.contactNo}
              animDelay={430}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={styles.inputLabel}>ADDRESS DETAILS</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.locateMeBtn,
                  pressed && { opacity: 0.7 },
                ]}
                hitSlop={8}
                onPress={handleLocateMe}
                disabled={isLocating}
              >
                {isLocating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 4 }} />
                ) : (
                  <MaterialIcons
                    name="my-location"
                    size={13}
                    color="#FFFFFF"
                    style={{ marginRight: 4 }}
                  />
                )}
                <Text style={styles.locateMeText}>{isLocating ? 'Locating...' : 'Locate Me'}</Text>
              </Pressable>
            </View>

            {/* Country */}
            <FormInput
              label="COUNTRY"
              placeholder="e.g. Nepal"
              value={country}
              onChangeText={setCountry}
              icon="public"
              animDelay={480}
              error={errors.country}
            />

            {/* City */}
            <FormInput
              label="CITY"
              placeholder="e.g. Kathmandu"
              value={city}
              onChangeText={setCity}
              icon="location-city"
              animDelay={520}
              error={errors.city}
            />

            {/* Zip Code & Tole (Row Layout via nested views is possible, but stacked for simplicity of animations) */}
            <FormInput
              label="ZIP CODE (OPTIONAL)"
              placeholder="e.g. 44600"
              value={zipCode}
              onChangeText={setZipCode}
              keyboardType="number-pad"
              icon="local-post-office"
              animDelay={560}
            />

            <FormInput
              label="TOLE / STREET"
              placeholder="e.g. Thamel, Marg"
              value={tole}
              onChangeText={setTole}
              icon="map"
              animDelay={600}
            />

            {/* Nearby Landmark */}
            <FormInput
              label="NEARBY LANDMARK"
              placeholder="e.g. Near Durbar Square"
              value={landmark}
              onChangeText={setLandmark}
              icon="store"
              animDelay={640}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ═══════════════════════════════════════════════════════════════════
          STICKY FOOTER
         ═══════════════════════════════════════════════════════════════════ */}
      <Animated.View
        style={[
          styles.stickyFooter,
          {
            opacity: footerFade,
            paddingBottom: Math.max(insets.bottom, 12) + 8,
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.submitBtn,
            !isFormValid && styles.submitBtnDisabled,
            isFormValid && !isSubmitting && pressed && styles.submitBtnPressed,
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          android_ripple={
            isFormValid && !isSubmitting
              ? { color: 'rgba(255,255,255,0.18)', borderless: false }
              : undefined
          }
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text
              style={[
                styles.submitBtnText,
                !isFormValid && styles.submitBtnTextDisabled,
              ]}
            >
              Save & Launch App
            </Text>
          )}
        </Pressable>

        <Text style={styles.legalText}>
          By creating an account, you agree to the Labour Connect{' '}
          <Text style={styles.legalLink}>Privacy Policy</Text> and{' '}
          <Text style={styles.legalLink}>Terms of Service</Text>.
        </Text>
      </Animated.View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: DT.bgBase,
  },

  // ═══ Sticky Header ═══
  stickyHeader: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: DT.componentBg,
    borderBottomWidth: 1,
    borderBottomColor: DT.borderGray,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 44,
    minHeight: 44,
  },
  backBtnPressed: {
    backgroundColor: DT.activeTint,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    fontWeight: '700',
    color: DT.textPrimary,
    letterSpacing: -0.2,
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },

  // ═══ Scroll ═══
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },

  // ═══ Avatar ═══
  avatarBlock: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarPressable: {
    position: 'relative',
    marginBottom: 8,
    minWidth: 44,
    minHeight: 44,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: DT.activeTint,
    borderWidth: 2,
    borderColor: DT.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: DT.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: DT.bgBase,
    ...Shadows.small,
  },
  avatarCaption: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: DT.textSecondary,
    marginTop: 0,
  },

  // ═══ Form Matrix ═══
  formMatrix: {
    gap: 16,
  },
  inputGroup: {
    // gap handled by parent
  },
  inputLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 11,
    fontWeight: '700',
    color: DT.textSecondary,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 14,
  },
  inputIconLeft: {
    marginRight: 10,
    width: 18,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: DT.textPrimary,
    paddingVertical: 0,
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    fontWeight: '500',
    color: DT.errorRed,
    marginTop: 5,
    paddingLeft: 2,
  },

  // Locate Me inline button
  locateMeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DT.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 4,
  },
  locateMeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  // ═══ Sticky Footer ═══
  stickyFooter: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: DT.componentBg,
    borderTopWidth: 1,
    borderTopColor: DT.borderGray,
  },
  submitBtn: {
    width: '100%',
    height: 52,
    borderRadius: 10,
    backgroundColor: DT.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.medium,
    minHeight: 52,
  },
  submitBtnDisabled: {
    backgroundColor: DT.primary,
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnPressed: {
    backgroundColor: DT.primaryDark,
    transform: [{ scale: 0.985 }],
  },
  submitBtnText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  submitBtnTextDisabled: {
    color: '#FFFFFF',
    opacity: 0.7,
  },
  legalText: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: DT.placeholder,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 15,
    paddingHorizontal: 8,
  },
  legalLink: {
    color: DT.primary,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
});
