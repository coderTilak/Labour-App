import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Theme';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function WorkerHomeScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for initial UI layout
  const stats = {
    todayEarnings: 1500,
    jobsCompleted: 3,
    pendingRequests: 2,
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Fetch dashboard data
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const toggleAvailability = async (value: boolean) => {
    setIsAvailable(value);
    // TODO: Update availability_state via API
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>Independent Worker</Text>
          </View>
          <View style={styles.availabilityToggle}>
            <Text style={[styles.statusText, { color: isAvailable ? Colors.success : Colors.textSecondary }]}>
              {isAvailable ? 'Online' : 'Offline'}
            </Text>
            <Switch
              value={isAvailable}
              onValueChange={toggleAvailability}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.surface}
            />
          </View>
        </View>

        {/* Action Required Banner (e.g. pending verification) */}
        <View style={styles.warningBanner}>
          <MaterialIcons name="info-outline" size={20} color={Colors.warning} />
          <Text style={styles.warningText}>Your profile verification is pending.</Text>
          <TouchableOpacity onPress={() => router.push('/(worker)/profile-setup' as any)}>
            <Text style={styles.warningAction}>View</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>Today&apos;s Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialIcons name="account-balance-wallet" size={24} color={Colors.primary} />
            <Text style={styles.statValue}>रु {stats.todayEarnings}</Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="check-circle" size={24} color={Colors.success} />
            <Text style={styles.statValue}>{stats.jobsCompleted}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="notifications-active" size={24} color={Colors.warning} />
            <Text style={styles.statValue}>{stats.pendingRequests}</Text>
            <Text style={styles.statLabel}>Requests</Text>
          </View>
        </View>

        {/* Recent Activity / Next Job */}
        <Text style={styles.sectionTitle}>Next Appointment</Text>
        <View style={styles.jobCard}>
          <View style={styles.jobHeader}>
            <Text style={styles.jobService}>Plumbing Repair</Text>
            <View style={styles.jobBadge}>
              <Text style={styles.jobBadgeText}>Accepted</Text>
            </View>
          </View>
          <Text style={styles.jobTime}>Today, 2:30 PM</Text>
          <View style={styles.jobLocation}>
            <MaterialIcons name="location-on" size={16} color={Colors.textSecondary} />
            <Text style={styles.jobLocationText}>Baneshwor, Kathmandu</Text>
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/(worker)/(tabs)/bookings' as any)}>
            <Text style={styles.primaryButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
  },
  name: {
    fontSize: 20,
    color: Colors.textPrimary,
    fontFamily: 'Inter-Bold',
    marginTop: 2,
  },
  availabilityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    marginRight: 8,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7', // Amber 50
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FDE68A', // Amber 200
  },
  warningText: {
    flex: 1,
    marginLeft: 8,
    color: '#92400E', // Amber 900
    fontFamily: 'Inter-Medium',
    fontSize: 13,
  },
  warningAction: {
    color: Colors.primary,
    fontFamily: 'Inter-Bold',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
    marginTop: 4,
  },
  jobCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobService: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
  },
  jobBadge: {
    backgroundColor: '#ECFDF5', // Emerald 50
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  jobBadgeText: {
    color: Colors.success,
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
  },
  jobTime: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.primary,
    marginBottom: 8,
  },
  jobLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  jobLocationText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginLeft: 4,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});
