import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  FlatList,
  ScrollView,
  Animated,
  Easing,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
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
  verifiedBadge: '#10B981',
  starRating: '#F59E0B',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface FilterPill {
  id: string;
  label: string;
}

interface ProviderBase {
  id: string;
  name: string;
  location: string;
  distance: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isBookmarked: boolean;
  isFeatured: boolean;
  completedJobs: number;
  userId: string;
}

interface IndependentWorker extends ProviderBase {
  type: 'independent';
}

interface ServiceCompany extends ProviderBase {
  type: 'company';
  workersAvailable: number;
}

type Provider = IndependentWorker | ServiceCompany;

// ─── Mock Data ────────────────────────────────────────────────────────────────
const FILTER_PILLS: FilterPill[] = [
  { id: 'nearest', label: 'Nearest Distance' },
  { id: 'rating', label: 'Rating 4.5+' },
  { id: 'verified', label: 'Verified Only' },
  { id: 'available', label: 'Available Now' },
  { id: 'lowprice', label: 'Low Price' },
];

// ─── Ranking Algorithm ────────────────────────────────────────────────────────
// 3-Tier Ranking: 1. Featured, 2. Proximity (Distance), 3. Performance (Jobs + Rating)
const rankProviders = (providers: Provider[]): Provider[] => {
  return [...providers].sort((a, b) => {
    // Tier 1: Promoted Featured Tiers
    if (a.isFeatured !== b.isFeatured) {
      return a.isFeatured ? -1 : 1;
    }
    
    // Tier 2: Spatial Proximity Metrics
    // Extract numerical distance from string like "2.1 km away"
    const distA = parseFloat(a.distance.split(' ')[0]) || 0;
    const distB = parseFloat(b.distance.split(' ')[0]) || 0;
    
    // If distance difference is significant (> 1km), sort by distance
    if (Math.abs(distA - distB) > 1.0) {
      return distA - distB;
    }
    
    // Tier 3: Work Performance Data
    // Score based on jobs completed and average rating
    const scoreA = (a.completedJobs * 0.5) + (a.rating * 10);
    const scoreB = (b.completedJobs * 0.5) + (b.rating * 10);
    
    return scoreB - scoreA;
  });
};

// ─── Skeleton Shimmer Component ───────────────────────────────────────────────
function SkeletonShimmer({ style }: { style: any }) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return <Animated.View style={[style, { opacity }]} />;
}

function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <SkeletonShimmer style={styles.skeletonAvatar} />
        <View style={styles.skeletonTextBlock}>
          <SkeletonShimmer style={styles.skeletonLine1} />
          <SkeletonShimmer style={styles.skeletonLine2} />
          <SkeletonShimmer style={styles.skeletonLine3} />
        </View>
        <View style={styles.skeletonActionBlock}>
          <SkeletonShimmer style={styles.skeletonBookmark} />
          <SkeletonShimmer style={styles.skeletonButton} />
        </View>
      </View>
    </View>
  );
}

// ─── Loading Skeleton View ────────────────────────────────────────────────────
function LoadingSkeletonView() {
  return (
    <View style={styles.skeletonContainer}>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </View>
  );
}

// ─── Zero Results Empty State View ────────────────────────────────────────────
function EmptyStateView({ onReset }: { onReset: () => void }) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <MaterialIcons name="location-searching" size={56} color={DT.borderGray} />
      </View>
      <Text style={styles.emptyTitle}>No Service Providers Found</Text>
      <Text style={styles.emptySubtext}>
        Try expanding your search radius metrics or adjusting active filters.
      </Text>
      <Pressable
        style={({ pressed }) => [
          styles.resetButton,
          pressed && { opacity: 0.85 },
        ]}
        onPress={onReset}
      >
        <Text style={styles.resetButtonText}>Reset Filters</Text>
      </Pressable>
    </View>
  );
}

// ─── Verification Badge ───────────────────────────────────────────────────────
function VerificationBadge() {
  return (
    <View style={styles.verifiedBadgeContainer}>
      <MaterialIcons name="check" size={10} color="#FFFFFF" />
    </View>
  );
}

