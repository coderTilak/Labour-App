import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  Animated,
  ViewStyle,
  Image,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/Theme';
import { MaterialIcons } from '@expo/vector-icons';

// ==========================================
// AVATAR COMPONENT
// ==========================================
interface AvatarProps {
  source?: string;
  name?: string;
  size?: number;
  status?: 'available' | 'busy' | 'offline' | 'vacation' | 'none';
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name = 'User',
  size = 48,
  status = 'none',
  style,
}) => {
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const getStatusColor = () => {
    switch (status) {
      case 'available':
        return Colors.success;
      case 'busy':
        return Colors.error;
      case 'offline':
        return Colors.disabled;
      case 'vacation':
        return Colors.warning;
      case 'none':
      default:
        return 'transparent';
    }
  };

  return (
    <View style={[{ width: size, height: size }, styles.avatarWrapper, style]}>
      {source ? (
        <Image
          source={{ uri: source }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <View
          style={[
            styles.avatarPlaceholder,
            { width: size, height: size, borderRadius: size / 2, backgroundColor: Colors.primaryLight },
          ]}
        >
          <Text style={[styles.avatarInitials, { fontSize: size * 0.4, color: Colors.primary }]}>
            {getInitials(name)}
          </Text>
        </View>
      )}
      {status !== 'none' && (
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: getStatusColor(),
              width: size * 0.28,
              height: size * 0.28,
              borderRadius: (size * 0.28) / 2,
              borderWidth: 2,
              borderColor: Colors.surface,
              bottom: 0,
              right: 0,
            },
          ]}
        />
      )}
    </View>
  );
};

// ==========================================
// RATING / REVIEW STARS COMPONENT
// ==========================================
interface RatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  style?: ViewStyle;
}

export const Rating: React.FC<RatingProps> = ({
  rating,
  maxStars = 5,
  size = 18,
  interactive = false,
  onRatingChange,
  style,
}) => {
  const stars = [];

  for (let i = 1; i <= maxStars; i++) {
    let name: keyof typeof MaterialIcons.glyphMap = 'star-border';
    if (rating >= i) {
      name = 'star';
    } else if (rating > i - 1 && rating < i) {
      name = 'star-half';
    }

    stars.push(
      <Pressable
        key={i}
        disabled={!interactive}
        onPress={() => onRatingChange?.(i)}
        style={{ paddingHorizontal: 1 }}
      >
        <MaterialIcons
          name={name}
          size={size}
          color={Colors.accent}
        />
      </Pressable>
    );
  }

  return <View style={[styles.ratingRow, style]}>{stars}</View>;
};

// ==========================================
// PROGRESS INDICATOR
// ==========================================
interface ProgressIndicatorProps {
  progress: number; // 0 to 1
  color?: string;
  style?: ViewStyle;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  color = Colors.primary,
  style,
}) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: Math.max(0, Math.min(1, progress)),
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const widthInterpolation = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.progressTrack, style]}>
      <Animated.View
        style={[
          styles.progressFill,
          {
            backgroundColor: color,
            width: widthInterpolation,
          },
        ]}
      />
    </View>
  );
};

// ==========================================
// LOADING SPINNER
// ==========================================
interface SpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
}

export const LoadingSpinner: React.FC<SpinnerProps> = ({
  size = 'small',
  color = Colors.primary,
  style,
}) => {
  return (
    <ActivityIndicator
      size={size}
      color={color}
      style={[styles.spinner, style]}
    />
  );
};

// ==========================================
// SKELETON LOADER
// ==========================================
interface SkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius = BorderRadius.small,
  style,
}) => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.8,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
          opacity: fadeAnim,
        },
        style,
      ]}
    />
  );
};

// ==========================================
// FLOATING ACTION BUTTON (FAB)
// ==========================================
interface FABProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  color?: string;
  style?: ViewStyle;
}

export const FloatingActionButton: React.FC<FABProps> = ({
  icon,
  onPress,
  color = Colors.primary,
  style,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.fab,
        { backgroundColor: color },
        Shadows.medium,
        pressed && styles.fabPressed,
        style,
      ]}
    >
      <MaterialIcons name={icon} size={24} color={Colors.surface} />
    </Pressable>
  );
};

