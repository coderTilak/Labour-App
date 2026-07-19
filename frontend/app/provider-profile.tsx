import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
  Image,
  Dimensions,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../utils/supabase';

// Design Tokens
const DT = {
  bgBase: '#F8FAFC',
  primary: '#0F766E',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  componentBg: '#FFFFFF',
  borderGray: '#E2E8F0',
  lightBg: '#F1F5F9',
  verifiedBadge: '#10B981',
  starRating: '#F59E0B',
  availabilityBg: '#F0FDF4',
  availabilityText: '#166534',
  reviewText: '#475569',
  reviewTextSub: '#94A3B8',
};

const HEADER_SCROLL_DISTANCE = 100;

export default function ProviderProfileScreen() {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isFavorite, setIsFavorite] = useState(false);

  // Dynamic route search parameters
  const { provider_id, provider_type, user_id } = useLocalSearchParams<{
    provider_id?: string;
    provider_type?: string;
    user_id?: string;
  }>();

  // Profile data states with fallback defaults
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('Ram Bahadur Thapa');
  const [title, setTitle] = useState('Professional Mason');
  const [city, setCity] = useState('Lazimpat');
  const [rating, setRating] = useState(4.8);
  const [reviewCount, setReviewCount] = useState(26);
  const [experience, setExperience] = useState('5+ Years');
  const [about, setAbout] = useState(
    'Specialized in structural bricklaying, wall plastering, cement mixtures, and modern tile installations. Offering dependable residential and commercial labor across Kathmandu for over five years.'
  );
  const [skills, setSkills] = useState<string[]>([
    'Brick Work',
    'Plastering',
    'Tile Work',
    'Concrete Pouring',
    'Renovation',
  ]);
  const [phone, setPhone] = useState('+977 9800000000');
  const [whatsappNo, setWhatsappNo] = useState('');
  const [isVerified, setIsVerified] = useState(true);

  useEffect(() => {
    async function loadProviderDetails() {
      if (!provider_id || !provider_type) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let query;
        if (provider_type === 'company') {
          query = supabase
            .from('company_profiles')
            .select('*')
            .eq('id', provider_id);
        } else {
          query = supabase
            .from('worker_profiles')
            .select('*')
            .eq('id', provider_id);
        }

        const { data, error } = await query.single();
        if (data && !error) {
          if (provider_type === 'company') {
            setName(data.company_name || 'Unknown Company');
            setTitle('Verified Construction Agency');
            setPhone(data.contact_no || data.phone_number || '');
            setWhatsappNo(data.whatsapp_no || '');
            setCity(data.city || 'Kathmandu');
            setRating(data.average_rating || 5.0);
            setReviewCount(data.total_jobs_completed || 0);
            setExperience('Company Fleet');
            setAbout(
              data.bio ||
                'Professional agency offering high-quality skilled labor fleet services in Kathmandu and nearby cities.'
            );
            setIsVerified(data.verification_status === 'approved');
          } else {
            setName(data.full_name || 'Unknown Worker');
            setTitle('Independent Tradesperson');
            setPhone(data.contact_no || data.phone_number || '');
            setWhatsappNo(data.whatsapp_no || '');
            setCity(data.city || 'Kathmandu');
            setRating(data.average_rating || 5.0);
            setReviewCount(data.total_jobs_completed || 0);
            setExperience('Independent');
            setAbout(
              data.bio ||
                'Skilled independent worker offering reliable, high-quality local trades services at standard hourly/daily rates.'
            );
            setIsVerified(data.verification_status === 'approved');
          }

          // Fetch associated skills/services
          const targetUserId = data.user_id;
          if (targetUserId) {
            const { data: pServices } = await supabase
              .from('provider_services')
              .select('category_id')
              .eq('provider_user_id', targetUserId);

            if (pServices && pServices.length > 0) {
              const catIds = pServices.map((s) => s.category_id);
              const { data: cats } = await supabase
                .from('categories')
                .select('display_name')
                .in('id', catIds);
              if (cats && cats.length > 0) {
                setSkills(cats.map((c) => c.display_name));
              }
            }
          }
        }
      } catch (err) {
        console.error('Error loading provider profile details:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProviderDetails();
  }, [provider_id, provider_type]);

  // Animate header background opacity based on scroll
  const headerBgOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const headerBorderOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleShare = () => {
    Alert.alert('Share Profile', `Share profile of ${name} with your friends!`);
  };

  const handleWhatsApp = () => {
    let targetPhone = whatsappNo || phone;
    if (!targetPhone) {
      Alert.alert('Contact Details', 'No contact number or WhatsApp number found.');
      return;
    }
    
    // Clean phone number: remove non-digits, keep '+'
    let cleanPhone = targetPhone.replace(/[^0-9+]/g, '');
    
    // Auto-prefix Nepal country code if it is 10 digits and starts with 9 (e.g. 9841234567 -> 9779841234567)
    if (cleanPhone.length === 10 && cleanPhone.startsWith('9')) {
      cleanPhone = '977' + cleanPhone;
    } else if (cleanPhone.startsWith('+')) {
      cleanPhone = cleanPhone.replace('+', '');
    }

    const url = `https://wa.me/${cleanPhone}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(url).catch(() => {
          Alert.alert('Contact Details', `Could not open WhatsApp. Phone number: ${targetPhone}`);
        });
      }
    });
  };

  const handleBookNow = () => {
    router.push({
      pathname: '/(customer)/book-service',
      params: {
        provider_id: provider_id || '',
        provider_name: name,
        provider_title: title,
        provider_type: provider_type || 'worker',
      },
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: DT.bgBase }}>
        <ActivityIndicator size="large" color={DT.primary} />
        <Text style={{ marginTop: 12, color: DT.textSecondary, fontFamily: 'Inter-Medium' }}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 1. Sticky Custom Top Navigation Bar */}
      <Animated.View
        style={[
          styles.header,
          {
            paddingTop: insets.top,
            height: 56 + insets.top,
            backgroundColor: headerBgOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 1)'],
            }),
            borderBottomColor: DT.borderGray,
            borderBottomWidth: headerBorderOpacity,
          },
        ]}
      >
        <View style={styles.headerContent}>
          {/* Left Block: Back Button */}
          <Pressable
            style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(customer)/home' as any);
              }
            }}
            hitSlop={12}
          >
            <MaterialIcons name="arrow-back" size={20} color={DT.textPrimary} />
          </Pressable>

          {/* Center Block: Title */}
          <Animated.Text
            style={[
              styles.headerTitle,
              { opacity: headerBgOpacity },
            ]}
          >
            {name}
          </Animated.Text>

          {/* Right Block: Share & Favorite */}
          <View style={styles.headerRight}>
            <Pressable
              style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
              onPress={handleShare}
              hitSlop={12}
            >
              <MaterialIcons name="share" size={20} color={DT.textPrimary} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.iconButtonPressed,
              ]}
              onPress={() => setIsFavorite(!isFavorite)}
              hitSlop={12}
            >
              <MaterialIcons
                name={isFavorite ? 'favorite' : 'favorite-outline'}
                size={20}
                color={isFavorite ? '#EF4444' : DT.textPrimary}
              />
            </Pressable>
          </View>
        </View>
      </Animated.View>

      {/* 2. Scrollable Profile Body Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingTop: 56 + insets.top, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Identity Header Card */}
        <View style={styles.heroCard}>
          <View style={styles.profileImageContainer}>
            {/* Fallback avatar if no image */}
            <View style={styles.profileAvatarFallback}>
              <MaterialIcons
                name={provider_type === 'company' ? 'business' : 'person'}
                size={48}
                color={DT.textSecondary}
              />
            </View>
            {isVerified && (
              <View style={styles.verifiedBadge}>
                <MaterialIcons name="verified-user" size={12} color="#FFFFFF" />
              </View>
            )}
          </View>

          <Text style={styles.providerName}>{name}</Text>
          <Text style={styles.providerTitle}>{title}</Text>

          {/* Meta Stats Inline Row */}
          <View style={styles.metaStatsRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{rating.toFixed(1)} ★</Text>
              <Text style={styles.statLabel}>({reviewCount} Jobs)</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{experience}</Text>
              <Text style={styles.statLabel}>Contract Type</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{city}</Text>
              <Text style={styles.statLabel}>Location</Text>
            </View>
          </View>
        </View>

        {/* Availability Status Ribbon */}
        <View style={styles.availabilityRibbon}>
          <View style={styles.pulsingDot} />
          <Text style={styles.availabilityText}>Available Now for Bookings Today</Text>
        </View>

        {/* About Section Content Box */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>About Me</Text>
          <Text style={styles.aboutText}>{about}</Text>
        </View>

        {/* Contact Information Box */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Contact Information</Text>
          <View style={{ gap: 10, marginTop: 8 }}>
            {phone ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <MaterialIcons name="phone" size={20} color={DT.primary} />
                <Text style={{ fontSize: 14, color: DT.textPrimary, fontFamily: 'Inter-Medium' }}>
                  Phone: {phone}
                </Text>
              </View>
            ) : null}
            
            {whatsappNo || (provider_type !== 'company' && phone) ? (
              <Pressable 
                onPress={handleWhatsApp}
                style={({ pressed }) => [
                  { flexDirection: 'row', alignItems: 'center', gap: 10 },
                  pressed && { opacity: 0.7 }
                ]}
              >
                <FontAwesome5 name="whatsapp" size={20} color="#16A34A" />
                <Text style={{ fontSize: 14, color: '#16A34A', fontFamily: 'Inter-Bold', textDecorationLine: 'underline' }}>
                  WhatsApp: {whatsappNo || phone}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Skills & Core Specializations Tags Matrix */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Skills & Specializations</Text>
          <View style={styles.tagsMatrix}>
            {skills.map((skill, index) => (
              <View key={index} style={styles.tagChip}>
                <Text style={styles.tagText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Ratings & Reviews Aggregated Feed Summary Block */}
        <View style={[styles.sectionContainer, { marginBottom: 24 }]}>
          <Text style={styles.sectionHeader}>Customer Reviews ({reviewCount > 0 ? reviewCount : 1})</Text>

          <View style={styles.reviewItem}>
            <View style={styles.reviewLine1}>
              <Text style={styles.reviewerName}>Sajan Shrestha</Text>
              <View style={styles.reviewMeta}>
                <Text style={styles.reviewStars}>5.0 ★</Text>
                <Text style={styles.reviewDate}>20 May 2024</Text>
              </View>
            </View>
            <Text style={styles.reviewBody}>
              Excellent and reliable work completed. Arrived perfectly on time, extremely professional, and left the workspace clean. Highly recommended!
            </Text>
          </View>
        </View>
      </Animated.ScrollView>

      {/* 3. Fixed Bottom Call-To-Action Persistent Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={({ pressed }) => [
            styles.whatsappBtn,
            pressed && { opacity: 0.85 },
          ]}
          onPress={handleWhatsApp}
          hitSlop={8}
        >
          <FontAwesome5 name="whatsapp" size={24} color="#FFFFFF" />
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.bookBtn,
            pressed && { opacity: 0.85 },
          ]}
          onPress={handleBookNow}
        >
          <Text style={styles.bookBtnText}>Book Service Now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DT.bgBase,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  iconButton: {
    width: 36,
    height: 36,
    backgroundColor: DT.componentBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: DT.borderGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonPressed: {
    backgroundColor: DT.lightBg,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: DT.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  scrollView: {
    flex: 1,
  },
  heroCard: {
    backgroundColor: DT.componentBg,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: DT.borderGray,
    alignItems: 'center',
  },
  profileImageContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: DT.lightBg,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  profileAvatarFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: DT.verifiedBadge,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: DT.componentBg,
  },
  providerName: {
    marginTop: 12,
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: DT.textPrimary,
  },
  providerTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: DT.primary,
    marginTop: 4,
  },
  metaStatsRow: {
    marginTop: 16,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    borderTopWidth: 1,
    borderTopColor: DT.lightBg,
    paddingTop: 12,
  },
  statBlock: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: DT.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: DT.textSecondary,
    marginTop: 2,
  },
  availabilityRibbon: {
    backgroundColor: DT.availabilityBg,
    margin: 16,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DT.verifiedBadge,
    marginRight: 8,
  },
  availabilityText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: DT.availabilityText,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: DT.textPrimary,
    marginBottom: 6,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
    color: DT.reviewText,
  },
  tagsMatrix: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  tagChip: {
    backgroundColor: DT.lightBg,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: DT.textPrimary,
  },
  reviewItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: DT.borderGray,
  },
  reviewLine1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewerName: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: DT.textPrimary,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewStars: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    color: DT.starRating,
  },
  reviewDate: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
  },
  reviewBody: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: DT.reviewText,
    marginTop: 4,
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: DT.componentBg,
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 10,
  },
  whatsappBtn: {
    width: 56,
    height: 52,
    backgroundColor: '#16A34A',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookBtn: {
    flex: 1,
    height: 52,
    backgroundColor: DT.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: DT.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  bookBtnText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
