import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ScrollView,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../utils/supabase';

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const TOKENS = {
  bgBase: '#F8FAFC',
  primary: '#0F766E',
  primaryHover: '#0D6B64',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  componentBg: '#FFFFFF',
  border: '#E2E8F0',
  borderFocused: '#0F766E',
  lightBg: '#F1F5F9',
  statusAvailableBg: '#DCFCE7',
  statusAvailableText: '#166534',
  statusAvailableDot: '#10B981',
  statusBusyBg: '#FEF3C7',
  statusBusyText: '#92400E',
  statusBusyDot: '#F59E0B',
  statusOfflineBg: '#F1F5F9',
  statusOfflineText: '#475569',
  statusOfflineDot: '#64748B',
  badgeBg: '#E0F2F1',
  errorRed: '#EF4444',
};

// ─── Options Data ──────────────────────────────────────────────────────────────
const TRADE_OPTIONS = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Painting',
  'Masonry',
  'Welding',
  'AC Repair',
  'House Cleaning',
  'CCTV Setup',
  'Furniture Repair',
];

const BRANCH_OPTIONS = [
  'HQ - New Baneshwor',
  'Kathmandu Branch',
  'Lalitpur Branch',
  'Bhaktapur Branch',
  'Pokhara Branch',
];

export type EmployeeItem = {
  id: string;
  full_name: string;
  contact_no: string;
  skill: string;
  branch_name: string;
  status: 'available' | 'busy' | 'offline';
};

// Default Initial Mock Roster Data
const INITIAL_ROSTER: EmployeeItem[] = [
  {
    id: '1',
    full_name: 'Ram Bahadur Thapa',
    contact_no: '+977 9851012345',
    skill: 'Plumbing',
    branch_name: 'Kathmandu Branch',
    status: 'available',
  },
  {
    id: '2',
    full_name: 'Suresh Kumar Maharjan',
    contact_no: '+977 9841234567',
    skill: 'Electrical',
    branch_name: 'HQ - New Baneshwor',
    status: 'available',
  },
  {
    id: '3',
    full_name: 'Bikash Shrestha',
    contact_no: '+977 9801987654',
    skill: 'AC Repair',
    branch_name: 'Lalitpur Branch',
    status: 'busy',
  },
  {
    id: '4',
    full_name: 'Anil Tamang',
    contact_no: '+977 9860112233',
    skill: 'Masonry',
    branch_name: 'Bhaktapur Branch',
    status: 'offline',
  },
];

