import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function NotificationCenter() {
  const insets = useSafeAreaInsets();
  const notifications = [
    {
      id: '1',
      type: 'broadcast',
      title: 'New Broadcast: Plumbing Repair',
      message: 'A new plumbing repair request is available in your area (Lazimpat).',
      time: '10 mins ago',
      read: false,
    },
    {
      id: '2',
      type: 'system',
      title: 'Verification Approved',
      message: 'Your PAN/VAT documents have been approved by the admin.',
      time: '2 hours ago',
      read: true,
    },
    {
      id: '3',
      type: 'billing',
      title: 'Subscription Expiring Soon',
      message: 'Your Company Growth tier expires in 3 days. Renew to avoid interruption.',
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
      case 'broadcast': return '#b45309';
      case 'system': return '#0f766e';
      case 'billing': return '#be123c';
      default: return '#64748b';
    }
  };

  const getBgColorForType = (type: string) => {
    switch (type) {
      case 'broadcast': return '#fef3c7';
      case 'system': return '#ccfbf1';
      case 'billing': return '#ffe4e6';
      default: return '#f1f5f9';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 bg-white border-b border-slate-200 justify-between">
        <View className="flex-row items-center">
          <Pressable 
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(company)/home' as any);
              }
            }} 
            className="mr-4"
          >
            <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
          </Pressable>
          <Text className="text-lg font-bold text-slate-900">Notifications</Text>
        </View>
        <Pressable>
          <Text className="text-teal-600 font-semibold text-sm">Mark all as read</Text>
        </Pressable>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 88 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {notifications.map((notif) => (
          <Pressable 
            key={notif.id} 
            className={`px-4 py-4 border-b border-slate-100 flex-row gap-4 ${notif.read ? 'bg-white' : 'bg-slate-50'}`}
          >
            <View 
              className="w-12 h-12 rounded-full items-center justify-center mt-1"
              style={{ backgroundColor: getBgColorForType(notif.type) }}
            >
              <MaterialIcons name={getIconForType(notif.type) as any} size={24} color={getColorForType(notif.type)} />
            </View>
            <View className="flex-1">
              <View className="flex-row justify-between items-start mb-1">
                <Text className={`font-bold text-base ${notif.read ? 'text-slate-700' : 'text-slate-900'}`}>
                  {notif.title}
                </Text>
                {!notif.read && <View className="w-2 h-2 bg-rose-500 rounded-full mt-2" />}
              </View>
              <Text className={`text-sm mb-2 ${notif.read ? 'text-slate-500' : 'text-slate-700'}`}>
                {notif.message}
              </Text>
              <Text className="text-xs text-slate-400 font-medium">{notif.time}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      <View 
        style={{ 
          height: 60 + insets.bottom, 
          paddingBottom: insets.bottom,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 5,
          zIndex: 100,
        }}
      >
        {/* Tab 1: Dashboard */}
        <Pressable
          style={({ pressed }) => [
            { alignItems: 'center', justifyContent: 'center', paddingTop: 8, flex: 1 },
            { opacity: pressed ? 0.75 : 1 }
          ]}
          onPress={() => router.push('/(company)/home')}
        >
          <MaterialIcons name="dashboard" size={22} color="#64748B" />
          <Text style={{ fontSize: 10, fontWeight: '600', fontFamily: 'Inter-SemiBold', color: '#64748B', marginTop: 4 }}>Dashboard</Text>
        </Pressable>

        {/* Tab 2: Staff */}
        <Pressable
          style={({ pressed }) => [
            { alignItems: 'center', justifyContent: 'center', paddingTop: 8, flex: 1 },
            { opacity: pressed ? 0.75 : 1 }
          ]}
          onPress={() => router.push('/(company)/roster')}
        >
          <MaterialIcons name="people" size={22} color="#64748B" />
          <Text style={{ fontSize: 10, fontWeight: '600', fontFamily: 'Inter-SemiBold', color: '#64748B', marginTop: 4 }}>Staff</Text>
        </Pressable>

        {/* Tab 3: Branches */}
        <Pressable
          style={({ pressed }) => [
            { alignItems: 'center', justifyContent: 'center', paddingTop: 8, flex: 1 },
            { opacity: pressed ? 0.75 : 1 }
          ]}
          onPress={() => router.push('/(company)/dispatch')}
        >
          <MaterialIcons name="store" size={22} color="#64748B" />
          <Text style={{ fontSize: 10, fontWeight: '600', fontFamily: 'Inter-SemiBold', color: '#64748B', marginTop: 4 }}>Branches</Text>
        </Pressable>

        {/* Tab 4: Notifications (Active) */}
        <Pressable
          style={({ pressed }) => [
            { alignItems: 'center', justifyContent: 'center', paddingTop: 8, flex: 1 },
            { opacity: pressed ? 0.75 : 1 }
          ]}
          onPress={() => router.push('/(company)/notifications')}
        >
          <MaterialIcons name="notifications" size={22} color="#0F766E" />
          <Text style={{ fontSize: 10, fontWeight: '600', fontFamily: 'Inter-SemiBold', color: '#0F766E', marginTop: 4 }}>Notifications</Text>
        </Pressable>

        {/* Tab 5: Profile */}
        <Pressable
          style={({ pressed }) => [
            { alignItems: 'center', justifyContent: 'center', paddingTop: 8, flex: 1 },
            { opacity: pressed ? 0.75 : 1 }
          ]}
          onPress={() => router.push('/(company)/profile')}
        >
          <MaterialIcons name="person" size={22} color="#64748B" />
          <Text style={{ fontSize: 10, fontWeight: '600', fontFamily: 'Inter-SemiBold', color: '#64748B', marginTop: 4 }}>Profile</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
