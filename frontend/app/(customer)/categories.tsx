import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
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
};

const { width } = Dimensions.get('window');
// Calculate roughly 31% width, accounting for padding and gaps
const ITEM_WIDTH = (width - 32 - 20) / 3;

interface ServiceItemProps {
  icon: string;
  label: string;
  iconFamily?: 'MaterialIcons' | 'MaterialCommunityIcons';
  onPress: () => void;
}

function ServiceItem({ icon, label, iconFamily = 'MaterialIcons', onPress }: ServiceItemProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Pressable
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onPress={onPress}
      style={[
        styles.serviceCard,
        { width: ITEM_WIDTH },
        isPressed && styles.serviceCardPressed
      ]}
    >
      {iconFamily === 'MaterialIcons' ? (
        <MaterialIcons name={icon as any} size={28} color={isPressed ? DT.primary : DT.textSecondary} />
      ) : (
        <MaterialCommunityIcons name={icon as any} size={28} color={isPressed ? DT.primary : DT.textSecondary} />
      )}
      <Text style={[styles.serviceLabel, isPressed && { color: DT.primary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState<any[]>([]);
  const [groupedCategories, setGroupedCategories] = useState<Record<string, any[]>>({});

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('display_name', { ascending: true });
        
      if (data && !error) {
        setCategories(data);
        
        // Group by group_label
        const grouped = data.reduce((acc: Record<string, any[]>, cat) => {
          const label = cat.group_label || 'OTHER SERVICES';
          if (!acc[label]) acc[label] = [];
          acc[label].push(cat);
          return acc;
        }, {});
        setGroupedCategories(grouped);
      }
    }
    fetchCategories();
  }, []);

  const handleServicePress = (cat: any) => {
    router.push(`/(customer)/service-providers?category_id=${cat.id}&category_name=${encodeURIComponent(cat.display_name)}`);
  };

  return (
    <View style={styles.rootContainer}>
      {/* 1. Sticky Header Navigation Box */}
      <View style={[styles.header, { paddingTop: insets.top, height: 60 + insets.top }]}>
        <Pressable 
          style={styles.backButton} 
          onPress={() => router.back()}
          hitSlop={8}
        >
          <MaterialIcons name="arrow-back" size={24} color={DT.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>All Services & Labour</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* 2. Full Grid Content Area */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(groupedCategories).map(([groupLabel, cats], index, arr) => (
          <View key={groupLabel} style={[styles.sectionContainer, index === arr.length - 1 && { paddingBottom: 32 }]}>
            <Text style={styles.sectionTitle}>{groupLabel.toUpperCase()}</Text>
            <View style={styles.gridContainer}>
              {cats.map(cat => (
                <ServiceItem 
                  key={cat.id}
                  icon={cat.icon_name || 'handyman'} 
                  iconFamily={(cat.icon_family as any) || 'MaterialIcons'} 
                  label={cat.display_name} 
                  onPress={() => handleServicePress(cat)} 
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: DT.bgBase,
  },
  
  // 1. Sticky Header
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    letterSpacing: 0.5,
    color: DT.textSecondary,
    marginBottom: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceCard: {
    backgroundColor: DT.componentBg,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: DT.borderGray,
    alignItems: 'center',
    justifyContent: 'center',
    // Using aspect ratio to keep them somewhat square-ish or proportional,
    // but text might need varying heights so we don't strictly enforce height.
    minHeight: 96,
  },
  serviceCardPressed: {
    opacity: 0.7,
    borderColor: DT.primary,
  },
  serviceLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    color: DT.textPrimary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 14,
  },
});