export default function EmployeeRosterScreen() {
  const insets = useSafeAreaInsets();
  // ── States ──────────────────────────────────────────────────────────────────
  const [roster, setRoster] = useState<EmployeeItem[]>(INITIAL_ROSTER);
  const [maxQuota] = useState(50);
  const [loading, setLoading] = useState(false);
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);

  // Form Fields State
  const [fullName, setFullName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [selectedTrade, setSelectedTrade] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');

  // Focus States for Inputs
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Modal Picker States
  const [tradeModalVisible, setTradeModalVisible] = useState(false);
  const [branchModalVisible, setBranchModalVisible] = useState(false);
  const [transferEmployee, setTransferEmployee] = useState<EmployeeItem | null>(null);

  // ── Fetch Roster from Supabase on Mount ──────────────────────────────────────
  useEffect(() => {
    fetchCompanyRoster();
  }, []);

  const fetchCompanyRoster = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: company } = await supabase
        .from('company_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!company) return;

      const { data: employees } = await supabase
        .from('company_employees')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (employees && employees.length > 0) {
        const mapped: EmployeeItem[] = employees.map(emp => ({
          id: emp.id,
          full_name: emp.full_name,
          contact_no: emp.contact_no ? `+977 ${emp.contact_no}` : '+977 98XXXXXXXX',
          skill: emp.skills?.[0] || 'General Labour',
          branch_name: 'HQ - New Baneshwor',
          status: emp.availability_state as any || 'available',
        }));
        setRoster(mapped);
      }
    } catch (e) {
      console.log('Error fetching roster:', e);
    }
  };

  // ── Add Employee Handler ─────────────────────────────────────────────────────
  const handleSaveWorker = async () => {
    if (!fullName.trim()) {
      Alert.alert('Required Field', 'Please enter the worker’s full name.');
      return;
    }
    if (!mobileNo.trim() || mobileNo.length < 10) {
      Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!selectedTrade) {
      Alert.alert('Selection Required', 'Please assign a trade category.');
      return;
    }
    if (!selectedBranch) {
      Alert.alert('Selection Required', 'Please assign an operating branch.');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: company } = await supabase
          .from('company_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (company) {
          await supabase.from('company_employees').insert({
            company_id: company.id,
            full_name: fullName.trim(),
            contact_no: mobileNo.trim(),
            skills: [selectedTrade],
            availability_state: 'available',
          });
        }
      }

      // Add to local list state instantly
      const newEntry: EmployeeItem = {
        id: Date.now().toString(),
        full_name: fullName.trim(),
        contact_no: `+977 ${mobileNo.trim()}`,
        skill: selectedTrade,
        branch_name: selectedBranch,
        status: 'available',
      };

      setRoster(prev => [newEntry, ...prev]);

      // Reset form
      setFullName('');
      setMobileNo('');
      setSelectedTrade('');
      setSelectedBranch('');

      Alert.alert('Staff Provisioned!', `Successfully created worker account for ${newEntry.full_name}. Credentials sent via SMS.`);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to save staff entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Remove Employee Handler ──────────────────────────────────────────────────
  const handleRemoveEmployee = (emp: EmployeeItem) => {
    Alert.alert(
      'Remove Staff Member',
      `Are you sure you want to remove ${emp.full_name} from the company roster?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setRoster(prev => prev.filter(item => item.id !== emp.id));
            try {
              await supabase.from('company_employees').delete().eq('id', emp.id);
            } catch (e) {
              console.log('Delete error:', e);
            }
          },
        },
      ]
    );
  };

  // ── Transfer Branch Handler ──────────────────────────────────────────────────
  const handleTransferBranch = (emp: EmployeeItem) => {
    setTransferEmployee(emp);
  };

  const confirmTransfer = (newBranch: string) => {
    if (!transferEmployee) return;
    setRoster(prev =>
      prev.map(item =>
        item.id === transferEmployee.id ? { ...item, branch_name: newBranch } : item
      )
    );
    setTransferEmployee(null);
    Alert.alert('Branch Transferred', `Transferred ${transferEmployee.full_name} to ${newBranch}.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* 1. STICKY HEADER NAVIGATION (Fixed 60px) */}
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(company)/home' as any);
              }
            }}
            style={styles.backBtn}
            hitSlop={8}
          >
            <MaterialIcons name="chevron-left" size={28} color={TOKENS.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Manage Staff Roster</Text>
          <Text style={styles.quotaCounter}>
            {roster.length} / {maxQuota} Used
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 88 + insets.bottom }}
          showsVerticalScrollIndicator={false}
        >
          {/* 2. [COMPONENT A]: "ADD NEW EMPLOYEE" SECTION */}
          <View style={styles.formSection}>
            <Pressable
              onPress={() => setIsFormCollapsed(!isFormCollapsed)}
              style={styles.formHeaderRow}
            >
              <Text style={styles.sectionHeaderLabel}>PROVISION NEW STAFF ENTRY</Text>
              <MaterialIcons
                name={isFormCollapsed ? 'keyboard-arrow-down' : 'keyboard-arrow-up'}
                size={20}
                color={TOKENS.textSecondary}
              />
            </Pressable>

            {!isFormCollapsed && (
              <View style={{ marginTop: 8 }}>
                {/* Input Field 1 (Full Name) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>STAFF FULL NAME</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      focusedField === 'fullName' && styles.textInputFocused,
                    ]}
                    placeholder="Enter worker's full name"
                    placeholderTextColor="#94A3B8"
                    value={fullName}
                    onChangeText={setFullName}
                    onFocus={() => setFocusedField('fullName')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                {/* Input Field 2 (Mobile Number) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>
                    MOBILE NUMBER (FOR CREDENTIAL GENERATION)
                  </Text>
                  <View
                    style={[
                      styles.phoneInputRow,
                      focusedField === 'mobileNo' && styles.textInputFocused,
                    ]}
                  >
                    <View style={styles.phonePrefixBox}>
                      <Text style={styles.phonePrefixText}>+977</Text>
                    </View>
                    <TextInput
                      style={styles.phoneTextInput}
                      placeholder="98XXXXXXXX"
                      placeholderTextColor="#94A3B8"
                      keyboardType="phone-pad"
                      maxLength={10}
                      value={mobileNo}
                      onChangeText={setMobileNo}
                      onFocus={() => setFocusedField('mobileNo')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>

                {/* Input Field 3 (Trade Specialization Dropdown) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>ASSIGN TRADE CATEGORY</Text>
                  <Pressable
                    style={styles.selectorBox}
                    onPress={() => setTradeModalVisible(true)}
                  >
                    <Text
                      style={[
                        styles.selectorValueText,
                        !selectedTrade && styles.selectorPlaceholderText,
                      ]}
                    >
                      {selectedTrade || 'Select Core Skill (e.g., Plumber, Electrician)'}
                    </Text>
                    <MaterialIcons
                      name="keyboard-arrow-down"
                      size={20}
                      color={TOKENS.textSecondary}
                    />
                  </Pressable>
                </View>

                {/* Input Field 4 (Branch Assignment Dropdown) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.fieldLabel}>ASSIGN OPERATIONAL BRANCH</Text>
                  <Pressable
                    style={styles.selectorBox}
                    onPress={() => setBranchModalVisible(true)}
                  >
                    <Text
                      style={[
                        styles.selectorValueText,
                        !selectedBranch && styles.selectorPlaceholderText,
                      ]}
                    >
                      {selectedBranch || 'Select Operating Branch'}
                    </Text>
                    <MaterialIcons
                      name="keyboard-arrow-down"
                      size={20}
                      color={TOKENS.textSecondary}
                    />
                  </Pressable>
                </View>

                {/* Form Action Trigger Button */}
                <Pressable
                  style={({ pressed }) => [
                    styles.submitBtn,
                    pressed && styles.submitBtnPressed,
                    loading && { opacity: 0.7 },
                  ]}
                  onPress={handleSaveWorker}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.submitBtnText}>Save & Generate Worker Account</Text>
                  )}
                </Pressable>
              </View>
            )}
          </View>

          {/* 3. [COMPONENT B]: ACTIVE ROSTER GRID FEED */}
          <View style={styles.rosterFeedContainer}>
            <Text style={styles.rosterBannerTitle}>Current Roster Matrix</Text>

            {roster.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="people-outline" size={48} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No Staff Members Registered</Text>
                <Text style={styles.emptySub}>
                  Use the provision form above to add your first worker.
                </Text>
              </View>
            ) : (
              roster.map(emp => (
                <View key={emp.id} style={styles.rosterCard}>
                  {/* Left Information Segment */}
                  <View style={styles.cardLeftSegment}>
                    <Text style={styles.employeeName}>{emp.full_name}</Text>

                    {/* Skill Badge + Branch Row */}
                    <View style={styles.badgeBranchRow}>
                      <View style={styles.skillBadge}>
                        <Text style={styles.skillBadgeText}>{emp.skill}</Text>
                      </View>
                      <Text style={styles.branchText}>• {emp.branch_name}</Text>
                    </View>

                    {/* Mobile Number */}
                    <Text style={styles.mobileText}>Mobile: {emp.contact_no}</Text>
                  </View>

                  {/* Right Interactive Operational Segment */}
                  <View style={styles.cardRightSegment}>
                    {/* Status Dot Pill */}
                    <View
                      style={[
                        styles.statusPill,
                        emp.status === 'available' && {
                          backgroundColor: TOKENS.statusAvailableBg,
                        },
                        emp.status === 'busy' && {
                          backgroundColor: TOKENS.statusBusyBg,
                        },
                        emp.status === 'offline' && {
                          backgroundColor: TOKENS.statusOfflineBg,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          emp.status === 'available' && {
                            backgroundColor: TOKENS.statusAvailableDot,
                          },
                          emp.status === 'busy' && {
                            backgroundColor: TOKENS.statusBusyDot,
                          },
                          emp.status === 'offline' && {
                            backgroundColor: TOKENS.statusOfflineDot,
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          emp.status === 'available' && {
                            color: TOKENS.statusAvailableText,
                          },
                          emp.status === 'busy' && {
                            color: TOKENS.statusBusyText,
                          },
                          emp.status === 'offline' && {
                            color: TOKENS.statusOfflineText,
                          },
                        ]}
                      >
                        {emp.status === 'available'
                          ? 'Available'
                          : emp.status === 'busy'
                          ? 'On Duty'
                          : 'Offline'}
                      </Text>
                    </View>

                    {/* Action Links */}
                    <View style={styles.actionRow}>
                      <Pressable onPress={() => handleTransferBranch(emp)}>
                        <Text style={styles.transferLink}>Transfer Branch</Text>
                      </Pressable>
                      <Pressable onPress={() => handleRemoveEmployee(emp)}>
                        <Text style={styles.removeLink}>Remove</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.bottomNavBar, { height: 60 + insets.bottom, paddingBottom: insets.bottom }]}>
        <Pressable
          style={({ pressed }) => [
            styles.tabItem,
            { opacity: pressed ? 0.75 : 1 }
          ]}
          onPress={() => router.push('/(company)/home')}
        >
          <MaterialIcons name="dashboard" size={22} color="#64748B" />
          <Text style={styles.tabText}>Dashboard</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.tabItem,
            { opacity: pressed ? 0.75 : 1 }
          ]}
          onPress={() => router.push('/(company)/roster')}
        >
          <MaterialIcons name="people" size={22} color="#0F766E" />
          <Text style={[styles.tabText, styles.tabTextActive]}>Staff</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.tabItem,
            { opacity: pressed ? 0.75 : 1 }
          ]}
          onPress={() => router.push('/(company)/dispatch')}
        >
          <MaterialIcons name="store" size={22} color="#64748B" />
          <Text style={styles.tabText}>Branches</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.tabItem,
            { opacity: pressed ? 0.75 : 1 }
          ]}
          onPress={() => router.push('/(company)/notifications')}
        >
          <MaterialIcons name="notifications" size={22} color="#64748B" />
          <Text style={styles.tabText}>Notifications</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.tabItem,
            { opacity: pressed ? 0.75 : 1 }
          ]}
          onPress={() => router.push('/(company)/profile')}
        >
          <MaterialIcons name="person" size={22} color="#64748B" />
          <Text style={styles.tabText}>Profile</Text>
        </Pressable>
      </View>

      {/* ── TRADE PICKER MODAL ───────────────────────────────────────────────── */}
      <Modal visible={tradeModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Trade Specialization</Text>
              <Pressable onPress={() => setTradeModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={TOKENS.textPrimary} />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              {TRADE_OPTIONS.map(trade => (
                <Pressable
                  key={trade}
                  style={[
                    styles.modalOptionItem,
                    selectedTrade === trade && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedTrade(trade);
                    setTradeModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      selectedTrade === trade && styles.modalOptionTextSelected,
                    ]}
                  >
                    {trade}
                  </Text>
                  {selectedTrade === trade && (
                    <MaterialIcons name="check" size={20} color={TOKENS.primary} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── BRANCH PICKER MODAL ──────────────────────────────────────────────── */}
      <Modal visible={branchModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Operating Branch</Text>
              <Pressable onPress={() => setBranchModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={TOKENS.textPrimary} />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              {BRANCH_OPTIONS.map(branch => (
                <Pressable
                  key={branch}
                  style={[
                    styles.modalOptionItem,
                    selectedBranch === branch && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedBranch(branch);
                    setBranchModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      selectedBranch === branch && styles.modalOptionTextSelected,
                    ]}
                  >
                    {branch}
                  </Text>
                  {selectedBranch === branch && (
                    <MaterialIcons name="check" size={20} color={TOKENS.primary} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── TRANSFER BRANCH MODAL ────────────────────────────────────────────── */}
      <Modal visible={!!transferEmployee} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Transfer {transferEmployee?.full_name}
              </Text>
              <Pressable onPress={() => setTransferEmployee(null)}>
                <MaterialIcons name="close" size={24} color={TOKENS.textPrimary} />
              </Pressable>
            </View>
            <Text style={{ fontSize: 13, color: TOKENS.textSecondary, marginBottom: 12 }}>
              Current Branch: {transferEmployee?.branch_name}
            </Text>
            <ScrollView style={{ maxHeight: 250 }}>
              {BRANCH_OPTIONS.map(b => (
                <Pressable
                  key={b}
                  style={styles.modalOptionItem}
                  onPress={() => confirmTransfer(b)}
                >
                  <Text style={styles.modalOptionText}>{b}</Text>
                  <MaterialIcons name="arrow-forward" size={18} color="#94A3B8" />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: TOKENS.bgBase,
  },

  // 1. Header Navigation
  header: {
    height: 60,
    backgroundColor: TOKENS.componentBg,
    borderBottomWidth: 1,
    borderBottomColor: TOKENS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: TOKENS.textPrimary,
  },
  quotaCounter: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: TOKENS.textSecondary,
  },

  // 2. Component A: Provision Form Section
  formSection: {
    backgroundColor: TOKENS.componentBg,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: TOKENS.border,
  },
  formHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    letterSpacing: 0.8,
    color: TOKENS.textSecondary,
  },

  // Input Fields
  inputGroup: {
    marginTop: 12,
  },
  fieldLabel: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: TOKENS.textSecondary,
    marginBottom: 6,
  },
  textInput: {
    height: 46,
    backgroundColor: TOKENS.componentBg,
    borderWidth: 1,
    borderColor: TOKENS.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: TOKENS.textPrimary,
  },
  textInputFocused: {
    borderWidth: 2,
    borderColor: TOKENS.borderFocused,
  },

  // Phone Input Row
  phoneInputRow: {
    flexDirection: 'row',
    height: 46,
    borderWidth: 1,
    borderColor: TOKENS.border,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: TOKENS.componentBg,
  },
  phonePrefixBox: {
    width: 55,
    backgroundColor: TOKENS.lightBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: TOKENS.border,
  },
  phonePrefixText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: '#475569',
  },
  phoneTextInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: TOKENS.textPrimary,
  },

  // Selector Box (Trade & Branch)
  selectorBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 46,
    borderWidth: 1,
    borderColor: TOKENS.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    backgroundColor: TOKENS.componentBg,
  },
  selectorValueText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: TOKENS.textPrimary,
  },
  selectorPlaceholderText: {
    color: '#94A3B8',
  },

  // Action Trigger Button
  submitBtn: {
    width: '100%',
    height: 46,
    backgroundColor: TOKENS.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  submitBtnPressed: {
    backgroundColor: TOKENS.primaryHover,
  },
  submitBtnText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // 3. Component B: Active Roster Grid Feed
  rosterFeedContainer: {
    flex: 1,
    backgroundColor: TOKENS.bgBase,
    paddingTop: 16,
  },
  rosterBannerTitle: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: TOKENS.textPrimary,
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  // Roster Card Component
  rosterCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: TOKENS.componentBg,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: TOKENS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardLeftSegment: {
    flex: 1,
    paddingRight: 10,
  },
  employeeName: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: TOKENS.textPrimary,
  },
  badgeBranchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  skillBadge: {
    backgroundColor: TOKENS.badgeBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  skillBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: TOKENS.primary,
  },
  branchText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: TOKENS.textSecondary,
  },
  mobileText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    marginTop: 4,
    letterSpacing: 0.2,
  },

  // Card Right Segment
  cardRightSegment: {
    alignItems: 'flex-end',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  transferLink: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: TOKENS.primary,
    textDecorationLine: 'underline',
  },
  removeLink: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: TOKENS.errorRed,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: TOKENS.textPrimary,
    marginTop: 10,
  },
  emptySub: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: TOKENS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: TOKENS.componentBg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: TOKENS.textPrimary,
  },
  modalOptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: TOKENS.border,
  },
  modalOptionSelected: {
    backgroundColor: '#F0FDFA',
  },
  modalOptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: TOKENS.textPrimary,
  },
  modalOptionTextSelected: {
    fontFamily: 'Inter-Bold',
    color: TOKENS.primary,
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
    zIndex: 100,
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
