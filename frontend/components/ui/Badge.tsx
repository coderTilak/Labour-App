import React from 'react';
import { StyleSheet, Text, View, Pressable, ViewStyle, TextStyle } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/Theme';
import { MaterialIcons } from '@expo/vector-icons';

// ==========================================
// BADGE SYSTEM
// ==========================================

export type BadgeType =
  | 'verified'
  | 'premium'
  | 'new'
  | 'busy'
  | 'available'
  | 'offline'
  | 'vacation'
  | 'completed'
  | 'cancelled'
  | 'pending';

interface BadgeProps {
  type: BadgeType;
  label?: string;
  style?: ViewStyle;
}

const badgeConfig: Record<
  BadgeType,
  { label: string; bg: string; text: string; icon?: keyof typeof MaterialIcons.glyphMap }
> = {
  verified: { label: 'Verified', bg: Colors.primaryLight, text: Colors.primary, icon: 'verified' },
  premium: { label: 'Premium', bg: '#FEF3C7', text: Colors.accent, icon: 'star' }, // Amber-100 & Amber-600
  new: { label: 'New', bg: '#DBEAFE', text: Colors.secondary, icon: 'fiber-new' }, // Blue-100 & Blue-600
  busy: { label: 'Busy', bg: '#FEE2E2', text: Colors.error, icon: 'do-not-disturb-on' }, // Red-100 & Red-600
  available: { label: 'Available', bg: '#DCFCE7', text: Colors.success, icon: 'check-circle' }, // Green-100 & Green-600
  offline: { label: 'Offline', bg: '#F3F4F6', text: Colors.textSecondary, icon: 'offline-bolt' }, // Gray-100 & Gray-500
  vacation: { label: 'On Vacation', bg: '#FFEDD5', text: Colors.warning, icon: 'beach-access' }, // Orange-100 & Orange-600
  completed: { label: 'Completed', bg: '#DCFCE7', text: Colors.success, icon: 'check' },
  cancelled: { label: 'Cancelled', bg: '#FEE2E2', text: Colors.error, icon: 'close' },
  pending: { label: 'Pending', bg: '#FEF3C7', text: Colors.warning, icon: 'schedule' },
};

export const Badge: React.FC<BadgeProps> = ({ type, label, style }) => {
  const config = badgeConfig[type];
  const displayLabel = label || config.label;

  return (
    <View style={[styles.badgeContainer, { backgroundColor: config.bg }, style]}>
      {config.icon && (
        <MaterialIcons
          name={config.icon}
          size={12}
          color={config.text}
          style={styles.badgeIcon}
        />
      )}
      <Text style={[styles.badgeText, { color: config.text }]}>{displayLabel}</Text>
    </View>
  );
};

// ==========================================
// CHIP SYSTEM
// ==========================================

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
  showRemove?: boolean;
  onRemove?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  icon,
  showRemove = false,
  onRemove,
  disabled = false,
  style,
}) => {
  const handlePress = () => {
    if (!disabled && onPress) {
      onPress();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || !onPress}
      style={({ pressed }) => [
        styles.chipContainer,
        selected ? styles.chipSelected : styles.chipUnselected,
        disabled && styles.chipDisabled,
        pressed && !disabled && styles.chipPressed,
        style,
      ]}
    >
      {icon && (
        <MaterialIcons
          name={icon}
          size={16}
          color={selected ? Colors.surface : Colors.textSecondary}
          style={styles.chipIcon}
        />
      )}
      <Text
        style={[
          styles.chipText,
          selected ? styles.chipTextSelected : styles.chipTextUnselected,
          disabled && styles.chipTextDisabled,
        ]}
      >
        {label}
      </Text>
      {showRemove && onRemove && (
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            if (!disabled && onRemove) onRemove();
          }}
          hitSlop={8}
          style={styles.removeButton}
        >
          <MaterialIcons
            name="close"
            size={14}
            color={selected ? Colors.surface : Colors.textSecondary}
          />
        </Pressable>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.small,
    alignSelf: 'flex-start',
  },
  badgeIcon: {
    marginRight: Spacing.xs,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: Typography.weights.medium,
    fontWeight: '600',
  },
  chipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm - 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  chipUnselected: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipDisabled: {
    backgroundColor: Colors.background,
    borderColor: Colors.border,
    opacity: 0.6,
  },
  chipPressed: {
    opacity: 0.8,
  },
  chipIcon: {
    marginRight: Spacing.xs,
  },
  chipText: {
    fontSize: 13,
    fontFamily: Typography.weights.medium,
    fontWeight: '500',
  },
  chipTextUnselected: {
    color: Colors.textSecondary,
  },
  chipTextSelected: {
    color: Colors.surface,
  },
  chipTextDisabled: {
    color: Colors.placeholder,
  },
  removeButton: {
    marginLeft: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