// ─── Provider Card Component ──────────────────────────────────────────────────
function ProviderCard({ provider }: { provider: Provider }) {
  const [bookmarked, setBookmarked] = useState(provider.isBookmarked);
  const isCompany = provider.type === 'company';

  const handleViewProfile = () => {
    router.push({
      pathname: '/provider-profile',
      params: {
        provider_id: provider.id,
        provider_type: provider.type,
        user_id: provider.userId,
      }
    });
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.75 },
      ]}
      onPress={handleViewProfile}
    >
      <View style={styles.cardRow}>
        <View style={styles.avatarContainer}>
          <View
            style={[
              styles.avatarFrame,
              isCompany ? styles.companyLogoFrame : styles.workerAvatarFrame,
            ]}
          >
            <MaterialIcons
              name={isCompany ? 'business' : 'person'}
              size={isCompany ? 28 : 30}
              color="#CBD5E1"
            />
          </View>
          {provider.isVerified && <VerificationBadge />}
        </View>

        <View style={styles.dataMatrix}>
          <View style={styles.nameLine}>
            <Text
              style={[styles.providerName, isCompany && { fontSize: 15 }]}
              numberOfLines={1}
            >
              {provider.name}
            </Text>
            {!isCompany && (
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>Independent</Text>
              </View>
            )}
            {provider.isFeatured && (
              <View style={styles.featuredBadge}>
                <MaterialIcons name="stars" size={10} color="#B45309" style={{ marginRight: 2 }} />
                <Text style={styles.featuredBadgeText}>Promoted</Text>
              </View>
            )}
            {isCompany && provider.isVerified && (
              <View style={styles.verifiedCompanyBadge}>
                <Text style={styles.verifiedCompanyText}>Verified Company</Text>
              </View>
            )}
          </View>

          <View style={styles.locationLine}>
            <MaterialIcons name="place" size={13} color={DT.textSecondary} />
            <Text style={styles.locationText}>
              {provider.location} • {provider.distance}
            </Text>
          </View>

          <View style={styles.ratingLine}>
            <MaterialIcons name="star" size={13} color={DT.starRating} />
            <Text style={styles.ratingValue}>{provider.rating}</Text>
            <Text style={styles.reviewCount}>
              ({provider.reviewCount} reviews)
            </Text>
            {isCompany && (provider as ServiceCompany).workersAvailable > 0 && (
              <Text style={styles.workersText}>
                {' '}• {(provider as ServiceCompany).workersAvailable} Workers Available
              </Text>
            )}
          </View>
        </View>

        <View style={styles.actionMatrix}>
          <Pressable
            onPress={() => setBookmarked(!bookmarked)}
            hitSlop={8}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <MaterialIcons
              name={bookmarked ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={bookmarked ? DT.primary : DT.textSecondary}
            />
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.viewProfileButton,
              pressed && { backgroundColor: DT.lightBg },
            ]}
            onPress={handleViewProfile}
            hitSlop={4}
          >
            <Text style={styles.viewProfileText}>View Profile</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ServiceProvidersScreen() {
  const insets = useSafeAreaInsets();
  const { category_id, category_name } = useLocalSearchParams();
  const [activeFilter, setActiveFilter] = useState('nearest');
  const [isLoading, setIsLoading] = useState(true);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchProviders() {
      if (!category_id) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);

      const { data: psData, error: psError } = await supabase
        .from('provider_services')
        .select('provider_user_id, provider_type')
        .eq('category_id', category_id);

      if (!psData || psError) {
        setIsLoading(false);
        return;
      }

      const workerIds = psData.filter(p => p.provider_type === 'worker').map(p => p.provider_user_id);
      const companyIds = psData.filter(p => p.provider_type === 'company').map(p => p.provider_user_id);

      const workersPromise = workerIds.length > 0 
        ? supabase.from('worker_profiles').select('*').in('user_id', workerIds) 
        : Promise.resolve({ data: [] });
      
      const companiesPromise = companyIds.length > 0 
        ? supabase.from('company_profiles').select('*').in('user_id', companyIds) 
        : Promise.resolve({ data: [] });

      const subsPromise = (workerIds.length > 0 || companyIds.length > 0)
        ? supabase.from('subscriptions').select('*').in('user_id', [...workerIds, ...companyIds])
        : Promise.resolve({ data: [] });

      const [workersRes, companiesRes, subsRes] = await Promise.all([workersPromise, companiesPromise, subsPromise]);
      
      const subsData = subsRes.data || [];
      const now = new Date().getTime();
      const trialDurationMs = 15 * 24 * 60 * 60 * 1000; // 15 days
      const formattedProviders: Provider[] = [];

      if (workersRes.data) {
        workersRes.data.forEach(w => {
          const sub = subsData.find(s => s.user_id === w.user_id);
          let isEligible = false;
          
          if (sub) {
            const trialEnd = sub.trial_ends_at ? new Date(sub.trial_ends_at).getTime() : 0;
            const subEnd = sub.subscription_ends_at ? new Date(sub.subscription_ends_at).getTime() : 0;
            const graceEnd = sub.grace_ends_at ? new Date(sub.grace_ends_at).getTime() : 0;
            
            if (sub.status === 'trial' && now <= trialEnd) isEligible = true;
            else if (sub.status === 'active' && now <= subEnd) isEligible = true;
            else if (sub.status === 'grace' && now <= graceEnd) isEligible = true;
          } else {
            // Auto trial fallback
            const createdAt = w.created_at ? new Date(w.created_at).getTime() : 0;
            if (now - createdAt <= trialDurationMs) {
              isEligible = true;
            }
          }

          if (isEligible) {
            formattedProviders.push({
              id: w.id,
              userId: w.user_id,
              type: 'independent',
              name: w.full_name || 'Unknown Worker',
              location: w.city || 'Unknown Location',
              distance: '2.5 km away',
              rating: w.average_rating || 0,
              reviewCount: w.total_jobs_completed || 0,
              isVerified: w.verification_status === 'approved',
              isBookmarked: false,
              isFeatured: w.is_featured || false,
              completedJobs: w.total_jobs_completed || 0,
            });
          }
        });
      }

      if (companiesRes.data) {
        companiesRes.data.forEach(c => {
          const sub = subsData.find(s => s.user_id === c.user_id);
          let isEligible = false;
          
          if (sub) {
            const trialEnd = sub.trial_ends_at ? new Date(sub.trial_ends_at).getTime() : 0;
            const subEnd = sub.subscription_ends_at ? new Date(sub.subscription_ends_at).getTime() : 0;
            const graceEnd = sub.grace_ends_at ? new Date(sub.grace_ends_at).getTime() : 0;
            
            if (sub.status === 'trial' && now <= trialEnd) isEligible = true;
            else if (sub.status === 'active' && now <= subEnd) isEligible = true;
            else if (sub.status === 'grace' && now <= graceEnd) isEligible = true;
          } else {
            // Auto trial fallback
            const createdAt = c.created_at ? new Date(c.created_at).getTime() : 0;
            if (now - createdAt <= trialDurationMs) {
              isEligible = true;
            }
          }

          if (isEligible) {
            formattedProviders.push({
              id: c.id,
              userId: c.user_id,
              type: 'company',
              name: c.company_name || 'Unknown Company',
              location: c.city || 'Unknown Location',
              distance: '3.0 km away',
              rating: c.average_rating || 0,
              reviewCount: c.total_jobs_completed || 0,
              isVerified: c.verification_status === 'approved',
              isBookmarked: false,
              isFeatured: c.is_featured || false,
              completedJobs: c.total_jobs_completed || 0,
              workersAvailable: 5,
            });
          }
        });
      }

      setProviders(rankProviders(formattedProviders));
      setIsLoading(false);
    }
    
    fetchProviders();
  }, [category_id]);

  const handleResetFilters = useCallback(() => {
    setActiveFilter('nearest');
    // Would refetch/reset in real app
  }, []);

  const renderProvider = useCallback(
    ({ item }: { item: Provider }) => <ProviderCard provider={item} />,
    []
  );

  const keyExtractor = useCallback((item: Provider) => item.id, []);

  const filteredProviders = providers.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.rootContainer}>
      {/* ═══ 1. Sticky Header Navigation Container ═══ */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top, height: 64 + insets.top },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.headerBackButton,
            pressed && { opacity: 0.6 },
          ]}
          onPress={() => router.back()}
          hitSlop={8}
        >
          <MaterialIcons name="chevron-left" size={24} color={DT.textPrimary} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{category_name || 'Service Providers'}</Text>
          <Text style={styles.headerSubtitle}>Available workers near you</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.headerFilterButton,
            pressed && { opacity: 0.6 },
          ]}
          hitSlop={8}
        >
          <MaterialIcons name="tune" size={22} color={DT.textPrimary} />
        </Pressable>
      </View>

      {/* ═══ 1.5. Search Bar ═══ */}
      <View style={styles.searchBarWrapper}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color={DT.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or location..."
            placeholderTextColor={DT.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* ═══ 2. Horizontal Quick Filter Pill Bar ═══ */}
      <View style={styles.filterBarWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterBarContent}
        >
          {FILTER_PILLS.map((pill) => {
            const isActive = activeFilter === pill.id;
            return (
              <Pressable
                key={pill.id}
                style={[
                  styles.filterPill,
                  isActive ? styles.filterPillActive : styles.filterPillInactive,
                ]}
                onPress={() => setActiveFilter(pill.id)}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isActive
                      ? styles.filterPillTextActive
                      : styles.filterPillTextInactive,
                  ]}
                >
                  {pill.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ═══ 3. Main Dynamic Feed Area ═══ */}
      {isLoading ? (
        <LoadingSkeletonView />
      ) : filteredProviders.length === 0 ? (
        <EmptyStateView onReset={handleResetFilters} />
      ) : (
        <FlatList
          data={filteredProviders}
          renderItem={renderProvider}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.feedContainer}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: DT.bgBase,
  },

  // ── 1. Sticky Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: DT.componentBg,
    borderBottomWidth: 1,
    borderBottomColor: DT.borderGray,
  },
  headerBackButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: DT.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    color: DT.textSecondary,
    marginTop: 1,
  },
  headerFilterButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Search Bar ──
  searchBarWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: DT.componentBg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DT.lightBg,
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: DT.textPrimary,
  },

  // ── 2. Filter Bar ──
  filterBarWrapper: {
    height: 48,
    backgroundColor: DT.componentBg,
    borderBottomWidth: 1,
    borderBottomColor: DT.borderGray,
    justifyContent: 'center',
  },
  filterBarContent: {
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 8,
    gap: 8,
    alignItems: 'center',
  },
  filterPill: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  filterPillActive: {
    backgroundColor: DT.primary,
  },
  filterPillInactive: {
    backgroundColor: DT.componentBg,
    borderWidth: 1,
    borderColor: DT.borderGray,
  },
  filterPillText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filterPillTextInactive: {
    color: DT.textPrimary,
    fontWeight: '400',
  },

  // ── 3. Feed Container ──
  feedContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },

  // ── Provider Card ──
  card: {
    backgroundColor: DT.componentBg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: DT.borderGray,
    // Ambient shadow
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  // Avatar / Logo
  avatarContainer: {
    position: 'relative',
  },
  avatarFrame: {
    width: 60,
    height: 60,
    backgroundColor: DT.lightBg,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  workerAvatarFrame: {
    borderRadius: 30,
  },
  companyLogoFrame: {
    borderRadius: 8,
  },
  verifiedBadgeContainer: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: DT.verifiedBadge,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: DT.componentBg,
  },

  // Data Matrix
  dataMatrix: {
    flex: 1,
    paddingLeft: 12,
  },
  nameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  providerName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: DT.textPrimary,
    flexShrink: 1,
  },
  typeBadge: {
    backgroundColor: DT.lightBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    color: DT.textSecondary,
  },
  featuredBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: '#B45309',
  },
  verifiedCompanyBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedCompanyText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: '#059669',
  },
  locationLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    color: DT.textSecondary,
  },
  ratingLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  ratingValue: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: DT.textPrimary,
  },
  reviewCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    color: DT.textSecondary,
  },
  workersText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    color: DT.textSecondary,
  },

  // Action Matrix
  actionMatrix: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: 8,
    alignSelf: 'stretch',
  },
  viewProfileButton: {
    borderWidth: 1,
    borderColor: DT.primary,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'transparent',
  },
  viewProfileText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: DT.primary,
  },

  // ── Skeleton Loading ──
  skeletonContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  skeletonAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E2E8F0',
  },
  skeletonTextBlock: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'center',
    gap: 8,
  },
  skeletonLine1: {
    width: '70%',
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  skeletonLine2: {
    width: '50%',
    height: 10,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  skeletonLine3: {
    width: '40%',
    height: 10,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  skeletonActionBlock: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    marginLeft: 8,
  },
  skeletonBookmark: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  skeletonButton: {
    width: 80,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },

  // ── Empty State ──
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: DT.lightBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: DT.textPrimary,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    fontWeight: '400',
    color: DT.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  resetButton: {
    marginTop: 24,
    backgroundColor: DT.primary,
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  resetButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
