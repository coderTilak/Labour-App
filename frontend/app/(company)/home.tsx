import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabase';

export default function CompanyDashboard() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [companyName, setCompanyName] = useState('BuildWell Construction Pvt. Ltd.');
  const [loading, setLoading] = useState(true);
  const [trialDaysLeft, setTrialDaysLeft] = useState(15);
  const [trialEndDate, setTrialEndDate] = useState<Date | null>(null);
  const [isTrialActive, setIsTrialActive] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionEndsAt, setSubscriptionEndsAt] = useState<Date | null>(null);

  useEffect(() => {
    async function loadCompanyProfileAndSubscription() {
      if (!user) return;
      try {
        setLoading(true);
        // 1. Load Profile details (including created_at)
        const { data: profile, error: profileErr } = await supabase
          .from('company_profiles')
          .select('company_name, created_at')
          .eq('user_id', user.id)
          .single();
          
        if (profile) {
          if (profile.company_name) {
            setCompanyName(profile.company_name);
          }
          
          // Calculate trial dates based on created_at
          const createdAt = new Date(profile.created_at);
          const trialEnd = new Date(createdAt.getTime() + 15 * 24 * 60 * 60 * 1000);
          setTrialEndDate(trialEnd);
          
          const now = new Date();
          const timeDiff = trialEnd.getTime() - now.getTime();
          const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
          const remainingDays = daysLeft > 0 ? daysLeft : 0;
          setTrialDaysLeft(remainingDays);
          
          // 2. Load Subscription details
          const { data: sub, error: subErr } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
            
          let finalTrialActive = remainingDays > 0;
          let finalSubscribed = false;
          
          if (sub && !subErr) {
            const nowTime = now.getTime();
            const subEndTime = sub.subscription_ends_at ? new Date(sub.subscription_ends_at).getTime() : 0;
            const trialEndTime = sub.trial_ends_at ? new Date(sub.trial_ends_at).getTime() : 0;
            const graceEndTime = sub.grace_ends_at ? new Date(sub.grace_ends_at).getTime() : 0;
            
            if (sub.status === 'active' && nowTime <= subEndTime) {
              finalSubscribed = true;
              finalTrialActive = false;
              setSubscriptionEndsAt(new Date(sub.subscription_ends_at));
            } else if (sub.status === 'trial' && nowTime <= trialEndTime) {
              finalSubscribed = false;
              finalTrialActive = true;
              const subTrialDays = Math.ceil((trialEndTime - nowTime) / (1000 * 60 * 60 * 24));
              setTrialDaysLeft(subTrialDays > 0 ? subTrialDays : 0);
              setTrialEndDate(new Date(sub.trial_ends_at));
            } else if (sub.status === 'grace' && nowTime <= graceEndTime) {
              finalSubscribed = false;
              finalTrialActive = false;
            } else {
              finalSubscribed = false;
              finalTrialActive = false;
            }
          }
          
          setIsTrialActive(finalTrialActive);
          setIsSubscribed(finalSubscribed);
          
          // Gating check: if trial has expired and there is no active subscription, redirect to paywall
          if (!finalTrialActive && !finalSubscribed) {
            // Check if they are in 3-day grace period
            let inGrace = false;
            if (sub && sub.status === 'grace') {
              const nowTime = now.getTime();
              const graceEndTime = sub.grace_ends_at ? new Date(sub.grace_ends_at).getTime() : 0;
              if (nowTime <= graceEndTime) {
                inGrace = true;
              }
            }
            
            if (!inGrace) {
              console.log('Redirecting to paywall screen...');
              router.replace('/paywall');
              return;
            }
          }
        }
      } catch (e) {
        console.log('Error loading dashboard profile and subscription:', e);
      } finally {
        setLoading(false);
      }
    }
    
    loadCompanyProfileAndSubscription();
  }, [user]);

  const handleNotificationPress = () => {
    router.push('/(company)/notifications');
  };

  const handleAddEmployeePress = () => {
    router.push('/(company)/roster' as any);
  };

  const handlePanelPress = (panelName: string, route: string) => {
    if (route) {
      router.push(route as any);
    } else {
      Alert.alert('Workspace Information', `${panelName} is currently up to date.`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Sticky Enterprise Top Header */}
      <View style={[styles.stickyHeaderWrapper, { paddingTop: insets.top }]}>
        <View style={styles.stickyHeader}>
          <View style={styles.headerLeft}>
            <Text numberOfLines={1} style={styles.corporateTitle}>
              {companyName}
            </Text>
            <Text style={styles.trialStatusSub}>
              {isSubscribed 
                ? `Owner Workspace • Paid Subscription Active` 
                : isTrialActive 
                  ? `Owner Workspace • 15-Day Free Trial Active` 
                  : `Owner Workspace • Subscription Lapsed`}
            </Text>
          </View>
          
          <Pressable
            onPress={handleNotificationPress}
            style={({ pressed }) => [
              styles.notificationBtn,
              { opacity: pressed ? 0.75 : 1 }
            ]}
          >
            <MaterialIcons name="notifications-none" size={24} color="#0F172A" />
            <View style={styles.notificationBadgeDot} />
          </Pressable>
        </View>
      </View>
 
      {/* Main Content Area */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 88 + insets.bottom } // padding-bottom: 88px to avoid cover by tab bar
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Subscription & Trial Status Card */}
        <View style={styles.capacityCard}>
          <View style={styles.capacityHeader}>
            <Text style={styles.capacityLabelLeft}>
              {isSubscribed ? 'Subscription Plan' : '15-Day Free Trial'}
            </Text>
            <Text style={styles.capacityLabelRight}>
              {isSubscribed 
                ? 'Active Roster' 
                : `${trialDaysLeft} Days Remaining`}
            </Text>
          </View>
          
          {/* Visual Track Meter */}
          <View style={styles.meterTrack}>
            <View 
              style={[
                styles.meterFill, 
                { 
                  width: isSubscribed ? '100%' : `${(trialDaysLeft / 15) * 100}%`,
                  backgroundColor: isSubscribed ? '#16A34A' : '#0F766E'
                }
              ]} 
            />
          </View>
          
          {/* Status Subtext with calendar details */}
          <Text style={styles.meterSubtext}>
            {isSubscribed 
              ? `📅 Your subscription is active until ${subscriptionEndsAt?.toLocaleDateString() || 'N/A'}.`
              : isTrialActive
                ? `📅 Your free trial ends on ${trialEndDate?.toLocaleDateString() || 'N/A'}. You have ${trialDaysLeft} days remaining to test all features.`
                : `⚠️ Your free trial has ended. Please subscribe to standard plans to keep showing on customer maps.`}
          </Text>
        </View>

        {/* Business Pulse Metrics Summary Row */}
        <View style={styles.metricsRow}>
          {/* Metric Block 1 */}
          <View style={styles.metricBlock}>
            <Text numberOfLines={1} style={styles.metricLabel}>
              Active Jobs
            </Text>
            <Text style={[styles.metricValue, { color: '#0F172A' }]}>0</Text>
          </View>
          
          {/* Metric Block 2 */}
          <View style={styles.metricBlock}>
            <Text numberOfLines={1} style={styles.metricLabel}>
              Unassigned Requests
            </Text>
            <Text style={[styles.metricValue, { color: '#94A3B8' }]}>0</Text>
          </View>
          
          {/* Metric Block 3 */}
          <View style={styles.metricBlock}>
            <Text numberOfLines={1} style={styles.metricLabel}>
              Branches Online
            </Text>
            <Text style={[styles.metricValue, { color: '#0F766E' }]}>1 / 5</Text>
          </View>
        </View>

        {/* Dynamic Operational Core Area */}
        <View style={styles.operationalCore}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>Urgent Action Items</Text>
          </View>
          
          {/* Empty-State Onboarding Helper */}
          <View style={styles.emptyStateCard}>
            <View style={styles.badgeCircle}>
              <MaterialIcons name="engineering" size={24} color="#0F766E" />
            </View>
            <Text style={styles.emptyStateTitle}>No Workers Registered Yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              To start appearing on customer search maps and matching workflows, you must first build your workforce database roster.
            </Text>
            
            <Pressable
              onPress={handleAddEmployeePress}
              style={({ pressed }) => [
                styles.emptyStateCTA,
                { opacity: pressed ? 0.75 : 1 }
              ]}
            >
              <Text style={styles.emptyStateCTAText}>+ Add First Employee Account</Text>
            </Pressable>
          </View>
        </View>

        {/* Operational Management Quick Navigation Grids */}
        <View style={styles.navGridSection}>
          <Text style={styles.sectionHeaderTitle}>Operational Workspace Panels</Text>
          
          <View style={styles.navGrid}>
            {/* Block A: Manage Staff Roster */}
            <Pressable
              onPress={() => handlePanelPress('Manage Staff Roster', '/(company)/roster')}
              style={({ pressed }) => [
                styles.navBlock,
                { opacity: pressed ? 0.75 : 1 }
              ]}
            >
              <View style={styles.navIconWrapper}>
                <MaterialIcons name="people" size={24} color="#0F766E" />
              </View>
              <Text style={styles.navBlockTitle}>Manage Staff Roster</Text>
              <Text style={styles.navBlockSubtext}>Provision and transfer personnel</Text>
            </Pressable>

            {/* Block B: Branch Configurations */}
            <Pressable
              onPress={() => handlePanelPress('Branch Configurations', '/(company)/dispatch')}
              style={({ pressed }) => [
                styles.navBlock,
                { opacity: pressed ? 0.75 : 1 }
              ]}
            >
              <View style={styles.navIconWrapper}>
                <MaterialIcons name="store" size={24} color="#0F766E" />
              </View>
              <Text style={styles.navBlockTitle}>Branch Configurations</Text>
              <Text style={styles.navBlockSubtext}>Monitor 5 facility offices</Text>
            </Pressable>

            {/* Block C: Subscription & KYC */}
            <Pressable
              onPress={() => handlePanelPress('Subscription & KYC', '/(company)/profile')}
              style={({ pressed }) => [
                styles.navBlock,
                { opacity: pressed ? 0.75 : 1 }
              ]}
            >
              <View style={styles.navIconWrapper}>
                <MaterialIcons name="credit-card" size={24} color="#0F766E" />
              </View>
              <Text style={styles.navBlockTitle}>Subscription & KYC</Text>
              <Text style={styles.navBlockSubtext}>Verify business parameters</Text>
            </Pressable>

            {/* Block D: Performance Insights */}
            <Pressable
              onPress={() => handlePanelPress('Performance Insights', '')}
              style={({ pressed }) => [
                styles.navBlock,
                { opacity: pressed ? 0.75 : 1 }
              ]}
            >
              <View style={styles.navIconWrapper}>
                <MaterialIcons name="trending-up" size={24} color="#0F766E" />
              </View>
              <Text style={styles.navBlockTitle}>Performance Insights</Text>
              <Text style={styles.navBlockSubtext}>Review consumer feedback logs</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomNavBar, { height: 60 + insets.bottom, paddingBottom: insets.bottom }]}>
        <Pressable
          style={({ pressed }) => [
            styles.tabItem,
            { opacity: pressed ? 0.75 : 1 }
          ]}
          onPress={() => handlePanelPress('Dashboard', '/(company)/home')}
        >
          <MaterialIcons name="dashboard" size={22} color="#0F766E" />
          <Text style={[styles.tabText, styles.tabTextActive]}>Dashboard</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.tabItem,
            { opacity: pressed ? 0.75 : 1 }
          ]}
          onPress={() => handlePanelPress('Staff Roster', '/(company)/roster')}
        >
          <MaterialIcons name="people" size={22} color="#64748B" />
          <Text style={styles.tabText}>Staff</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.tabItem,
            { opacity: pressed ? 0.75 : 1 }
          ]}
          onPress={() => handlePanelPress('Branch Configurations', '/(company)/dispatch')}
        >
          <MaterialIcons name="store" size={22} color="#64748B" />
          <Text style={styles.tabText}>Branches</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.tabItem,
            { opacity: pressed ? 0.75 : 1 }
          ]}
          onPress={() => handlePanelPress('Notifications', '/(company)/notifications')}
        >
          <MaterialIcons name="notifications" size={22} color="#64748B" />
          <Text style={styles.tabText}>Notifications</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.tabItem,
            { opacity: pressed ? 0.75 : 1 }
          ]}
          onPress={() => handlePanelPress('Profile', '/(company)/profile')}
        >
          <MaterialIcons name="person" size={22} color="#64748B" />
          <Text style={styles.tabText}>Profile</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  stickyHeaderWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    zIndex: 10,
  },
  stickyHeader: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerLeft: {
    flex: 1,
    marginRight: 16,
  },
  corporateTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  trialStatusSub: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: '#0F766E',
    marginTop: 2,
  },
  notificationBtn: {
    position: 'relative',
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D97706',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
  },
  capacityCard: {
    marginHorizontal: 16,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  capacityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  capacityLabelLeft: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#64748B',
  },
  capacityLabelRight: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#0F766E',
  },
  meterTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  meterFill: {
    height: 8,
    backgroundColor: '#0F766E',
    borderRadius: 4,
  },
  meterSubtext: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    lineHeight: 15,
    marginTop: 8,
  },
  metricsRow: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricBlock: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    marginTop: 4,
  },
  operationalCore: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#0F172A',
  },
  emptyStateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F2F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#0F172A',
    marginTop: 12,
  },
  emptyStateSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
    marginTop: 4,
    paddingHorizontal: 10,
  },
  emptyStateCTA: {
    backgroundColor: '#0F766E',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 14,
  },
  emptyStateCTAText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  navGridSection: {
    paddingHorizontal: 16,
  },
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
    rowGap: 12,
  },
  navBlock: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  navIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBlockTitle: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#0F172A',
    marginTop: 8,
  },
  navBlockSubtext: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 14,
    marginTop: 2,
  },
  bottomNavBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    flex: 1,
  },
  tabText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    marginTop: 4,
  },
  tabTextActive: {
    color: '#0F766E',
  },
});
