import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  View,
  Pressable,
  ViewStyle,
  TextStyle,
  Modal,
  FlatList,
  ScrollView,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/Theme';
import { MaterialIcons } from '@expo/vector-icons';

interface BaseInputProps {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

// ==========================================
// STANDARD TEXT INPUT
// ==========================================
interface TextInputProps extends BaseInputProps, Omit<React.ComponentPropsWithoutRef<typeof RNTextInput>, 'style'> {
  leftIcon?: keyof typeof MaterialIcons.glyphMap;
  rightIcon?: keyof typeof MaterialIcons.glyphMap;
  onRightIconPress?: () => void;
  inputStyle?: TextStyle;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  success,
  helperText,
  disabled = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (disabled) return Colors.disabled;
    if (error) return Colors.error;
    if (success) return Colors.success;
    if (isFocused) return Colors.primary;
    return Colors.border;
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          { borderColor: getBorderColor() },
          disabled && styles.disabledInputWrapper,
        ]}
      >
        {leftIcon && (
          <MaterialIcons
            name={leftIcon}
            size={20}
            color={disabled ? Colors.placeholder : Colors.textSecondary}
            style={styles.leftIcon}
          />
        )}
        <RNTextInput
          style={[styles.input, disabled && styles.disabledInputText, inputStyle]}
          placeholderTextColor={Colors.placeholder}
          editable={!disabled}
          onFocus={(e) => {
            setIsFocused(true);
            if (onFocus) onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          {...rest}
        />
        {rightIcon && (
          <Pressable onPress={onRightIconPress} disabled={disabled || !onRightIconPress}>
            <MaterialIcons
              name={rightIcon}
              size={20}
              color={error ? Colors.error : success ? Colors.success : Colors.textSecondary}
              style={styles.rightIcon}
            />
          </Pressable>
        )}
      </View>
      {error && <Text style={[styles.helperText, styles.errorText]}>{error}</Text>}
      {!error && success && <Text style={[styles.helperText, styles.successText]}>{success}</Text>}
      {!error && !success && helperText && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
};

// ==========================================
// PHONE NUMBER INPUT
// ==========================================
export const PhoneNumberInput: React.FC<TextInputProps> = (props) => {
  return (
    <View style={[styles.container, props.style]}>
      {props.label && <Text style={styles.label}>{props.label}</Text>}
      <View style={styles.phoneWrapper}>
        <View style={styles.countryCodeContainer}>
          <Text style={styles.countryCodeText}>🇳🇵 +977</Text>
        </View>
        <TextInput
          {...props}
          label={undefined}
          style={{ flex: 1 }}
          keyboardType="phone-pad"
        />
      </View>
    </View>
  );
};

// ==========================================
// PASSWORD INPUT
// ==========================================
export const PasswordInput: React.FC<TextInputProps> = (props) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <TextInput
      secureTextEntry={!isPasswordVisible}
      rightIcon={isPasswordVisible ? 'visibility-off' : 'visibility'}
      onRightIconPress={() => setIsPasswordVisible(!isPasswordVisible)}
      autoCapitalize="none"
      autoCorrect={false}
      {...props}
    />
  );
};

