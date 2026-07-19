import React, { useState, createContext, useContext, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal as RNModal,
  Animated,
  Dimensions,
  ScrollView,
  ViewStyle,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/Theme';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from './Button';

// ==========================================
// CUSTOM MODAL COMPONENT
// ==========================================
interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  variant?: 'info' | 'danger' | 'success';
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  description,
  children,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  variant = 'info',
}) => {
  const getHeaderIcon = () => {
    switch (variant) {
      case 'danger':
        return { name: 'error-outline', color: Colors.error };
      case 'success':
        return { name: 'check-circle-outline', color: Colors.success };
      case 'info':
      default:
        return { name: 'info-outline', color: Colors.secondary };
    }
  };

  const iconInfo = getHeaderIcon();

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={[styles.modalBox, Shadows.large]}>
          <View style={styles.modalHeader}>
            <View style={[styles.modalIconBg, { backgroundColor: iconInfo.color + '15' }]}>
              <MaterialIcons name={iconInfo.name as any} size={24} color={iconInfo.color} />
            </View>
            <Text style={styles.modalTitle}>{title}</Text>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {description && <Text style={styles.modalDesc}>{description}</Text>}
            {children}
          </ScrollView>

          <View style={styles.modalFooter}>
            {secondaryActionLabel && onSecondaryAction && (
              <Button
                label={secondaryActionLabel}
                onPress={onSecondaryAction}
                variant="outlined"
                style={styles.modalBtn}
              />
            )}
            {primaryActionLabel && onPrimaryAction && (
              <Button
                label={primaryActionLabel}
                onPress={onPrimaryAction}
                variant={variant === 'danger' ? 'danger' : 'primary'}
                style={styles.modalBtn}
              />
            )}
          </View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
};

// ==========================================
// BOTTOM SHEET
// ==========================================
interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  height?: number;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  children,
  height = SCREEN_HEIGHT * 0.5,
}) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <RNModal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <Animated.View
          style={[
            styles.sheetContent,
            Shadows.large,
            {
              height: height,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sheetHandleContainer}>
            <View style={styles.sheetHandle} />
          </View>

          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <MaterialIcons name="close" size={22} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.sheetBody}>{children}</View>
        </Animated.View>
      </Pressable>
    </RNModal>
  );
};

// ==========================================
// ACCORDION
// ==========================================
interface AccordionProps {
  title: string;
  children: React.ReactNode;
  icon?: keyof typeof MaterialIcons.glyphMap;
  style?: ViewStyle;
}

export const Accordion: React.FC<AccordionProps> = ({ title, children, icon, style }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={[styles.accordionContainer, Shadows.small, style]}>
      <Pressable style={styles.accordionHeader} onPress={() => setExpanded(!expanded)}>
        <View style={styles.accordionTitleRow}>
          {icon && (
            <MaterialIcons
              name={icon}
              size={20}
              color={Colors.primary}
              style={{ marginRight: Spacing.sm }}
            />
          )}
          <Text style={styles.accordionTitle}>{title}</Text>
        </View>
        <MaterialIcons
          name={expanded ? 'expand-less' : 'expand-more'}
          size={24}
          color={Colors.textSecondary}
        />
      </Pressable>
      {expanded && <View style={styles.accordionBody}>{children}</View>}
    </View>
  );
};

// ==========================================
// TOOLTIP
// ==========================================
interface TooltipProps {
  text: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children, style }) => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={[styles.tooltipContainer, style]}>
      <Pressable onPress={() => setVisible(!visible)} delayLongPress={200}>
        {children}
      </Pressable>
      {visible && (
        <View style={[styles.tooltipBubble, Shadows.medium]}>
          <Text style={styles.tooltipText}>{text}</Text>
          <Pressable style={styles.tooltipClose} onPress={() => setVisible(false)}>
            <MaterialIcons name="close" size={12} color={Colors.surface} />
          </Pressable>
          <View style={styles.tooltipArrow} />
        </View>
      )}
    </View>
  );
};

// ==========================================
// GLOBAL TOAST / SNACKBAR SYSTEM
// ==========================================
export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  show: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = (message: string, type: ToastType = 'info', duration = 3000) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const id = Math.random().toString();
    setToast({ id, message, type });

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    timeoutRef.current = setTimeout(() => {
      hide();
    }, duration);
  };

  const hide = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setToast(null);
    });
  };

  const getToastIcon = (type: ToastType): keyof typeof MaterialIcons.glyphMap => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  };

  const getToastBg = (type: ToastType) => {
    switch (type) {
      case 'success':
        return Colors.success;
      case 'error':
        return Colors.error;
      case 'warning':
        return Colors.warning;
      case 'info':
      default:
        return Colors.textPrimary;
    }
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.toastContainer,
            Shadows.medium,
            {
              backgroundColor: getToastBg(toast.type),
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <MaterialIcons name={getToastIcon(toast.type)} size={20} color={Colors.surface} />
          <Text style={styles.toastText}>{toast.message}</Text>
          <Pressable onPress={hide} style={styles.toastCloseBtn}>
            <MaterialIcons name="close" size={16} color={Colors.surface} />
          </Pressable>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.cards,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 340,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalIconBg: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.medium,
    marginRight: Spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Typography.weights.bold,
    color: Colors.textPrimary,
    flex: 1,
  },
  modalBody: {
    maxHeight: 200,
    marginBottom: Spacing.lg,
  },
  modalDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: Typography.weights.regular,
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalBtn: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.large,
    borderTopRightRadius: BorderRadius.large,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    width: '100%',
  },
  sheetHandleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  sheetBody: {
    flex: 1,
    paddingTop: Spacing.md,
  },
  accordionContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
  },
  accordionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accordionTitle: {
    fontSize: 14,
    fontFamily: Typography.weights.semiBold,
    color: Colors.textPrimary,
  },
  accordionBody: {
    padding: Spacing.md,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  tooltipContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  tooltipBubble: {
    position: 'absolute',
    bottom: '120%',
    left: '50%',
    transform: [{ translateX: -70 }],
    backgroundColor: '#1E293B',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.small,
    width: 140,
    zIndex: 99,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tooltipText: {
    color: Colors.surface,
    fontSize: 11,
    fontFamily: Typography.weights.regular,
    flex: 1,
  },
  tooltipClose: {
    marginLeft: Spacing.xs,
  },
  tooltipArrow: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    marginLeft: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderLeftColor: 'transparent',
    borderRightWidth: 6,
    borderRightColor: 'transparent',
    borderTopWidth: 6,
    borderTopColor: '#1E293B',
  },
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: Spacing.lg,
    right: Spacing.lg,
    borderRadius: BorderRadius.medium,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 999,
  },
  toastText: {
    color: Colors.surface,
    fontSize: 14,
    fontFamily: Typography.weights.medium,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  toastCloseBtn: {
    padding: 2,
  },
});