// ==========================================
// CHECKBOX COMPONENT
// ==========================================
interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  label?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onPress,
  label,
  disabled = false,
  style,
}) => {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.checkboxWrapper,
        pressed && !disabled && styles.togglePressed,
        style,
      ]}
    >
      <View
        style={[
          styles.checkboxBox,
          checked && styles.checkboxChecked,
          disabled && styles.disabledToggle,
        ]}
      >
        {checked && <MaterialIcons name="check" size={16} color={Colors.surface} />}
      </View>
      {label && (
        <Text style={[styles.toggleLabel, disabled && styles.disabledToggleText]}>{label}</Text>
      )}
    </Pressable>
  );
};

// ==========================================
// RADIO BUTTON
// ==========================================
interface RadioProps {
  selected: boolean;
  onPress: () => void;
  label?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export const RadioButton: React.FC<RadioProps> = ({
  selected,
  onPress,
  label,
  disabled = false,
  style,
}) => {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.checkboxWrapper,
        pressed && !disabled && styles.togglePressed,
        style,
      ]}
    >
      <View
        style={[
          styles.radioCircle,
          selected && styles.radioSelected,
          disabled && styles.disabledToggle,
        ]}
      >
        {selected && <View style={styles.radioInnerCircle} />}
      </View>
      {label && (
        <Text style={[styles.toggleLabel, disabled && styles.disabledToggleText]}>{label}</Text>
      )}
    </Pressable>
  );
};

// ==========================================
// SWITCH / TOGGLE COMPONENT
// ==========================================
interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const toggleSwitch = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  const transformX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.disabled, Colors.primary],
  });

  return (
    <Pressable
      disabled={disabled}
      onPress={toggleSwitch}
      style={[style, disabled && { opacity: 0.6 }]}
    >
      <Animated.View style={[styles.switchTrack, { backgroundColor }]}>
        <Animated.View style={[styles.switchThumb, { transform: [{ translateX: transformX }] }]} />
      </Animated.View>
    </Pressable>
  );
};

// ==========================================
// SEGMENTED CONTROL
// ==========================================
interface SegmentedControlProps {
  values: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  style?: ViewStyle;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  values,
  selectedIndex,
  onChange,
  style,
}) => {
  return (
    <View style={[styles.segmentedWrapper, style]}>
      {values.map((val, idx) => {
        const isSelected = selectedIndex === idx;
        return (
          <Pressable
            key={val}
            onPress={() => onChange(idx)}
            style={[
              styles.segmentItem,
              isSelected && styles.segmentItemSelected,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                isSelected && styles.segmentTextSelected,
              ]}
            >
              {val}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  avatarWrapper: {
    position: 'relative',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontFamily: Typography.weights.bold,
    fontWeight: '700',
  },
  statusDot: {
    position: 'absolute',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  spinner: {
    padding: Spacing.sm,
  },
  skeleton: {
    backgroundColor: '#E2E8F0', // slate-200
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: Spacing.xxl,
    right: Spacing.xxl,
  },
  fabPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  checkboxChecked: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  disabledToggle: {
    borderColor: Colors.disabled,
    backgroundColor: '#F3F4F6',
  },
  disabledToggleText: {
    color: Colors.placeholder,
  },
  togglePressed: {
    opacity: 0.8,
  },
  toggleLabel: {
    marginLeft: Spacing.sm,
    fontSize: 14,
    color: Colors.textPrimary,
    fontFamily: Typography.weights.regular,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  radioSelected: {
    borderColor: Colors.primary,
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  switchTrack: {
    width: 46,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.surface,
  },
  segmentedWrapper: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9', // slate-100
    borderRadius: BorderRadius.medium,
    padding: Spacing.xs,
    width: '100%',
  },
  segmentItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.sm - 2,
    borderRadius: BorderRadius.small,
  },
  segmentItemSelected: {
    backgroundColor: Colors.surface,
    ...Shadows.small,
  },
  segmentText: {
    fontSize: 13,
    fontFamily: Typography.weights.medium,
    color: Colors.textSecondary,
  },
  segmentTextSelected: {
    color: Colors.textPrimary,
    fontFamily: Typography.weights.semiBold,
  },
});
