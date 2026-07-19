import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
  Dimensions,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Shadows } from '../constants/Theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH > 600;
const ILLUS_SIZE = isTablet ? 320 : 260;

// ─── Slide 1: Worker orbit data ───────────────────────────────────────────────
const WORKERS = [
  { icon: 'plumbing',            label: 'Plumber',     color: '#0891B2', bg: '#E0F7FA', angle: -130 },
  { icon: 'electrical-services', label: 'Electrician', color: '#F59E0B', bg: '#FEF3C7', angle: -50  },
  { icon: 'handyman',            label: 'Carpenter',   color: '#7C3AED', bg: '#EDE9FE', angle: 50   },
  { icon: 'format-paint',        label: 'Painter',     color: '#E11D48', bg: '#FFE4E6', angle: 130  },
  { icon: 'construction',        label: 'Mason',       color: '#0F766E', bg: '#CCFBF1', angle: 180  },
] as const;

function getPosition(angle: number, radius: number) {
  const rad = (angle * Math.PI) / 180;
  return { left: radius * Math.cos(rad), top: radius * Math.sin(rad) };
}

// ─── Illustration Sub-components ──────────────────────────────────────────────

function WorkerBubble({ icon, label, color, bg, angle, radius }: {
  icon: string; label: string; color: string; bg: string; angle: number; radius: number;
}) {
  const pos = getPosition(angle, radius);
  const size = isTablet ? 72 : 60;
  return (
    <View style={[
      styles.workerBubble,
      {
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: bg, left: pos.left - size / 2,
        top: pos.top - size / 2, borderColor: color + '30',
      },
      Shadows.small,
    ]}>
      <MaterialIcons name={icon as any} size={isTablet ? 26 : 22} color={color} />
      <Text style={[styles.workerLabel, { color }]}>{label}</Text>
    </View>
  );
}

// ── Slide 1: Customer searching for workers ───────────────────────────────────
function Slide1Illustration() {
  const radius = isTablet ? 118 : 96;
  const cx = isTablet ? 96 : 80;
  return (
    <View style={[styles.illustrationBg, { backgroundColor: '#EFF6FF' }]}>
      <View style={styles.mountainLeft} />
      <View style={styles.mountainRight} />
      <View style={styles.mountainMid} />
      <View style={[styles.orbitRing, {
        width: radius * 2 + 16, height: radius * 2 + 16, borderRadius: radius + 8,
      }]} />
      {WORKERS.map(w => <WorkerBubble key={w.label} {...w} radius={radius} />)}
      <View style={[styles.customerOuter, { width: cx, height: cx, borderRadius: cx / 2 }, Shadows.large]}>
        <View style={[styles.customerInner, {
          width: cx * 0.72, height: cx * 0.72, borderRadius: (cx * 0.72) / 2,
        }]}>
          <MaterialIcons name="person-search" size={isTablet ? 42 : 34} color={Colors.primary} />
        </View>
        <View style={[styles.pulseRing, { width: cx + 16, height: cx + 16, borderRadius: (cx + 16) / 2 }]} />
      </View>
    </View>
  );
}

