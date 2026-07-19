import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabase';

export default function CompanyProfile() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappNo, setWhatsappNo] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Nepal');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        // 1. Fetch categories
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('display_name', { ascending: true });
          
        if (catData && !catError) {
          setCategories(catData);
        }

        // 2. Fetch company profile
        const { data: profile } = await supabase
          .from('company_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (profile) {
          setCompanyName(profile.company_name || '');
          setContactPerson(profile.contact_person || '');
          setPhone(profile.contact_no || profile.phone_number || '');
          setWhatsappNo(profile.whatsapp_no || '');
          setCity(profile.city || '');
          setCountry(profile.country || 'Nepal');
        }

        // 3. Fetch selected services
        const { data: services } = await supabase
          .from('provider_services')
          .select('category_id')
          .eq('provider_user_id', user.id);
          
        if (services) {
          setSelectedServices(services.map(s => s.category_id));
        }
      } catch (err) {
        console.error('Error loading profile data:', err);
      } finally {
        setLoadingData(false);
      }
    }
    
    loadData();
  }, [user]);

  const toggleService = (categoryId: string) => {
    if (selectedServices.includes(categoryId)) {
      setSelectedServices(selectedServices.filter(id => id !== categoryId));
    } else {
      setSelectedServices([...selectedServices, categoryId]);
    }
  };

  const handleSaveChanges = async () => {
    if (!user) return;
    if (!companyName.trim() || !city.trim() || selectedServices.length === 0) {
      Alert.alert('Incomplete Profile', 'Company name, city, and at least one service must be filled.');
      return;
    }

    setLoading(true);
    try {
      // 1. Upsert company profile details
      const { error: profileError } = await supabase.from('company_profiles').upsert({
        user_id: user.id,
        company_name: companyName.trim(),
        contact_person: contactPerson.trim(),
        contact_no: phone.trim(),
        whatsapp_no: whatsappNo.trim(),
        city: city.trim(),
        country: country.trim(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      if (profileError) throw profileError;

      // 2. Refresh provider services selection
      await supabase
        .from('provider_services')
        .delete()
        .eq('provider_user_id', user.id);

      if (selectedServices.length > 0) {
        const serviceInserts = selectedServices.map(categoryId => ({
          provider_user_id: user.id,
          provider_type: 'company',
          category_id: categoryId,
        }));
        
        const { error: serviceError } = await supabase
          .from('provider_services')
          .insert(serviceInserts);
          
        if (serviceError) throw serviceError;
      }

      Alert.alert('Success', 'Company profile and service details updated successfully!');
    } catch (err: any) {
      console.error('Error saving company profile:', err);
      Alert.alert('Error', err.message || 'Failed to save changes.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await supabase.auth.signOut();
            router.replace('/(auth)/sign-in');
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to sign out');
          }
        }
      }
    ]);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(company)/home' as any);
    }
  };

  const handleTabPress = (panelName: string, route: string) => {
    if (route) {
      router.push(route as any);
    } else {
      Alert.alert('Workspace Information', `${panelName} is currently up to date.`);
    }
  };

  if (loadingData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0F766E" />
        <Text style={{ marginTop: 12, color: '#64748B', fontFamily: 'Inter-Medium' }}>Loading profile details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backBtn,
              { opacity: pressed ? 0.75 : 1 }
            ]}
          >
            <MaterialIcons name="arrow-back" size={24} color="#0F172A" />
          </Pressable>
          <Text style={styles.headerTitle}>Company Profile</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 88 + insets.bottom }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Company Details</Text>
        
        <View style={styles.formCard}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Company Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. BuildWell Construction Pvt. Ltd."
              value={companyName}
              onChangeText={setCompanyName}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Contact Person</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Jane Doe"
              value={contactPerson}
              onChangeText={setContactPerson}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Company Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. +977 14000000"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Company WhatsApp Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. +977 9800000000"
              value={whatsappNo}
              onChangeText={setWhatsappNo}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Kathmandu"
                value={city}
                onChangeText={setCity}
              />
            </View>
            <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Country</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Nepal"
                value={country}
                onChangeText={setCountry}
              />
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Provided Services *</Text>
        <Text style={styles.sectionSubtitle}>Only selected service categories are shown below. Use the "+ Add Services" button to add or modify categories.</Text>

        <View style={styles.servicesGrid}>
          {categories.filter((cat) => selectedServices.includes(cat.id)).map((cat) => {
            return (
              <Pressable
                key={cat.id}
                style={styles.serviceChipSelectedGreen}
                onPress={() => toggleService(cat.id)}
              >
                <MaterialIcons 
                  name={(cat.icon_name || 'handyman') as any} 
                  size={16} 
                  color="#FFFFFF" 
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.serviceChipTextSelectedGreen}>
                  {cat.display_name}
                </Text>
                <MaterialIcons name="close" size={14} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </Pressable>
            );
          })}
          
          <Pressable 
            style={styles.addServiceBtn}
            onPress={() => setModalVisible(true)}
          >
            <MaterialIcons name="add" size={18} color="#0F766E" />
            <Text style={styles.addServiceBtnText}>Add Services</Text>
          </Pressable>
        </View>

        {/* Modal for selecting categories */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Services</Text>
                <Pressable onPress={() => setModalVisible(false)} hitSlop={8}>
                  <MaterialIcons name="close" size={24} color="#0F172A" />
                </Pressable>
              </View>
              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.modalGrid}>
                  {categories.map((cat) => {
                    const isSelected = selectedServices.includes(cat.id);
                    return (
                      <Pressable
                        key={cat.id}
                        style={[styles.modalChip, isSelected && styles.modalChipSelected]}
                        onPress={() => toggleService(cat.id)}
                      >
                        <MaterialIcons 
                          name={(cat.icon_name || 'handyman') as any} 
                          size={18} 
                          color={isSelected ? '#FFFFFF' : '#0F172A'} 
                          style={{ marginRight: 8 }}
                        />
                        <Text style={[styles.modalChipText, isSelected && styles.modalChipTextSelected]}>
                          {cat.display_name}
                        </Text>
                        {isSelected && (
                          <MaterialIcons name="check" size={14} color="#FFFFFF" style={{ marginLeft: 6 }} />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
              <Pressable 
                style={styles.modalDoneBtn} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalDoneBtnText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <View style={styles.actionsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.saveBtn,
              loading && { opacity: 0.7 },
              { opacity: pressed ? 0.75 : 1 }
            ]}
            onPress={handleSaveChanges}
            disabled={loading}
          >
            <Text style={styles.saveBtnText}>{loading ? 'Saving Changes...' : 'Save Changes'}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.signOutBtn,
              { opacity: pressed ? 0.75 : 1 }
            ]}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutBtnText}>Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={[styles.bottomNavBar, { height: 60 + insets.bottom, paddingBottom: insets.bottom }]}>
        <Pressable
          style={({ pressed }) => [
            styles.tabItem,
            { opacity: pressed ? 0.75 : 1 }
          ]}
          onPress={() => handleTabPress('Dashboard', '/(company)/home')}
        >
          <MaterialIcons name="dashboard" size={22} color="#64748B" />
          <Text style={styles.tabText}>Dashboard</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.tabItem,
            { opacity: pressed ? 0.75 : 1 }
          ]}
          onPress={() => handleTabPress('Staff Roster', '/(company)/roster')}
        >
          <MaterialIcons name="people" size={22} color="#64748B" />
          <Text style={styles.tabText}>Staff</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.tabItem,
            { opacity: pressed ? 0.75 : 1 }
          ]}
          onPress={() => handleTabPress('Branch Configurations', '/(company)/dispatch')}
        >
          <MaterialIcons name="store" size={22} color="#64748B" />
          <Text style={styles.tabText}>Branches</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.tabItem,
            { opacity: pressed ? 0.75 : 1 }
          ]}
          onPress={() => handleTabPress('Notifications', '/(company)/notifications')}
        >
          <MaterialIcons name="notifications" size={22} color="#64748B" />
          <Text style={styles.tabText}>Notifications</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.tabItem,
            { opacity: pressed ? 0.75 : 1 }
          ]}
          onPress={() => handleTabPress('Profile', '/(company)/profile')}
        >
          <MaterialIcons name="person" size={22} color="#0F766E" />
          <Text style={[styles.tabText, styles.tabTextActive]}>Profile</Text>
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
  headerWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    zIndex: 10,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#0F172A',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#0F172A',
    marginBottom: 8,
    marginTop: 12,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 12,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
    color: '#0F172A',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#0F172A',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 28,
  },
  serviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  serviceChipSelected: {
    backgroundColor: '#0F766E',
    borderColor: '#0F766E',
  },
  serviceChipText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    color: '#0F172A',
  },
  serviceChipTextSelected: {
    color: '#FFFFFF',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  saveBtn: {
    backgroundColor: '#0F766E',
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  signOutBtn: {
    backgroundColor: '#0F766E',
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutBtnText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  serviceChipSelectedGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    borderWidth: 1,
    borderColor: '#16A34A',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  serviceChipTextSelectedGreen: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    color: '#FFFFFF',
  },
  addServiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addServiceBtnText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: '#0F766E',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: '#0F172A',
  },
  modalScroll: {
    marginBottom: 20,
  },
  modalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  modalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  modalChipSelected: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  modalChipText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#0F172A',
  },
  modalChipTextSelected: {
    color: '#FFFFFF',
  },
  modalDoneBtn: {
    backgroundColor: '#0F766E',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDoneBtnText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    fontWeight: '600',
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