// ==========================================
// SEARCH INPUT
// ==========================================
interface SearchInputProps extends Omit<TextInputProps, 'leftIcon' | 'rightIcon'> {
  onClear?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({ value, onClear, onChangeText, ...rest }) => {
  return (
    <TextInput
      leftIcon="search"
      rightIcon={value && value.length > 0 ? 'cancel' : undefined}
      onRightIconPress={onClear}
      value={value}
      onChangeText={onChangeText}
      {...rest}
    />
  );
};

// ==========================================
// TEXT AREA
// ==========================================
export const TextArea: React.FC<TextInputProps> = (props) => {
  return (
    <TextInput
      multiline
      numberOfLines={4}
      textAlignVertical="top"
      style={props.style}
      inputStyle={styles.textAreaInput}
      {...props}
    />
  );
};

// ==========================================
// OTP INPUT
// ==========================================
interface OTPInputProps extends BaseInputProps {
  length?: number;
  value: string;
  onChangeCode: (code: string) => void;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 4,
  value,
  onChangeCode,
  error,
  helperText,
  disabled,
  style,
}) => {
  const inputRefs = useRef<RNTextInput[]>([]);

  const handleChangeText = (text: string, index: number) => {
    const updatedCode = value.split('');
    updatedCode[index] = text;
    const newCode = updatedCode.join('');
    onChangeCode(newCode);

    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.otpRow}>
        {Array.from({ length }).map((_, index) => (
          <RNTextInput
            key={index}
            ref={(ref) => {
              if (ref) inputRefs.current[index] = ref;
            }}
            style={[
              styles.otpBox,
              { borderColor: error ? Colors.error : Colors.border },
              disabled && styles.disabledInputWrapper,
            ]}
            keyboardType="number-pad"
            maxLength={1}
            value={value[index] || ''}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            editable={!disabled}
            placeholder="-"
            placeholderTextColor={Colors.placeholder}
            textAlign="center"
          />
        ))}
      </View>
      {error && <Text style={[styles.helperText, styles.errorText, { textAlign: 'center' }]}>{error}</Text>}
      {!error && helperText && <Text style={[styles.helperText, { textAlign: 'center' }]}>{helperText}</Text>}
    </View>
  );
};

