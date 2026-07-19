import React from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function MobileDispatch() {
  const insets = useSafeAreaInsets();
  const incomingRequests = [
    { id: 'BK-1045', service: 'Plumbing - Pipe Leak', location: 'Lazimpat', time: '10:00 AM' },
    { id: 'BK-1046', service: 'Electrical - Wiring', location: 'Patan', time: '2:00 PM' },
  ];

  const handleAcceptAssign = (id: string, service: string) => {
    Alert.alert('Dispatch Assigned', `Job ${id} (${service}) has been successfully accepted and assigned to the local branch.`);
  };

  const handleDecline = (id: string) => {
    Alert.alert('Broadcast Declined', `Broadcast request ${id} was declined.`);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 bg-white border-b border-slate-200">
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
        <Text className="flex-1 text-lg font-bold text-slate-900">Mobile Dispatch</Text>
      </View>

      <ScrollView 
        className="flex-1 px-4 py-6" 
        contentContainerStyle={{ paddingBottom: 88 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-sm font-bold text-slate-500 uppercase tracking-wider">Incoming Broadcasts</Text>
          <View className="bg-rose-100 px-2 py-1 rounded-full">
            <Text className="text-xs font-bold text-rose-700">2 Pending</Text>
          </View>
        </View>

        {incomingRequests.map((req) => (
          <View key={req.id} className="bg-white rounded-xl p-4 mb-4 border border-slate-200 shadow-sm">
            <View className="flex-row justify-between items-start mb-2">
              <View>
                <Text className="text-xs font-bold text-slate-400 uppercase">{req.id}</Text>
                <Text className="font-bold text-slate-900 text-lg">{req.service}</Text>
              </View>
            </View>
            
            <View className="flex-row items-center mt-2 mb-4">
              <MaterialIcons name="place" size={16} color="#64748b" />
              <Text className="text-sm text-slate-600 ml-1 mr-4">{req.location}</Text>
              <MaterialIcons name="access-time" size={16} color="#64748b" />
              <Text className="text-sm text-slate-600 ml-1">{req.time}</Text>
            </View>

            <View className="flex-row gap-2">
              <Pressable 
                onPress={() => handleAcceptAssign(req.id, req.service)} 
                className="flex-1 bg-teal-600 py-3 rounded-lg items-center"
              >
                <Text className="text-white font-semibold">Accept & Assign</Text>
              </Pressable>
              <Pressable 
                onPress={() => handleDecline(req.id)} 
                className="bg-slate-100 py-3 px-4 rounded-lg items-center"
              >
                <MaterialIcons name="close" size={20} color="#64748b" />
              </Pressable>
            </View>
          </View>
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

        {/* Tab 3: Branches (Active) */}
        <Pressable
          style={({ pressed }) => [
            { alignItems: 'center', justifyContent: 'center', paddingTop: 8, flex: 1 },
            { opacity: pressed ? 0.75 : 1 }
          ]}
          onPress={() => router.push('/(company)/dispatch')}
        >
          <MaterialIcons name="store" size={22} color="#0F766E" />
          <Text style={{ fontSize: 10, fontWeight: '600', fontFamily: 'Inter-SemiBold', color: '#0F766E', marginTop: 4 }}>Branches</Text>
        </Pressable>

        {/* Tab 4: Notifications */}
        <Pressable
          style={({ pressed }) => [
            { alignItems: 'center', justifyContent: 'center', paddingTop: 8, flex: 1 },
            { opacity: pressed ? 0.75 : 1 }
          ]}
          onPress={() => router.push('/(company)/notifications')}
        >
          <MaterialIcons name="notifications" size={22} color="#64748B" />
          <Text style={{ fontSize: 10, fontWeight: '600', fontFamily: 'Inter-SemiBold', color: '#64748B', marginTop: 4 }}>Notifications</Text>
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
