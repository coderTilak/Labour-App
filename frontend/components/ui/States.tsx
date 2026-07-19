import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/Theme';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from './Button';

// ==========================================
// EMPTY STATES
// ==========================================
export type EmptyStateType =
  | 'workers'
  | 'bookings'
  | 'notifications'
  | 'search'
  | 'reviews'
  | 'internet';

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
}

const emptyConfig: Record<
  EmptyStateType,
  { title: string; description: string; icon: keyof typeof MaterialIcons.glyphMap; actionLabel: string }
> = {
  workers: {
    title: 'No Workers Available',
    description: 'There are no workers matching your category at the moment. Try adjusting your filters.',
    icon: 'people-outline',
    actionLabel: 'Reset Filters',
  },
  bookings: {
    title: 'No Bookings Yet',
    description: 'You do not have any active or past bookings. Hire skilled professionals now.',
    icon: 'event-busy',
    actionLabel: 'Book a Service',
  },
  notifications: {
    title: 'All Caught Up!',
    description: 'You do not have any notifications right now. We will alert you when something happens.',
    icon: 'notifications-none',
    actionLabel: 'Check Settings',
  },
  search: {
    title: 'No Results Found',
    description: 'We could not find anything matching your keywords. Check spelling or try other terms.',
    icon: 'search-off',
    actionLabel: 'Clear Search',
  },
  reviews: {
    title: 'No Reviews Yet',
    description: 'This worker or company has not received any reviews yet. Be the first to review them.',
    icon: 'rate-review',
    actionLabel: 'Write a Review',
  },
  internet: {
    title: 'No Internet Connection',
    description: 'Please check your connection and try again. Some features might be offline.',
    icon: 'wifi-off',
    actionLabel: 'Retry Connecting',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  actionLabel,
  onActionPress,
  style,
}) => {
  const config = emptyConfig[type];

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <MaterialIcons name={config.icon} size={48} color={Colors.primary} />
      </View>
      <Text style={styles.title}>{title || config.title}</Text>
      <Text style={styles.description}>{description || config.description}</Text>
      {onActionPress && (
        <Button
          label={actionLabel || config.actionLabel}
          onPress={onActionPress}
          variant="outlined"
          style={styles.actionBtn}
        />
      )}
    </View>
  );
};

// ==========================================
// ERROR STATES
// ==========================================
export type ErrorStateType = '404' | 'network' | 'permission' | 'location' | 'server';

interface ErrorStateProps {
  type: ErrorStateType;
  title?: string;
  description?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

const errorConfig: Record<
  ErrorStateType,
  { title: string; description: string; icon: keyof typeof MaterialIcons.glyphMap }
> = {
  '404': {
    title: 'Page Not Found',
    description: 'The page or resource you are looking for does not exist or has been moved.',
    icon: 'find-in-page',
  },
  network: {
    title: 'Network Timeout',
    description: 'Our server took too long to respond. Check your connection or server status.',
    icon: 'cloud-off',
  },
  permission: {
    title: 'Permission Denied',
    description: 'This feature requires storage or camera permissions to complete the request.',
    icon: 'security',
  },
  location: {
    title: 'Location Disabled',
    description: 'We need your GPS coordinates to search for nearby workers in Nepal.',
    icon: 'location-off',
  },
  server: {
    title: 'Server Error',
    description: 'Something went wrong on our end. Our developers are working to fix it.',
    icon: 'dns',
  },
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  type,
  title,
  description,
  onRetry,
  style,
}) => {
  const config = errorConfig[type];

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, styles.errorIconBg]}>
        <MaterialIcons name={config.icon} size={48} color={Colors.error} />
      </View>
      <Text style={styles.title}>{title || config.title}</Text>
      <Text style={styles.description}>{description || config.description}</Text>
      {onRetry && (
        <Button
          label="Retry"
          onPress={onRetry}
          variant="primary"
          icon="refresh"
          style={styles.actionBtn}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    flex: 1,
  },
  iconContainer: {
    backgroundColor: Colors.primaryLight,
    padding: Spacing.xl,
    borderRadius: 999,
    marginBottom: Spacing.lg,
  },
  errorIconBg: {
    backgroundColor: '#FEE2E2', // Red-100
  },
  title: {
    fontSize: 18,
    fontFamily: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: Typography.weights.regular,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionBtn: {
    minWidth: 150,
  },
});