// ==========================================
// DROPDOWN SELECT
// ==========================================
interface DropdownProps extends BaseInputProps {
  options: { label: string; value: string }[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  options,
  selectedValue,
  onValueChange,
  placeholder = 'Select an option',
  error,
  success,
  helperText,
  disabled,
  style,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedOption = options.find((opt) => opt.value === selectedValue);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        disabled={disabled}
        onPress={() => setModalVisible(true)}
        style={[
          styles.inputWrapper,
          { borderColor: error ? Colors.error : success ? Colors.success : Colors.border },
          disabled && styles.disabledInputWrapper,
        ]}
      >
        <Text
          style={[
            styles.dropdownText,
            !selectedOption && styles.dropdownPlaceholder,
            disabled && styles.disabledInputText,
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <MaterialIcons
          name="arrow-drop-down"
          size={24}
          color={disabled ? Colors.placeholder : Colors.textSecondary}
        />
      </Pressable>

      <Modal visible={modalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Select'}</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={Colors.textPrimary} />
              </Pressable>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.optionItem,
                    item.value === selectedValue && styles.selectedOptionItem,
                  ]}
                  onPress={() => {
                    onValueChange(item.value);
                    setModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.value === selectedValue && styles.selectedOptionText,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.value === selectedValue && (
                    <MaterialIcons name="check" size={20} color={Colors.primary} />
                  )}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
      {error && <Text style={[styles.helperText, styles.errorText]}>{error}</Text>}
      {!error && success && <Text style={[styles.helperText, styles.successText]}>{success}</Text>}
      {!error && !success && helperText && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
};

// ==========================================
// DATE & TIME PICKER (CUSTOM HIGHLIGHT FIELD)
// ==========================================
interface PickerProps extends BaseInputProps {
  value: string;
  onPress?: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
  placeholder?: string;
}

interface BasePickerProps extends PickerProps {
  onPress: () => void;
}

const BasePicker: React.FC<BasePickerProps> = ({
  label,
  value,
  onPress,
  icon,
  placeholder,
  error,
  success,
  helperText,
  disabled,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        disabled={disabled}
        onPress={onPress}
        style={[
          styles.inputWrapper,
          { borderColor: error ? Colors.error : success ? Colors.success : Colors.border },
          disabled && styles.disabledInputWrapper,
        ]}
      >
        <Text style={[styles.dropdownText, !value && styles.dropdownPlaceholder, disabled && styles.disabledInputText]}>
          {value || placeholder}
        </Text>
        {icon && (
          <MaterialIcons
            name={icon}
            size={20}
            color={disabled ? Colors.placeholder : Colors.textSecondary}
          />
        )}
      </Pressable>
      {error && <Text style={[styles.helperText, styles.errorText]}>{error}</Text>}
      {!error && success && <Text style={[styles.helperText, styles.successText]}>{success}</Text>}
      {!error && !success && helperText && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
};

export const DatePicker: React.FC<PickerProps & { onDateChange?: (date: string) => void }> = (props) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  // Custom interactive date generator for Nepal calendars
  const mockDates = [
    'Today, July 18, 2026',
    'Sunday, July 19, 2026',
    'Monday, July 20, 2026',
    'Tuesday, July 21, 2026',
    'Wednesday, July 22, 2026',
    'Thursday, July 23, 2026',
    'Friday, July 24, 2026',
  ];

  return (
    <>
      <BasePicker
        {...props}
        icon="event"
        placeholder={props.placeholder || 'Select date'}
        onPress={() => setModalVisible(true)}
      />
      <Modal visible={modalVisible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Booking Date</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={Colors.textPrimary} />
              </Pressable>
            </View>
            <ScrollView>
              {mockDates.map((date) => (
                <Pressable
                  key={date}
                  style={[styles.optionItem, props.value === date && styles.selectedOptionItem]}
                  onPress={() => {
                    props.onDateChange?.(date);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[styles.optionText, props.value === date && styles.selectedOptionText]}>
                    {date}
                  </Text>
                  {props.value === date && <MaterialIcons name="check" size={20} color={Colors.primary} />}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

export const TimePicker: React.FC<PickerProps & { onTimeChange?: (time: string) => void }> = (props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const mockTimes = [
    '08:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 02:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
  ];

  return (
    <>
      <BasePicker
        {...props}
        icon="schedule"
        placeholder={props.placeholder || 'Select time slot'}
        onPress={() => setModalVisible(true)}
      />
      <Modal visible={modalVisible} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Booking Time Slot</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={Colors.textPrimary} />
              </Pressable>
            </View>
            <ScrollView>
              {mockTimes.map((time) => (
                <Pressable
                  key={time}
                  style={[styles.optionItem, props.value === time && styles.selectedOptionItem]}
                  onPress={() => {
                    props.onTimeChange?.(time);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[styles.optionText, props.value === time && styles.selectedOptionText]}>
                    {time}
                  </Text>
                  {props.value === time && <MaterialIcons name="check" size={20} color={Colors.primary} />}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontFamily: Typography.weights.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.input,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  disabledInputWrapper: {
    backgroundColor: '#F3F4F6',
    borderColor: Colors.disabled,
  },
  input: {
    flex: 1,
    height: '100%',
    color: Colors.textPrimary,
    fontSize: 15,
    fontFamily: Typography.weights.regular,
    paddingVertical: Spacing.sm,
  },
  disabledInputText: {
    color: Colors.placeholder,
  },
  textAreaInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  leftIcon: {
    marginRight: Spacing.sm,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    fontFamily: Typography.weights.regular,
    paddingHorizontal: Spacing.xs,
  },
  errorText: {
    color: Colors.error,
  },
  successText: {
    color: Colors.success,
  },
  phoneWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCodeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderColor: Colors.border,
    borderWidth: 1.5,
    borderRadius: BorderRadius.input,
    height: 48,
    paddingHorizontal: Spacing.md,
    marginRight: Spacing.sm,
  },
  countryCodeText: {
    fontSize: 15,
    fontFamily: Typography.weights.medium,
    color: Colors.textPrimary,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  otpBox: {
    width: 56,
    height: 56,
    borderWidth: 2,
    borderRadius: BorderRadius.medium,
    fontSize: 22,
    fontWeight: 'bold',
    backgroundColor: Colors.surface,
    color: Colors.textPrimary,
  },
  dropdownText: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    fontFamily: Typography.weights.regular,
  },
  dropdownPlaceholder: {
    color: Colors.placeholder,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.large,
    borderTopRightRadius: BorderRadius.large,
    maxHeight: '50%',
    padding: Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  selectedOptionItem: {
    backgroundColor: '#F0FDFA', // Teal 50
  },
  optionText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontFamily: Typography.weights.regular,
  },
  selectedOptionText: {
    color: Colors.primary,
    fontFamily: Typography.weights.medium,
  },
});
