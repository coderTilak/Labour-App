import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function BroadcastSelectScreen() {
  const [bidders, setBidders] = useState([
    {
      id: '1',
      name: 'Ram Bahadur Thapa',
      rating: 4.8,
      distance: '2.1 km',
      status: 'accepted',
      price: 'NPR 1,200',
    },
    {
      id: '2',
      name: 'Bikash Gurung',
      rating: 4.3,
      distance: '5.2 km',
      status: 'accepted',
      price: 'NPR 1,000',
    }
  ]);

  const selectBidder = (id: string) => {
    // In a real app, this would update the broadcast and booking status
    console.log('Selected provider', id);
    router.replace('/(customer)/home');
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 bg-white border-b border-slate-200">
        <Pressable onPress={() => router.back()} className="mr-4">
          <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
        </Pressable>
        <Text className="flex-1 text-lg font-bold text-slate-900 text-center mr-6">
          Review Acceptances
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        <Text className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">
          Providers who accepted your broadcast
        </Text>
        
        {bidders.map((bidder) => (
          <View key={bidder.id} className="bg-white rounded-xl p-4 mb-4 border border-slate-200 shadow-sm">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-full bg-slate-100 items-center justify-center mr-3">
                  <MaterialIcons name="person" size={24} color="#94a3b8" />
                </View>
                <View>
                  <Text className="font-bold text-slate-900 text-base">{bidder.name}</Text>
                  <View className="flex-row items-center mt-1">
                    <MaterialIcons name="star" size={14} color="#f59e0b" />
                    <Text className="text-sm font-semibold text-slate-700 ml-1 mr-3">{bidder.rating}</Text>
                    <MaterialIcons name="place" size={14} color="#64748b" />
                    <Text className="text-sm text-slate-500 ml-1">{bidder.distance}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="flex-row items-center justify-between mt-2 pt-3 border-t border-slate-100">
              <View>
                <Text className="text-xs text-slate-500">Estimated Price</Text>
                <Text className="font-bold text-slate-900">{bidder.price}</Text>
              </View>
              <Pressable 
                onPress={() => selectBidder(bidder.id)}
                className="bg-teal-600 px-6 py-2 rounded-lg"
              >
                <Text className="text-white font-bold">Hire Worker</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
