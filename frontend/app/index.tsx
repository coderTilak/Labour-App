import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Shadows } from '../constants/Theme';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH > 600;

export default function SplashScreen() {
  const { user, userRole, loading } = useAuth();

  // Animation triggers
  const logoFadeAnim = useRef(new Animated.Value(0)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.85)).current;
  const logoTranslateY = useRef(new Animated.Value(20)).current;
  
  const taglineFadeAnim = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(12)).current;
  
  const bottomFadeAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Logo and Title fade & scale entry
    Animated.parallel([
      Animated.timing(logoFadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 35,
        useNativeDriver: true,
      }),
      Animated.timing(logoTranslateY, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Tagline fade-in (staggered delay of 350ms)
    Animated.sequence([
      Animated.delay(350),
      Animated.parallel([
        Animated.timing(taglineFadeAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(taglineTranslateY, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 3. Bottom container fade-in (staggered delay of 650ms)
    Animated.sequence([
      Animated.delay(650),
      Animated.timing(bottomFadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // 4. Infinite rotation loop for spinner
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

  }, [logoFadeAnim, logoScaleAnim, logoTranslateY, taglineFadeAnim, taglineTranslateY, bottomFadeAnim, spinAnim]);

  useEffect(() => {
    // Only navigate after both loading finishes and animations have played for a bit
    if (loading) return;

    const navTimeout = setTimeout(async () => {
      if (user) {
        if (userRole) {
          router.replace(`/${userRole === 'customer' ? '(customer)/home' : `(${userRole})/profile-setup`}` as any);
        } else {
          router.replace('/role-selection');
        }
      } else {
        router.replace('/onboarding');
      }
    }, 2500);

    return () => clearTimeout(navTimeout);
  }, [loading, user, userRole]);

  // Interpolate spin value to degrees
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Perfect vertical centered brand wrapper */}
      <View style={styles.centerContainer}>
        {/* Animated Logo Section */}
        <Animated.View
          style={[
            styles.logoAnimationWrapper,
            {
              opacity: logoFadeAnim,
              transform: [
                { scale: logoScaleAnim },
                { translateY: logoTranslateY }
              ],
            },
          ]}
        >
          {/* Custom Network Orbit Graphic */}
          <View style={styles.orbitContainer}>
            {/* Outer dotted circle */}
            <View style={styles.dashedOrbit} />
            
            {/* Connection Node Dots */}
            <View style={[styles.connectorNode, styles.nodeTop, { backgroundColor: Colors.accent }]} />
            <View style={[styles.connectorNode, styles.nodeRight, { backgroundColor: Colors.primary }]} />
            <View style={[styles.connectorNode, styles.nodeBottom, { backgroundColor: Colors.accent }]} />
            <View style={[styles.connectorNode, styles.nodeLeft, { backgroundColor: Colors.primary }]} />

            {/* Central Soft Emblem Card */}
            <View style={[styles.logoCard, Shadows.large]}>
              <View style={styles.logoInnerCircle}>
                <MaterialIcons
                  name="engineering"
                  size={isTablet ? 48 : 38}
                  color={Colors.primary}
                />
              </View>
            </View>
          </View>

          {/* App Brand Name */}
          <Text style={styles.brandTitle}>Labour Connect Nepal</Text>
        </Animated.View>

        {/* Staggered Animated Tagline */}
        <Animated.View
          style={{
            opacity: taglineFadeAnim,
            transform: [{ translateY: taglineTranslateY }],
            alignItems: 'center',
          }}
        >
          <Text style={styles.tagline}>
            Connecting Skilled Workers Across Nepal
          </Text>
        </Animated.View>
      </View>

      {/* Bottom Loading & Info Section */}
      <Animated.View style={[styles.bottomContainer, { opacity: bottomFadeAnim }]}>
        {/* Modern MD3 Circular Progress Spinner */}
        <Animated.View
          style={[
            styles.spinner,
            { transform: [{ rotate: spin }] },
          ]}
        />
        
        {/* App Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoAnimationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitContainer: {
    width: isTablet ? 180 : 140,
    height: isTablet ? 180 : 140,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: isTablet ? 24 : 16,
  },
  dashedOrbit: {
    position: 'absolute',
    width: isTablet ? 170 : 130,
    height: isTablet ? 170 : 130,
    borderRadius: isTablet ? 85 : 65,
    borderWidth: 1.5,
    borderColor: 'rgba(15, 118, 110, 0.15)',
    borderStyle: 'dashed',
  },
  connectorNode: {
    position: 'absolute',
    width: isTablet ? 10 : 8,
    height: isTablet ? 10 : 8,
    borderRadius: isTablet ? 5 : 4,
    borderWidth: 1.5,
    borderColor: '#F8FAFC',
  },
  nodeTop: {
    top: isTablet ? 0 : 1,
    alignSelf: 'center',
  },
  nodeRight: {
    right: isTablet ? 0 : 1,
    top: '50%',
    marginTop: isTablet ? -5 : -4,
  },
  nodeBottom: {
    bottom: isTablet ? 0 : 1,
    alignSelf: 'center',
  },
  nodeLeft: {
    left: isTablet ? 0 : 1,
    top: '50%',
    marginTop: isTablet ? -5 : -4,
  },
  logoCard: {
    width: isTablet ? 116 : 92,
    height: isTablet ? 116 : 92,
    borderRadius: isTablet ? 36 : 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoInnerCircle: {
    width: isTablet ? 82 : 64,
    height: isTablet ? 82 : 64,
    borderRadius: isTablet ? 41 : 32,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    marginTop: isTablet ? 32 : 24,
    fontSize: isTablet ? 36 : 26,
    lineHeight: isTablet ? 44 : 32,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  tagline: {
    marginTop: 12,
    fontSize: isTablet ? 18 : 14,
    lineHeight: isTablet ? 26 : 20,
    fontWeight: '400',
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: isTablet ? 64 : 32,
    maxWidth: isTablet ? 500 : 320,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: isTablet ? 64 : 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: 'rgba(15, 118, 110, 0.12)',
    borderTopColor: Colors.primary,
    borderRightColor: Colors.primary,
    marginBottom: 16,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    color: Colors.placeholder,
    letterSpacing: 0.5,
  },
});
