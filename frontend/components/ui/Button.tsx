import React from 'react';
import {
  StyleSheet,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Pressable,
  View,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/Theme';
import { MaterialIcons } from '@expo/vector-icons';

export type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'text' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  labelStyle,
}) => {
  const getVariantStyles = (): { button: ViewStyle; text: TextStyle; loaderColor: string } => {
    switch (variant) {
      case 'secondary':
        return {
          button: {
            backgroundColor: Colors.primary,
            borderWidth: 0,
          },
          text: { color: Colors.surface },
          loaderColor: Colors.surface,
        };
      case 'outlined':
        return {
          button: {
            backgroundColor: Colors.primary,
            borderWidth: 0,
          },
          text: { color: Colors.surface },
          loaderColor: Colors.surface,
        };
      case 'text':
        return {
          button: {
            backgroundColor: 'transparent',
            borderWidth: 0,
            paddingHorizontal: Spacing.sm,
          },
          text: { color: Colors.primary },
          loaderColor: Colors.primary,
        };
      case 'danger':
        return {
          button: {
            backgroundColor: Colors.primary,
            borderWidth: 0,
          },
          text: { color: Colors.surface },
          loaderColor: Colors.surface,
        };
      case 'primary':
      default:
        return {
          button: {
            backgroundColor: Colors.primary,
            borderWidth: 0,
          },
          text: { color: Colors.surface },
          loaderColor: Colors.surface,
        };
    }
  };

  const getSizeStyles = (): { button: ViewStyle; text: TextStyle; iconSize: number } => {
    switch (size) {
      case 'small':
        return {
          button: {
            paddingVertical: Spacing.sm - 2,
            paddingHorizontal: Spacing.md,
            minHeight: 36,
          },
          text: { fontSize: 13, fontFamily: Typography.weights.semiBold },
          iconSize: 16,
        };
      case 'large':
        return {
          button: {
            paddingVertical: Spacing.md + 2,
            paddingHorizontal: Spacing.xxl,
            minHeight: 54,
          },
          text: { fontSize: 16, fontFamily: Typography.weights.semiBold },
          iconSize: 22,
        };
      case 'medium':
      default:
        return {
          button: {
            paddingVertical: Spacing.sm + 2,
            paddingHorizontal: Spacing.lg,
            minHeight: 46,
          },
          text: { fontSize: 14, fontFamily: Typography.weights.semiBold },
          iconSize: 18,
        };
    }
  };

  const vStyles = getVariantStyles();
  const sStyles = getSizeStyles();

  const isButtonDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isButtonDisabled}
      style={({ pressed }) => [
        styles.baseButton,
        vStyles.button,
        sStyles.button,
        // Elevation for raised variants
        variant !== 'outlined' && variant !== 'text' && Shadows.small,
        isButtonDisabled && styles.disabledButton,
        pressed && !isButtonDisabled && styles.pressedButton,
        style,
      ]}
    >
      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator size="small" color={vStyles.loaderColor} style={styles.loader} />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <MaterialIcons
                name={icon}
                size={sStyles.iconSize}
                color={isButtonDisabled ? Colors.placeholder : vStyles.text.color}
                style={styles.leftIcon}
              />
            )}
            <Text
              style={[
                styles.baseText,
                vStyles.text,
                sStyles.text,
                isButtonDisabled && styles.disabledText,
                labelStyle,
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
            {icon && iconPosition === 'right' && (
              <MaterialIcons
                name={icon}
                size={sStyles.iconSize}
                color={isButtonDisabled ? Colors.placeholder : vStyles.text.color}
                style={styles.rightIcon}
              />
            )}
          </>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.buttons,
    flexDirection: 'row',
  },
  pressedButton: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  disabledButton: {
    backgroundColor: Colors.primary,
    opacity: 0.5,
    borderColor: 'transparent',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    textAlign: 'center',
    fontWeight: '600',
  },
  disabledText: {
    color: '#FFFFFF',
    opacity: 0.7,
  },
  leftIcon: {
    marginRight: Spacing.sm,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
  },
  loader: {
    marginRight: 0,
  },
});
