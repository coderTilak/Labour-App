import React from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { Colors } from '../../constants/Theme';

export default function CustomerLayout() {
  const { userRole, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Optional: Add redirect logic if userRole !== 'customer'

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="profile-setup" />
      <Stack.Screen name="home" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="service-providers" />
      <Stack.Screen name="book-service" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="broadcast-select" />
    </Stack>
  );
}
