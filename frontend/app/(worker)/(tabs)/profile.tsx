import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Theme';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'expo-router';
import { supabase } from '../../../utils/supabase';

export default function WorkerProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWorkerProfile() {
      if (!user) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('worker_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (data && !error) {
          setProfileData(data);
        }
      } catch (err) {
        console.error('Error loading worker profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadWorkerProfile();
  }, [user]);

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Sign Out', 
        style: 'destructive',
        onPress: async () => {
          try {
            await supabase.auth.signOut();
            router.replace('/(auth)/sign-in');
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to sign out.');
          }
        }
      }
    ]);
  };

  const handleEditProfile = () => {
    router.push('/(worker)/profile-setup');
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const name = profileData?.full_name || 'Independent Worker';
  const phone = profileData?.phone_number || 'Not Set';
  const location = profileData?.city ? `${profileData.city}, ${profileData.country || 'Nepal'}` : 'Not Set';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Worker Profile</Text>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <MaterialIcons name="person" size={50} color="#CBD5E1" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{name}</Text>
            <Text style={styles.userRole}>Independent Tradesperson</Text>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={handleEditProfile}>
            <MaterialIcons name="edit" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Profile Info Sections */}
        <Text style={styles.sectionTitle}>Contact & Location</Text>
        <View style={styles.infoBlock}>
          <View style={styles.infoRow}>
            <MaterialIcons name="phone" size={20} color={Colors.textSecondary} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>{phone}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="place" size={20} color={Colors.textSecondary} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Location Address</Text>
              <Text style={styles.infoValue}>{location}</Text>
            </View>
          </View>
        </View>

        {/* Visibility Details */}
        <Text style={styles.sectionTitle}>Account Details</Text>
        <View style={styles.infoBlock}>
          <View style={styles.infoRow}>
            <MaterialIcons name="verified-user" size={20} color={Colors.textSecondary} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Verification Status</Text>
              <Text style={styles.infoValue}>{profileData?.verification_status === 'approved' ? 'Verified' : 'Pending'}</Text>
            </View>
          </View>
          <View style={styles.infoRow} style={styles.noBorderRow}>
            <MaterialIcons name="star-outline" size={20} color={Colors.textSecondary} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Average Rating</Text>
              <Text style={styles.infoValue}>{profileData?.average_rating ? `${profileData.average_rating} ★` : 'No reviews yet'}</Text>
            </View>
          </View>
        </View>

        {/* Actions Zone */}
        <View style={styles.actionsZone}>
          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
            <MaterialIcons name="logout" size={20} color="#FFFFFF" />
            <Text style={styles.signOutText}>Sign Out</Text>
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
  scrollContent: {
    padding: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Colors.textPrimary,
  },
  userRole: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  editBtn: {
    padding: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  infoBlock: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  noBorderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: Colors.placeholder,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  actionsZone: {
    marginTop: 12,
    marginBottom: 32,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  signOutText: {
    fontSize: 15,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
});
