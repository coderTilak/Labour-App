import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Theme';
import { router } from 'expo-router';

export default function WorkerNotificationsScreen() {
  const notifications = [
    {
      id: '1',
      type: 'broadcast',
      title: 'New Job Broadcast',
      message: 'Plumbing Repair requested by Hari Prasad in Baneshwor (2.5 km away).',
      time: '10 mins ago',
      read: false,
    },
    {
      id: '2',
      type: 'system',
      title: 'Verification Pending',
      message: 'Please complete your citizenship document verification in Profile Setup.',
      time: '2 hours ago',
      read: false,
    },
    {
      id: '3',
      type: 'billing',
      title: 'Subscription Active',
      message: 'Your Independent Labour Pass is active. Next payment: 19 August 2026.',
      time: '1 day ago',
      read: true,
    },
  ];

  const getIconForType = (type: string) => {
    switch (type) {
      case 'broadcast': return 'campaign';
      case 'system': return 'verified-user';
      case 'billing': return 'payment';
      default: return 'notifications';
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'broadcast': return Colors.accent;
      case 'system': return Colors.primary;
      case 'billing': return Colors.success;
      default: return Colors.textSecondary;
    }
  };

  const getBgColorForType = (type: string) => {
    switch (type) {
      case 'broadcast': return '#FFF7ED'; // Orange 50
      case 'system': return '#CCFBF1'; // Teal 50
      case 'billing': return '#DCFCE7'; // Green 50
      default: return Colors.background;
    }
  };

  const handleMarkAllRead = () => {
    Alert.alert('Success', 'All notifications marked as read.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inbox & Notifications</Text>
        <Pressable onPress={handleMarkAllRead} hitSlop={8}>
          <Text style={styles.markReadText}>Mark all read</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {notifications.map((notif) => (
          <Pressable 
            key={notif.id} 
            style={[styles.notificationCard, notif.read ? styles.readCard : styles.unreadCard]}
            onPress={() => {
              if (notif.type === 'system') {
                router.push('/(worker)/profile-setup');
              } else if (notif.type === 'broadcast') {
                router.push('/(worker)/(tabs)/home');
              }
            }}
          >
            <View 
              style={[styles.iconContainer, { backgroundColor: getBgColorForType(notif.type) }]}
            >
              <MaterialIcons name={getIconForType(notif.type) as any} size={24} color={getColorForType(notif.type)} />
            </View>
            <View style={styles.textContainer}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, !notif.read && styles.unreadText]}>
                  {notif.title}
                </Text>
                {!notif.read && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.message}>{notif.message}</Text>
              <Text style={styles.time}>{notif.time}</Text>
            </View>
          </Pressable>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  markReadText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
  },
  scrollContent: {
    flex: 1,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  readCard: {
    backgroundColor: Colors.surface,
  },
  unreadCard: {
    backgroundColor: '#F8FAFC',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: Colors.textSecondary,
  },
  unreadText: {
    fontFamily: 'Inter-Bold',
    color: Colors.textPrimary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  message: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  time: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: Colors.placeholder,
  },
});