// ── Slide 2: Verified professional profile card ───────────────────────────────
function Slide2Illustration() {
  const cardW = ILLUS_SIZE * 0.74;
  const avatarSz = isTablet ? 62 : 52;
  return (
    <View style={[styles.illustrationBg, { backgroundColor: '#FFF7ED' }]}>
      <View style={[styles.hill, {
        backgroundColor: '#FED7AA', width: ILLUS_SIZE * 0.55, height: ILLUS_SIZE * 0.22,
        left: -8, borderTopRightRadius: ILLUS_SIZE * 0.22, borderTopLeftRadius: ILLUS_SIZE * 0.08,
      }]} />
      <View style={[styles.hill, {
        backgroundColor: '#FDE68A', width: ILLUS_SIZE * 0.45, height: ILLUS_SIZE * 0.17,
        right: -8, borderTopLeftRadius: ILLUS_SIZE * 0.22, borderTopRightRadius: ILLUS_SIZE * 0.08,
      }]} />

      <View style={[styles.profileCard, { width: cardW }, Shadows.large]}>
        <View style={{ alignItems: 'center', marginBottom: isTablet ? 10 : 7 }}>
          <View style={{ position: 'relative', marginBottom: 6 }}>
            <View style={[styles.avatarCircle, { width: avatarSz, height: avatarSz, borderRadius: avatarSz / 2 }]}>
              <Text style={[styles.avatarInitials, { fontSize: isTablet ? 20 : 17 }]}>RK</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <MaterialIcons name="verified" size={isTablet ? 16 : 14} color="#16A34A" />
            </View>
          </View>
          <Text style={styles.profileName}>Ram Kumar</Text>
          <View style={styles.professionPill}>
            <Text style={styles.professionText}>Plumber · 8 yrs exp</Text>
          </View>
        </View>

        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map(i => (
            <MaterialIcons key={i} name="star" size={isTablet ? 15 : 13} color="#F59E0B" />
          ))}
          <Text style={styles.ratingText}>  4.9 (128)</Text>
        </View>

        <View style={styles.profileDivider} />

        {['Background Checked', 'Govt. ID Verified'].map(f => (
          <View key={f} style={styles.featureRow}>
            <MaterialIcons name="check-circle" size={isTablet ? 14 : 12} color="#16A34A" />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Slide 3: Post a job & get quick responses ─────────────────────────────────
function Slide3Illustration() {
  const cardW = ILLUS_SIZE * 0.76;
  const bubbleW = ILLUS_SIZE * 0.70;
  return (
    <View style={[styles.illustrationBg, { backgroundColor: '#F0FDF4' }]}>
      <View style={[styles.hill, {
        backgroundColor: '#BBF7D0', width: ILLUS_SIZE * 0.55, height: ILLUS_SIZE * 0.2,
        left: -8, borderTopRightRadius: ILLUS_SIZE * 0.2, borderTopLeftRadius: ILLUS_SIZE * 0.06,
      }]} />
      <View style={[styles.hill, {
        backgroundColor: '#A7F3D0', width: ILLUS_SIZE * 0.45, height: ILLUS_SIZE * 0.16,
        right: -8, borderTopLeftRadius: ILLUS_SIZE * 0.2, borderTopRightRadius: ILLUS_SIZE * 0.06,
      }]} />

      <View style={styles.slide3Stack}>
        <View style={[styles.jobCard, { width: cardW }, Shadows.medium]}>
          <View style={styles.jobCardHeader}>
            <MaterialIcons name="check-circle" size={isTablet ? 16 : 14} color="#16A34A" />
            <Text style={styles.jobPostedLabel}> Job Posted!</Text>
          </View>
          <Text style={styles.jobTitle}>Fix Kitchen Sink</Text>
          <View style={styles.jobMetaRow}>
            <MaterialIcons name="location-on" size={10} color={Colors.textSecondary} />
            <Text style={styles.jobMetaText}> Kathmandu</Text>
            <Text style={styles.metaDot}> · </Text>
            <Text style={styles.jobMetaText}>NPR 500–800</Text>
          </View>
        </View>

        <View style={[styles.chatBubble, { width: bubbleW, backgroundColor: '#FFFFFF' }, Shadows.small]}>
          <Text style={styles.chatText}>Available in 30 mins! 👋</Text>
          <Text style={styles.chatAuthor}>— Rajesh K.</Text>
        </View>

        <View style={[styles.chatBubble, { width: bubbleW, backgroundColor: Colors.primaryLight }, Shadows.small]}>
          <Text style={[styles.chatText, { color: Colors.primary }]}>I&apos;ll do it for NPR 600 ✓</Text>
          <Text style={[styles.chatAuthor, { color: '#0D9488' }]}>— Suresh T.</Text>
        </View>

        <View style={styles.responseChip}>
          <MaterialIcons name="timer" size={11} color={Colors.primary} />
          <Text style={styles.responseChipText}>  Avg. 5 min response</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Slides Config ────────────────────────────────────────────────────────────
type SlideConfig = { title: string; description: string; Illustration: React.FC };

const SLIDES: SlideConfig[] = [
  {
    title: 'Find Skilled Workers Easily',
    description:
      'Search and book trusted workers near your location within minutes. Browse verified professionals across multiple service categories.',
    Illustration: Slide1Illustration,
  },
  {
    title: 'Verified & Trusted Professionals',
    description:
      'Every worker is background-checked, rated and reviewed by real customers before they join our platform.',
    Illustration: Slide2Illustration,
  },
  {
    title: 'Post a Job in Seconds',
    description:
      'Describe your task, set your budget and receive quotes from nearby workers within minutes.',
    Illustration: Slide3Illustration,
  },
];

// ─── Dot Indicators ───────────────────────────────────────────────────────────
function DotIndicators({ total, active }: { total: number; active: number }) {
  return (
    <View style={styles.dotRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.dot, i === active ? styles.dotActive : styles.dotInactive]} />
      ))}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const illustrationOpacity = useRef(new Animated.Value(0)).current;
  const illustrationScale   = useRef(new Animated.Value(0.92)).current;
  const contentOpacity      = useRef(new Animated.Value(0)).current;
  const contentTranslateX   = useRef(new Animated.Value(30)).current;
  const contentTranslateY   = useRef(new Animated.Value(16)).current;
  const buttonOpacity       = useRef(new Animated.Value(0)).current;

  // Entrance animation — fires on mount and on every slide change
  useEffect(() => {
    illustrationOpacity.setValue(0);
    illustrationScale.setValue(0.92);
    contentOpacity.setValue(0);
    contentTranslateX.setValue(30);
    contentTranslateY.setValue(16);
    buttonOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(illustrationOpacity, {
        toValue: 1, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true,
      }),
      Animated.spring(illustrationScale, {
        toValue: 1, friction: 7, tension: 40, useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(contentOpacity, {
            toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true,
          }),
          Animated.timing(contentTranslateX, {
            toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true,
          }),
          Animated.timing(contentTranslateY, {
            toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(buttonOpacity, {
          toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true,
        }),
      ]),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide]);

  // Exit animation → callback
  const playExit = (onDone: () => void) => {
    Animated.parallel([
      Animated.timing(illustrationOpacity, {
        toValue: 0, duration: 200, easing: Easing.in(Easing.quad), useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 0, duration: 180, easing: Easing.in(Easing.quad), useNativeDriver: true,
      }),
      Animated.timing(buttonOpacity, {
        toValue: 0, duration: 140, easing: Easing.in(Easing.quad), useNativeDriver: true,
      }),
      Animated.timing(contentTranslateX, {
        toValue: -20, duration: 200, easing: Easing.in(Easing.quad), useNativeDriver: true,
      }),
    ]).start(() => onDone());
  };

  const finishOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    } catch (e) {
      console.error('Failed to save onboarding state', e);
    }
    router.replace('/role-selection');
  };

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      playExit(() => setCurrentSlide(s => s + 1));
    } else {
      playExit(finishOnboarding);
    }
  };

  const handleSkip = () => playExit(finishOnboarding);

  const slide = SLIDES[currentSlide];
  const { Illustration } = slide;
  const isLastSlide = currentSlide === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View />
        {!isLastSlide && (
          <Pressable style={styles.skipBtn} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}
      </View>

      {/* Illustration */}
      <View style={styles.illustrationContainer}>
        <Animated.View style={{
          opacity: illustrationOpacity,
          transform: [{ scale: illustrationScale }],
        }}>
          <Illustration />
        </Animated.View>
      </View>

      {/* Text content */}
      <Animated.View style={[styles.contentSection, {
        opacity: contentOpacity,
        transform: [{ translateX: contentTranslateX }, { translateY: contentTranslateY }],
      }]}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </Animated.View>

      {/* Bottom: dots + button */}
      <Animated.View style={[styles.bottomSection, { opacity: buttonOpacity }]}>
        <DotIndicators total={SLIDES.length} active={currentSlide} />
        <Pressable
          style={({ pressed }) => [styles.nextBtn, pressed && styles.nextBtnPressed]}
          onPress={handleNext}
          android_ripple={{ color: 'rgba(255,255,255,0.18)', borderless: false }}
        >
          <Text style={styles.nextBtnText}>{isLastSlide ? 'Get Started' : 'Next'}</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 6 }} />
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
    paddingBottom: isTablet ? 40 : 28,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: isTablet ? 20 : 12,
    paddingBottom: 8,
    minHeight: isTablet ? 52 : 44,
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.primary,
  },
  skipText: {
    fontFamily: 'Inter-Medium',
    fontSize: isTablet ? 15 : 14,
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
  illustrationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Shared illustration base
  illustrationBg: {
    width: ILLUS_SIZE,
    height: ILLUS_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: isTablet ? 56 : 44,
    overflow: 'hidden',
    position: 'relative',
  },
  hill: {
    position: 'absolute',
    bottom: 0,
  },

  // Slide 1
  mountainLeft: {
    position: 'absolute',
    bottom: 0, left: -10,
    width: ILLUS_SIZE * 0.45,
    height: ILLUS_SIZE * 0.28,
    backgroundColor: '#D1FAE5',
    borderTopRightRadius: ILLUS_SIZE * 0.22,
    borderTopLeftRadius: ILLUS_SIZE * 0.10,
    opacity: 0.7,
  },
  mountainRight: {
    position: 'absolute',
    bottom: 0, right: -10,
    width: ILLUS_SIZE * 0.45,
    height: ILLUS_SIZE * 0.22,
    backgroundColor: '#A7F3D0',
    borderTopLeftRadius: ILLUS_SIZE * 0.22,
    borderTopRightRadius: ILLUS_SIZE * 0.10,
    opacity: 0.6,
  },
  mountainMid: {
    position: 'absolute',
    bottom: 0, alignSelf: 'center',
    width: ILLUS_SIZE * 0.5,
    height: ILLUS_SIZE * 0.18,
    backgroundColor: '#6EE7B7',
    borderTopLeftRadius: ILLUS_SIZE * 0.25,
    borderTopRightRadius: ILLUS_SIZE * 0.25,
    opacity: 0.4,
  },
  orbitRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(15,118,110,0.12)',
    borderStyle: 'dashed',
  },
  workerBubble: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    paddingVertical: 2,
  },
  workerLabel: {
    fontSize: isTablet ? 8 : 7,
    fontFamily: 'Inter-SemiBold',
    marginTop: 1,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  customerOuter: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  customerInner: {
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(15,118,110,0.10)',
    backgroundColor: 'transparent',
  },

  // Slide 2
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: isTablet ? 20 : 16,
    paddingVertical: isTablet ? 16 : 12,
    paddingHorizontal: isTablet ? 16 : 12,
    alignItems: 'center',
  },
  avatarCircle: {
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: Colors.primary,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2, right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 1,
  },
  profileName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: isTablet ? 15 : 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  professionPill: {
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  professionText: {
    fontFamily: 'Inter-Medium',
    fontSize: isTablet ? 11 : 9,
    fontWeight: '500',
    color: '#2563EB',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    fontFamily: 'Inter-Medium',
    fontSize: isTablet ? 11 : 10,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  profileDivider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  featureText: {
    fontFamily: 'Inter-Regular',
    fontSize: isTablet ? 11 : 10,
    color: Colors.textSecondary,
  },

  // Slide 3
  slide3Stack: {
    alignItems: 'center',
    gap: isTablet ? 8 : 6,
    paddingHorizontal: 10,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: isTablet ? 16 : 12,
    paddingVertical: isTablet ? 12 : 9,
    paddingHorizontal: isTablet ? 14 : 11,
  },
  jobCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  jobPostedLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: isTablet ? 13 : 11,
    fontWeight: '600',
    color: '#16A34A',
  },
  jobTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: isTablet ? 15 : 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  jobMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobMetaText: {
    fontFamily: 'Inter-Regular',
    fontSize: isTablet ? 11 : 9,
    color: Colors.textSecondary,
  },
  metaDot: {
    fontFamily: 'Inter-Regular',
    fontSize: 9,
    color: Colors.textSecondary,
  },
  chatBubble: {
    borderRadius: isTablet ? 12 : 10,
    paddingVertical: isTablet ? 8 : 6,
    paddingHorizontal: isTablet ? 12 : 10,
  },
  chatText: {
    fontFamily: 'Inter-Regular',
    fontSize: isTablet ? 12 : 10,
    color: Colors.textPrimary,
  },
  chatAuthor: {
    fontFamily: 'Inter-Medium',
    fontSize: isTablet ? 10 : 9,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginTop: 1,
  },
  responseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  responseChipText: {
    fontFamily: 'Inter-Medium',
    fontSize: isTablet ? 11 : 9,
    fontWeight: '500',
    color: Colors.primary,
  },

  // Content
  contentSection: {
    alignItems: 'center',
    paddingTop: isTablet ? 32 : 24,
    paddingBottom: isTablet ? 28 : 20,
    paddingHorizontal: isTablet ? 20 : 0,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: isTablet ? 30 : 24,
    lineHeight: isTablet ? 38 : 32,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: isTablet ? 14 : 10,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: isTablet ? 16 : 14,
    lineHeight: isTablet ? 26 : 22,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: isTablet ? 480 : 320,
  },

  // Bottom bar
  bottomSection: {
    alignItems: 'center',
    gap: isTablet ? 24 : 20,
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  dot: {
    borderRadius: 99,
  },
  dotActive: {
    width: 24, height: 8,
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  dotInactive: {
    width: 8, height: 8,
    backgroundColor: Colors.disabled,
  },
  nextBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: isTablet ? 18 : 15,
    borderRadius: 16,
    ...Shadows.medium,
  },
  nextBtnPressed: {
    opacity: 0.88,
  },
  nextBtnText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});


