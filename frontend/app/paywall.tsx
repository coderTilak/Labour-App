import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

export default function PaywallScreen() {
  const { user } = useAuth();
  const [role, setRole] = useState<'worker' | 'company' | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null); // holds plan_id being processed

  useEffect(() => {
    async function loadPlans() {
      if (!user) return;
      try {
        setLoading(true);
        // 1. Fetch user role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();
          
        if (roleData) {
          const userRole = roleData.role as 'worker' | 'company';
          setRole(userRole);

          // 2. Fetch plans matching role
          const { data: planData, error: planError } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('target_role', userRole)
            .eq('is_active', true)
            .order('price_npr', { ascending: true });
            
          if (planData) {
            setPlans(planData);
          }
        }
      } catch (err) {
        console.log('Error loading paywall plans:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, [user]);

  const handleSubscribe = async (plan: any) => {
    if (!user) return;
    setSubmitting(plan.id);
    try {
      const now = new Date();
      const endsAt = new Date(now.getTime() + plan.duration_days * 24 * 60 * 60 * 1000);
      const graceEndsAt = new Date(endsAt.getTime() + 3 * 24 * 60 * 60 * 1000);

      // Simulated transaction values
      const paymentRef = `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const { error } = await supabase.from('subscriptions').upsert({
        user_id: user.id,
        plan_id: plan.id,
        status: 'active',
        subscription_started_at: now.toISOString(),
        subscription_ends_at: endsAt.toISOString(),
        grace_ends_at: graceEndsAt.toISOString(),
        payment_method: 'fonepay',
        payment_reference: paymentRef,
        updated_at: now.toISOString(),
      }, { onConflict: 'user_id' });

      if (error) throw error;

      Alert.alert(
        'Subscription Activated!',
        `Your ${plan.display_name} is now active until ${endsAt.toLocaleDateString()}. Thank you for subscribing!`,
        [
          {
            text: 'Go to Dashboard',
            onPress: () => {
              if (role === 'company') {
                router.replace('/(company)/home');
              } else {
                router.replace('/(worker)/(tabs)/home');
              }
            }
          }
        ]
      );
    } catch (err: any) {
      console.log('Error activating subscription:', err);
      Alert.alert('Error', err.message || 'Failed to activate subscription. Please try again.');
    } finally {
      setSubmitting(null);
    }
  };

  const getPlanFeatures = (planName: string) => {
    switch (planName) {
      case 'independent_pass':
        return [
          'Unlimited Job Broadcasts',
          'Priority Search Ranking',
          'Direct Customer Bookings',
          'Access to Live Feed Map'
        ];
      case 'company_starter':
        return [
          'Up to 50 Employee Slots',
          'Up to 2 Regional Branches',
          'Manual Dispatch Controller',
          'Premium Marketplace Exposure'
        ];
      case 'company_growth':
        return [
          'Up to 150 Employee Slots',
          'Up to 5 Regional Branches',
          'Manual Dispatch Controller',
          'Extended City Search Range',
          'Priority Dispatch Support'
        ];
      case 'enterprise_fleet':
        return [
          'Unlimited Employee Roster Slots',
          'Unlimited Regional Branches',
          'Top Priority Featured Ads Placement',
          'Dedicated Fleet Support Manager',
          'Custom Admin Dashboard Integrations'
        ];
      default:
        return ['Standard Access', 'Marketplace Discoverability'];
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#14b8a6" />
        <Text className="text-slate-400 mt-4 font-medium">Loading subscription plans...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <ScrollView contentContainerClassName="p-6">
        {/* Header Icon */}
        <View className="items-center mb-8 mt-4">
          <View className="w-20 h-20 bg-teal-500/20 rounded-full items-center justify-center mb-4">
            <MaterialIcons name="lock" size={40} color="#14b8a6" />
          </View>
          <Text className="text-3xl font-bold text-white text-center mb-2">
            Subscription Required
          </Text>
          <Text className="text-slate-400 text-center text-base px-4">
            Your 15-day free trial has finished. Select a package below to keep your profile visible to customers.
          </Text>
        </View>

        {/* List plans */}
        {plans.map((plan) => {
          const features = getPlanFeatures(plan.name);
          const isSubmittingThis = submitting === plan.id;
          return (
            <View key={plan.id} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 mb-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-white">{plan.display_name}</Text>
                {plan.name === 'company_growth' || plan.name === 'independent_pass' ? (
                  <View className="bg-teal-500/20 px-3 py-1 rounded-full">
                    <Text className="text-teal-400 font-semibold text-xs">POPULAR</Text>
                  </View>
                ) : null}
              </View>
              <Text className="text-3xl font-bold text-white mb-6">
                NPR {plan.price_npr}
                <Text className="text-lg text-slate-400 font-normal">
                  {plan.duration_days === 30 ? '/mo' : plan.duration_days === 90 ? '/quarter' : '/year'}
                </Text>
              </Text>
              
              <View className="gap-y-3 mb-8">
                {features.map((feat, idx) => (
                  <View key={idx} className="flex-row items-center gap-x-3">
                    <MaterialIcons name="check-circle" size={20} color="#14b8a6" />
                    <Text className="text-slate-300">{feat}</Text>
                  </View>
                ))}
              </View>

              <Pressable 
                className="w-full bg-teal-600 active:bg-teal-700 py-4 rounded-xl items-center justify-center flex-row"
                onPress={() => handleSubscribe(plan)}
                disabled={submitting !== null}
              >
                {isSubmittingThis ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-white font-bold text-lg">Upgrade Now</Text>
                )}
              </Pressable>
            </View>
          );
        })}
        
        {/* Secondary Options */}
        <Pressable 
          className="w-full bg-teal-800 active:bg-teal-900 py-4 rounded-xl items-center justify-center mt-2 mb-8" 
          onPress={() => router.replace('/(auth)/sign-in')}
        >
          <Text className="text-white font-bold text-lg">Log out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
