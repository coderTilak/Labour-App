import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../context/AuthContext';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const DT = {
  bgBase: '#F8FAFC',
  primary: '#0F766E',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  componentBg: '#FFFFFF',
  borderGray: '#E2E8F0',
  lightBg: '#F1F5F9',
};

const { width } = Dimensions.get('window');
// Calculate 22% width for categories grid
const CATEGORY_ITEM_WIDTH = (width - 32) * 0.22;

export default function CustomerHomeDashboard() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [userName, setUserName] = useState('');
  const [locationText, setLocationText] = useState('Fetching location...');
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dummy bookings state (empty array to trigger the empty state)
  const activeBookings = [];

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      const { data } = await supabase
        .from('customer_profiles')
        .select('full_name, city, country')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        if (data.full_name) {
          // Extract first name for greeting
          const firstName = data.full_name.split(' ')[0];
          setUserName(firstName);
        }
        
        // Format location
        if (data.city && data.country) {
          setLocationText(`${data.city}, ${data.country}`);
        } else if (data.city) {
          setLocationText(data.city);
        } else if (data.country) {
          setLocationText(data.country);
        } else {
          setLocationText('Location not set');
        }
      }
    }

    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('display_name', { ascending: true });
        
      if (data && !error) {
        setCategories(data);
      }
    }

    fetchProfile();
    fetchCategories();
  }, [user]);

  // Filter categories based on search query
  const filteredCategories = categories.filter(cat => 
    cat.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Take top 7 for default view + 1 "More" button, unless searching
  const displayedCategories = searchQuery 
    ? filteredCategories 
    : filteredCategories.slice(0, 7);

  return (
    <View style={styles.rootContainer}>
      {/* 1. Sticky Location & Interaction Header */}
      <View style={[styles.header, { paddingTop: insets.top, height: 72 + insets.top }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.locationLabel}>YOUR WORK LOCATION</Text>
          <Pressable style={styles.locationSelector}>
            <MaterialIcons name="place" size={16} color={DT.primary} />
            <Text style={styles.locationText}>{locationText}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={16} color={DT.textPrimary} style={{ marginLeft: 2 }} />
          </Pressable>
        </View>
        <Pressable style={styles.notificationBtn} hitSlop={8}>
          <MaterialIcons name="notifications-none" size={24} color={DT.textPrimary} />
          <View style={styles.notificationBadge} />
        </Pressable>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Personalization & Search Banner Section */}
        <View style={styles.bannerSection}>
          <Text style={styles.greetingText}>Good Morning {userName ? `, ${userName}` : ''} 👋</Text>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color={DT.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for plumbers, electricians, painters..."
              placeholderTextColor={DT.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* 3. Service Categories Grid System */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <Pressable onPress={() => router.push('/(customer)/categories')} hitSlop={8}>
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          </View>
          
          <View style={styles.categoriesGrid}>
            {displayedCategories.map(cat => (
              <CategoryItem 
                key={cat.id}
                icon={cat.icon_name || 'handyman'} 
                label={cat.display_name} 
                onPress={() => router.push(`/(customer)/service-providers?category_id=${cat.id}&category_name=${encodeURIComponent(cat.display_name)}`)}
              />
            ))}
            
            {!searchQuery && filteredCategories.length > 7 && (
              <CategoryItem 
                icon="more-horiz" 
                label="More" 
                onPress={() => router.push('/(customer)/categories')} 
              />
            )}
            
            {searchQuery && displayedCategories.length === 0 && (
              <Text style={{color: DT.textSecondary, fontSize: 14, textAlign: 'center', width: '100%', marginTop: 16}}>
                No services found for "{searchQuery}"
              </Text>
            )}
          </View>
        </View>

        {/* 4. Featured Providers Showcase / Carousel */}
        <View style={styles.featuredSection}>
          <View style={[styles.sectionHeaderRow, { paddingHorizontal: 16, marginBottom: 12 }]}>
            <Text style={styles.sectionTitle}>Top Rated Near You</Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}
          >
            {/* Carousel Card Item */}
            <View style={styles.featuredCard}>
              <View style={styles.featuredHeader}>
                <View style={styles.featuredThumbnail}>
                  <MaterialIcons name="person" size={24} color="#CBD5E1" />
                </View>
                <View style={styles.featuredInfo}>
                  <Text style={styles.featuredName}>Ram Bahadur Thapa</Text>
                  <View style={styles.featuredStats}>
                    <MaterialIcons name="star" size={14} color="#22C55E" />
                    <Text style={styles.ratingText}>4.8</Text>
                    <View style={styles.verifiedChip}>
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.featuredDetails}>
                <Text style={styles.featuredDetailText}>📍 Lazimpat</Text>
                <Text style={styles.featuredDetailText}>2.1 km away</Text>
              </View>
            </View>

            {/* Second Dummy Card */}
            <View style={styles.featuredCard}>
              <View style={styles.featuredHeader}>
                <View style={styles.featuredThumbnail}>
                  <MaterialIcons name="person" size={24} color="#CBD5E1" />
                </View>
                <View style={styles.featuredInfo}>
                  <Text style={styles.featuredName}>Sunita Tamang</Text>
                  <View style={styles.featuredStats}>
                    <MaterialIcons name="star" size={14} color="#22C55E" />
                    <Text style={styles.ratingText}>4.9</Text>
                    <View style={styles.verifiedChip}>
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.featuredDetails}>
                <Text style={styles.featuredDetailText}>📍 Baluwatar</Text>
                <Text style={styles.featuredDetailText}>3.5 km away</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* 5. Conditional Bookings Display Logic */}
        <View style={styles.bookingsSection}>
          {activeBookings.length > 0 ? (
            <View>
              {/* Future logic for rendering active bookings */}
            </View>
          ) : (
            <View style={styles.emptyBookingCard}>
              <Text style={styles.emptyBookingTitle}>Need professional help?</Text>
              <Text style={styles.emptyBookingSubtext}>
                Select a category above to find and request trusted, verified independent workers or agencies instantly near your area.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 6. Fixed Bottom Navigation Dock */}
      <View style={[styles.bottomDock, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <Pressable style={styles.navItem}>
          <MaterialIcons name="home" size={24} color={DT.primary} />
          <Text style={[styles.navText, { color: DT.primary }]}>Home</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.push('/(customer)/categories')}>
          <MaterialIcons name="search" size={24} color={DT.textSecondary} />
          <Text style={styles.navText}>Explore</Text>
        </Pressable>
        <Pressable style={styles.navItem} onPress={() => router.push('/(customer)/book-service')}>
          <MaterialIcons name="receipt-long" size={24} color={DT.textSecondary} />
          <Text style={styles.navText}>Bookings</Text>
        </Pressable>
        
        <Pressable 
          style={styles.navItem}
          onPress={() => router.push('/(customer)/profile')}
        >
          <MaterialIcons name="person-outline" size={24} color={DT.textSecondary} />
          <Text style={styles.navText}>Profile</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Helper Components ────────────────────────────────────────────────────────
function CategoryItem({ icon, label, onPress }: { icon: string, label: string, onPress?: () => void }) {
  return (
    <Pressable 
      style={[styles.categoryItem, { width: CATEGORY_ITEM_WIDTH }]} 
      onPress={onPress}
    >
      <View style={styles.categoryBlock}>
        <MaterialIcons name={icon as any} size={28} color={DT.textPrimary} />
      </View>
      <Text style={styles.categoryLabel} numberOfLines={1} adjustsFontSizeToFit>{label}</Text>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: DT.bgBase,
  },
  scrollView: {
    flex: 1,
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
  headerLeft: {
    flexDirection: 'column',
  },
  locationLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    letterSpacing: 0.5,
    color: DT.textSecondary,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: DT.textPrimary,
    marginLeft: 4,
  },
  notificationBtn: {
    width: 24,
    height: 24,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: DT.componentBg,
  },

  // 2. Banner
  bannerSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: DT.componentBg,
  },
  greetingText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: DT.textPrimary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DT.lightBg,
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 14,
    marginTop: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: DT.textPrimary,
  },

  // 3. Categories
  categoriesSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: DT.textPrimary,
  },
  seeAllText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: DT.primary,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  categoryItem: {
    alignItems: 'center',
  },
  categoryBlock: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: DT.componentBg,
    borderWidth: 1,
    borderColor: DT.borderGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    color: DT.textPrimary,
    marginTop: 6,
    textAlign: 'center',
  },

  // 4. Featured Carousel
  featuredSection: {
    marginTop: 24,
  },
  carouselContainer: {
    paddingLeft: 16,
    paddingRight: 4, // 16 - 12 (marginRight of last item)
  },
  featuredCard: {
    width: 260,
    marginRight: 12,
    backgroundColor: DT.componentBg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: DT.borderGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: DT.lightBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredInfo: {
    marginLeft: 10,
    flex: 1,
  },
  featuredName: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: DT.textPrimary,
  },
  featuredStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#22C55E',
    marginLeft: 4,
    marginRight: 8,
  },
  verifiedChip: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#166534',
  },
  featuredDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  featuredDetailText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: DT.textSecondary,
  },

  // 5. Bookings
  bookingsSection: {
    paddingHorizontal: 16,
    marginTop: 24,
    paddingBottom: 88, // Ensure scroll clears the fixed bottom dock
  },
  emptyBookingCard: {
    backgroundColor: DT.primary,
    borderRadius: 12,
    padding: 16,
  },
  emptyBookingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyBookingSubtext: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: DT.borderGray,
    marginTop: 4,
    lineHeight: 18,
  },

  // 6. Bottom Dock
  bottomDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: DT.componentBg,
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
    paddingVertical: 4,
  },
  navText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: '#475569',
    marginTop: 3,
  },
});
