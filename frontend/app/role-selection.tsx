import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { Colors, Shadows } from '../constants/Theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH > 600;

// ─── Role Definitions ─────────────────────────────────────────────────────────
type RoleId = 'customer' | 'worker' | 'company';

interface RoleOption {
  id: RoleId;
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
  iconBg: string;
  iconColor: string;
}

const ROLES: RoleOption[] = [
  {
    id: 'customer',
    icon: 'apartment',
    title: 'Customer',
    subtitle: 'I want to hire skilled professionals or companies.',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
  },
  {
    id: 'worker',
    icon: 'handyman',
    title: 'Independent Worker',
    subtitle: 'I want to work independently and find direct jobs.',
    iconBg: '#FFF7ED',
    iconColor: '#EA580C',
  },
  {
    id: 'company',
    icon: 'business-center',
    title: 'Company',
    subtitle: 'I represent a labor service agency or organization.',
    iconBg: '#F0FDF4',
    iconColor: '#16A34A',
  },
];

// ─── Animated Role Card ───────────────────────────────────────────────────────
function RoleCard({
  role,
  selected,
  onPress,
  index,
}: {
  role: RoleOption;
  selected: boolean;
  onPress: () => void;
  index: number;
}) {
  // Entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  // Selection animation
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: 200 + index * 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay: 200 + index * 120,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateY, index]);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: selected ? 1.01 : 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(borderAnim, {
        toValue: selected ? 1 : 0,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();
  }, [selected, scaleAnim, borderAnim]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E2E8F0', Colors.primary],
  });

  const borderWidth = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  });

  const cardBg = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFFFFF', '#F0FDFA'],
  });

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY }, { scale: scaleAnim }],
      }}
    >
      <Pressable onPress={onPress}>
        <Animated.View
          style={[
            styles.roleCard,
            Shadows.small,
            {
              borderColor,
              borderWidth,
              backgroundColor: cardBg,
            },
          ]}
        >
          {/* Left Icon */}
          <View style={[styles.roleIconContainer, { backgroundColor: role.iconBg }]}>
            <MaterialIcons name={role.icon} size={isTablet ? 30 : 26} color={role.iconColor} />
          </View>

          {/* Text Content */}
          <View style={styles.roleTextContainer}>
            <Text style={styles.roleTitle}>{role.title}</Text>
            <Text style={styles.roleSubtitle}>{role.subtitle}</Text>
          </View>

          {/* Right Radio Indicator */}
          <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
            {selected && (
              <Animated.View style={styles.radioInner}>
                <MaterialIcons name="check" size={14} color="#FFFFFF" />
              </Animated.View>
            )}
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function RoleSelectionScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'customer' | 'worker' | 'company' | null>(null);
  const [loading, setLoading] = useState(false);

  // Header animation
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(20)).current;

  // Button animation
  const buttonFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Header entrance
    Animated.parallel([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Button fade in (delayed)
    Animated.sequence([
      Animated.delay(600),
      Animated.timing(buttonFade, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerFade, headerTranslateY, buttonFade]);

  const handleContinue = async () => {
    if (!selectedRole) return;
    setLoading(true);

    try {
      await AsyncStorage.setItem('pendingRole', selectedRole);

      if (user) {
        const { error } = await supabase.from('user_roles').upsert({
          user_id: user.id,
          role: selectedRole
        }, { onConflict: 'user_id' });

        if (error) {
          console.error('Error setting role:', error.message);
        }

        switch (selectedRole) {
          case 'customer':
            router.replace('/(customer)/profile-setup' as any);
            break;
          case 'worker':
            router.replace('/(worker)/profile-setup' as any);
            break;
          case 'company':
            router.replace('/(company)/profile-setup' as any);
            break;
        }
      } else {
        router.replace('/(auth)/sign-up' as any);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <Animated.View
        style={[
          styles.headerSection,
          {
            opacity: headerFade,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        {/* Small decorative badge */}
        <View style={styles.stepBadge}>
          <MaterialIcons name="person-outline" size={14} color={Colors.primary} />
          <Text style={styles.stepBadgeText}>Step 1 of 3</Text>
        </View>

        <Text style={styles.headerTitle}>Choose Your Role</Text>
        <Text style={styles.headerSubtitle}>
          Select the option that best describes your needs.
        </Text>
      </Animated.View>

      {/* Role Cards */}
      <View style={styles.cardsSection}>
        {ROLES.map((role, index) => (
          <RoleCard
            key={role.id}
            role={role}
            selected={selectedRole === role.id}
            onPress={() => setSelectedRole(role.id)}
            index={index}
          />
        ))}
      </View>

      {/* Bottom Section */}
      <Animated.View style={[styles.bottomSection, { opacity: buttonFade }]}>
        {/* Info hint */}
        <View style={styles.infoHint}>
          <MaterialIcons name="info-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.infoHintText}>You can change your role later in settings.</Text>
        </View>

        {/* Continue Button */}
        <Pressable
          style={({ pressed, hovered }: any) => [
            styles.continueBtn,
            !selectedRole && styles.continueBtnDisabled,
            hovered && selectedRole && styles.continueBtnHovered,
            pressed && selectedRole && styles.continueBtnPressed,
            loading && { opacity: 0.7 }
          ]}
          onPress={handleContinue}
          disabled={!selectedRole || loading}
          android_ripple={
            !selectedRole || loading
              ? undefined
              : { color: 'rgba(255,255,255,0.18)', borderless: false }
          }
        >
          <Text
            style={[
              styles.continueBtnText,
              !selectedRole && styles.continueBtnTextDisabled,
            ]}
          >
            {loading ? "Saving..." : "Continue"}
          </Text>
          <MaterialIcons
            name="arrow-forward"
            size={20}
            color="#FFFFFF"
            style={{ marginLeft: 8, opacity: !selectedRole ? 0.6 : 1 }}
          />
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: isTablet ? 40 : 24,
  },

  // ── Header ──
  headerSection: {
    paddingTop: isTablet ? 48 : 32,
    paddingBottom: isTablet ? 32 : 24,
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: isTablet ? 20 : 16,
    gap: 6,
  },
  stepBadgeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: isTablet ? 34 : 28,
    lineHeight: isTablet ? 42 : 36,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: isTablet ? 16 : 15,
    lineHeight: isTablet ? 24 : 22,
    color: Colors.textSecondary,
  },

  // ── Cards ──
  cardsSection: {
    flex: 1,
    justifyContent: 'center',
    gap: isTablet ? 16 : 14,
    paddingBottom: isTablet ? 24 : 16,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: isTablet ? 20 : 16,
    borderRadius: isTablet ? 18 : 16,
  },
  roleIconContainer: {
    width: isTablet ? 56 : 48,
    height: isTablet ? 56 : 48,
    borderRadius: isTablet ? 16 : 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isTablet ? 16 : 14,
  },
  roleTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  roleTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: isTablet ? 17 : 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  roleSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: isTablet ? 14 : 13,
    lineHeight: isTablet ? 20 : 18,
    color: Colors.textSecondary,
  },

  // ── Radio Indicator ──
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  radioInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Bottom ──
  bottomSection: {
    paddingBottom: isTablet ? 40 : 24,
    gap: isTablet ? 16 : 12,
  },
  infoHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  infoHintText: {
    fontFamily: 'Inter-Medium',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  continueBtn: {
    width: '100%',
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    ...Shadows.medium,
  },
  continueBtnDisabled: {
    backgroundColor: Colors.primary,
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueBtnHovered: {
    backgroundColor: '#0D6B64',
  },
  continueBtnPressed: {
    backgroundColor: '#0a4f4a',
    transform: [{ scale: 0.985 }],
  },
  continueBtnText: {
    fontFamily: 'Inter-Bold',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  continueBtnTextDisabled: {
    color: '#FFFFFF',
    opacity: 0.7,
  },
});
