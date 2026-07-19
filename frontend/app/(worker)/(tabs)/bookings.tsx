import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Theme';
import { useRouter } from 'expo-router';

export default function WorkerBookingsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  const activeJobs = [
    {
      id: 'BK-1045',
      service: 'Plumbing Repair',
      customer: 'Hari Prasad',
      time: 'Today, 2:30 PM',
      location: 'Baneshwor, Kathmandu',
      status: 'Accepted',
      phone: '+977 9801234567',
    },
    {
      id: 'BK-1048',
      service: 'Electrical Wiring',
      customer: 'Anita Thapa',
      time: 'Tomorrow, 10:00 AM',
      location: 'Lazimpat, Kathmandu',
      status: 'Pending Start',
      phone: '+977 9812345678',
    }
  ];

  const completedJobs = [
    {
      id: 'BK-1042',
      service: 'Plumbing Repair',
      customer: 'Rajesh Maharjan',
      time: '18 July, 11:30 AM',
      location: 'Patan, Lalitpur',
      status: 'Completed',
      earnings: 'रु 1500',
    },
    {
      id: 'BK-1039',
      service: 'Kitchen Tiling',
      customer: 'Sajan Shrestha',
      time: '15 July, 9:00 AM',
      location: 'Baluwatar, Kathmandu',
      status: 'Completed',
      earnings: 'रु 4500',
    }
  ];

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleCall = (phone: string) => {
    Alert.alert('Call Customer', `Dialing ${phone}...`);
  };

  const handleStartJob = (jobId: string) => {
    Alert.alert('Start Job', `Are you starting job ${jobId} now?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Start Job', onPress: () => Alert.alert('Success', 'Job status updated to In Progress!') }
    ]);
  };

  const displayedJobs = activeTab === 'active' ? activeJobs : completedJobs;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Jobs & Bookings</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>Active ({activeJobs.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>History ({completedJobs.length})</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {displayedJobs.map(job => (
          <View key={job.id} style={styles.jobCard}>
            <View style={styles.jobHeader}>
              <View>
                <Text style={styles.jobId}>{job.id}</Text>
                <Text style={styles.jobService}>{job.service}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: activeTab === 'active' ? '#ECFDF5' : '#F1F5F9' }]}>
                <Text style={[styles.statusBadgeText, { color: activeTab === 'active' ? Colors.success : Colors.textSecondary }]}>
                  {job.status}
                </Text>
              </View>
            </View>

            <Text style={styles.customerName}>Customer: {job.customer}</Text>
            <Text style={styles.jobTime}>📅 {job.time}</Text>
            
            <View style={styles.jobLocation}>
              <MaterialIcons name="location-on" size={16} color={Colors.textSecondary} />
              <Text style={styles.jobLocationText}>{job.location}</Text>
            </View>

            {activeTab === 'completed' && 'earnings' in job && (
              <Text style={styles.earningsText}>Earnings: <Text style={styles.earningsValue}>{job.earnings}</Text></Text>
            )}

            {activeTab === 'active' && (
              <View style={styles.actionsRow}>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.callBtn]}
                  onPress={() => 'phone' in job && handleCall(job.phone)}
                >
                  <MaterialIcons name="phone" size={16} color={Colors.primary} />
                  <Text style={styles.callBtnText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.startBtn]}
                  onPress={() => handleStartJob(job.id)}
                >
                  <Text style={styles.startBtnText}>Start Job</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.textPrimary,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primary,
    fontFamily: 'Inter-SemiBold',
  },
  scrollContent: {
    padding: 16,
  },
  jobCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobId: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  jobService: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
  },
  customerName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  jobTime: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: Colors.primary,
    marginBottom: 6,
  },
  jobLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobLocationText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: 'Inter-Regular',
    marginLeft: 4,
  },
  earningsText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  earningsValue: {
    fontFamily: 'Inter-Bold',
    color: Colors.success,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  callBtn: {
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  callBtnText: {
    color: Colors.primary,
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
  },
  startBtn: {
    backgroundColor: Colors.primary,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    fontSize: 13,
  },
});
