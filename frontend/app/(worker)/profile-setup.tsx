import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Theme';

export default function WorkerProfileSetupScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Nepal');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

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
          .from('worker_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (profile) {
          setFullName(profile.full_name || '');
          setPhone(profile.phone_number || '');
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
    if (!fullName.trim() || !city.trim() || selectedServices.length === 0) {
      Alert.alert('Incomplete Profile', 'Please fill out your name, city, and select at least one service you provide.');
      return;
    }

    setLoading(true);
    try {
      // 1. Update/Insert profile
      const { error: profileError } = await supabase.from('worker_profiles').upsert({
        user_id: user.id,
        full_name: fullName.trim(),
        phone_number: phone.trim(),
        city: city.trim(),
        country: country.trim(),
        updated_at: new Date().toISOString(),
      });

      if (profileError) throw profileError;

      // 2. Update services (Delete existing, then insert new)
      await supabase
        .from('provider_services')
        .delete()
        .eq('provider_user_id', user.id);

      if (selectedServices.length > 0) {
        const serviceInserts = selectedServices.map(categoryId => ({
          provider_user_id: user.id,
          provider_type: 'worker',
          category_id: categoryId,
        }));
        
        const { error: serviceError } = await supabase
          .from('provider_services')
          .insert(serviceInserts);
          
        if (serviceError) throw serviceError;
      }

      router.replace('/(worker)/(tabs)/home');
    } catch (err: any) {
      console.error('Error saving profile:', err);
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
            <Text style={styles.headerTitle}>Worker Profile Setup</Text>
            <Text style={styles.headerSubtitle}>Tell customers what you do</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. John Doe"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. +977 9800000000"
            value={phone}
            onChangeText={setPhone}
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
          <Text style={styles.sectionTitle}>Services You Provide *</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply. This helps you rank in searches.</Text>
          
          <View style={styles.servicesGrid}>
            {categories.map((cat) => {
              const isSelected = selectedServices.includes(cat.id);
              return (
                <Pressable
                  key={cat.id}
                  style={[styles.serviceChip, isSelected && styles.serviceChipSelected]}
                  onPress={() => toggleService(cat.id)}
                >
                  <MaterialIcons 
                    name={(cat.icon_name || 'handyman') as any} 
                    size={16} 
                    color={isSelected ? '#FFFFFF' : Colors.textPrimary} 
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.serviceChipText, isSelected && styles.serviceChipTextSelected]}>
                    {cat.display_name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

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
});
