import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Theme';

export default function CompanyProfileSetupScreen() {
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
      // Fetch categories
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_name', { ascending: true });
        
      if (data && !error) {
        setCategories(data);
      }
      
      // Check if profile exists to pre-fill
      if (user) {
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

        // Fetch selected services
        const { data: services } = await supabase
          .from('provider_services')
          .select('category_id')
          .eq('provider_user_id', user.id);
          
        if (services) {
          setSelectedServices(services.map(s => s.category_id));
        }
      }
      
      setLoadingData(false);
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

  const handleSave = async () => {
    if (!user) return;
    if (!companyName.trim() || !city.trim() || selectedServices.length === 0) {
      Alert.alert('Incomplete Profile', 'Please fill out company name, city, and select at least one service your company provides.');
      return;
    }

    setLoading(true);
    try {
      // 1. Update/Insert profile
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

      // 2. Update services (Delete existing, then insert new)
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

      router.replace('/(company)/home' as any);
    } catch (err: any) {
      console.error('Error saving company profile:', err);
      Alert.alert('Error', err.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable 
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/role-selection');
              }
            }} 
            style={({ pressed }) => [
              { marginRight: 12, paddingVertical: 4 },
              { opacity: pressed ? 0.75 : 1 }
            ]}
          >
            <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Company Profile Setup</Text>
            <Text style={styles.headerSubtitle}>Set up your business presence</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Company Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. BuildWell Services Pvt. Ltd."
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

        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Services Your Company Provides *</Text>
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

      </ScrollView>

      <View style={styles.footer}>
        <Pressable 
          style={[styles.saveBtn, loading && { opacity: 0.7 }]} 
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveBtnText}>{loading ? 'Saving...' : 'Save & Continue'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: Colors.textPrimary,
  },
  servicesSection: {
    marginTop: 8,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  serviceChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  serviceChipText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  serviceChipTextSelected: {
    color: '#FFFFFF',
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
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
});
