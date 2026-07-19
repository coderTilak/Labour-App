import React from 'react';
import { StyleSheet, Text, View, Pressable, ViewStyle } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/Theme';
import { Avatar, Rating } from './Common';
import { Badge, BadgeType } from './Badge';
import { Button } from './Button';
import { MaterialIcons } from '@expo/vector-icons';

interface BaseCardProps {
  onPress?: () => void;
  style?: ViewStyle;
}

// ==========================================
// WORKER CARD
// ==========================================
interface WorkerCardProps extends BaseCardProps {
  name: string;
  avatarUri?: string;
  rating: number;
  reviewsCount: number;
  status: 'available' | 'busy' | 'offline' | 'vacation';
  category: string;
  location: string;
  hourlyRate: number;
  skills: string[];
}

export const WorkerCard: React.FC<WorkerCardProps> = ({
  name,
  avatarUri,
  rating,
  reviewsCount,
  status,
  category,
  location,
  hourlyRate,
  skills,
  onPress,
  style,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        Shadows.medium,
        pressed && styles.pressedCard,
        style,
      ]}
    >
      <View style={styles.cardHeaderRow}>
        <Avatar source={avatarUri} name={name} status={status} size={54} />
        <View style={styles.workerHeaderDetails}>
          <View style={styles.titleRow}>
            <Text style={styles.cardTitle}>{name}</Text>
            <Badge type={status} />
          </View>
          <Text style={styles.cardSubtitle}>{category}</Text>
          <View style={styles.ratingContainer}>
            <Rating rating={rating} size={14} />
            <Text style={styles.ratingText}>
              {rating.toFixed(1)} ({reviewsCount} reviews)
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardMetaRow}>
        <View style={styles.metaItem}>
          <MaterialIcons name="place" size={16} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{location}</Text>
        </View>
        <Text style={styles.rateText}>
          Rs. {hourlyRate} <Text style={styles.rateSubtext}>/ hr</Text>
        </Text>
      </View>

      <View style={styles.skillsContainer}>
        {skills.slice(0, 3).map((skill) => (
          <View key={skill} style={styles.skillBadge}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
};

// ==========================================
// COMPANY CARD
// ==========================================
interface CompanyCardProps extends BaseCardProps {
  name: string;
  logoUri?: string;
  isVerified?: boolean;
  rating: number;
  workersCount: number;
  specialization: string;
  location: string;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({
  name,
  logoUri,
  isVerified = true,
  rating,
  workersCount,
  specialization,
  location,
  onPress,
  style,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        Shadows.medium,
        pressed && styles.pressedCard,
        style,
      ]}
    >
      <View style={styles.cardHeaderRow}>
        <Avatar source={logoUri} name={name} size={48} />
        <View style={styles.workerHeaderDetails}>
          <View style={styles.titleRow}>
            <Text style={styles.cardTitle}>{name}</Text>
            {isVerified && <Badge type="verified" />}
          </View>
          <Text style={styles.cardSubtitle}>{specialization}</Text>
          <View style={styles.ratingContainer}>
            <Rating rating={rating} size={14} />
            <Text style={styles.ratingText}>
              {rating.toFixed(1)} • {workersCount} Skilled Workers
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardMetaRow}>
        <View style={styles.metaItem}>
          <MaterialIcons name="place" size={16} color={Colors.textSecondary} />
          <Text style={styles.metaText}>{location}</Text>
        </View>
        <Text style={styles.viewDetailsText}>View Company</Text>
      </View>
    </Pressable>
  );
};

// ==========================================
// BOOKING CARD
// ==========================================
interface BookingCardProps extends BaseCardProps {
  serviceType: string;
  providerName: string;
  providerAvatar?: string;
  date: string;
  timeSlot: string;
  price: number;
  status: BadgeType;
  onActionButtonPress?: () => void;
  actionButtonLabel?: string;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  serviceType,
  providerName,
  providerAvatar,
  date,
  timeSlot,
  price,
  status,
  onActionButtonPress,
  actionButtonLabel = 'Details',
  onPress,
  style,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        Shadows.medium,
        pressed && styles.pressedCard,
        style,
      ]}
    >
      <View style={styles.cardHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bookingServiceTitle}>{serviceType}</Text>
          <Text style={styles.bookingProviderSub}>With {providerName}</Text>
        </View>
        <Badge type={status} />
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.bookingDetailsRow}>
        <View style={styles.bookingDetailsCol}>
          <View style={styles.metaItem}>
            <MaterialIcons name="event" size={16} color={Colors.textSecondary} />
            <Text style={styles.bookingMetaText}>{date}</Text>
          </View>
          <View style={[styles.metaItem, { marginTop: 4 }]}>
            <MaterialIcons name="schedule" size={16} color={Colors.textSecondary} />
            <Text style={styles.bookingMetaText}>{timeSlot}</Text>
          </View>
        </View>
        <View style={styles.bookingPricingCol}>
          <Text style={styles.bookingPriceLabel}>Total Amount</Text>
          <Text style={styles.bookingPriceVal}>Rs. {price}</Text>
        </View>
      </View>

      {onActionButtonPress && (
        <View style={styles.bookingActionRow}>
          <Button
            label={actionButtonLabel}
            onPress={onActionButtonPress}
            size="small"
            style={{ flex: 1 }}
          />
        </View>
      )}
    </Pressable>
  );
};

// ==========================================
// INFORMATION CARD
// ==========================================
interface InfoCardProps {
  title: string;
  description: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  variant?: 'info' | 'warning' | 'success';
  style?: ViewStyle;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  icon = 'info',
  variant = 'info',
  style,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'warning':
        return { bg: '#FFF7ED', border: Colors.warning, text: Colors.warning };
      case 'success':
        return { bg: '#F0FDF4', border: Colors.success, text: Colors.success };
      case 'info':
      default:
        return { bg: '#EFF6FF', border: Colors.secondary, text: Colors.secondary };
    }
  };

  const scheme = getColors();

  return (
    <View style={[styles.infoCard, { backgroundColor: scheme.bg, borderColor: scheme.border }, style]}>
      <MaterialIcons name={icon} size={24} color={scheme.text} style={styles.infoIcon} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.infoTitle, { color: Colors.textPrimary }]}>{title}</Text>
        <Text style={styles.infoDescription}>{description}</Text>
      </View>
    </View>
  );
};

// ==========================================
// STATISTICS CARD
// ==========================================
interface StatsCardProps extends BaseCardProps {
  value: string | number;
  label: string;
  percentageChange?: number; // e.g. 12 or -5
  icon: keyof typeof MaterialIcons.glyphMap;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  value,
  label,
  percentageChange,
  icon,
  onPress,
  style,
}) => {
  const isPositive = percentageChange !== undefined && percentageChange >= 0;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.statsCard,
        Shadows.small,
        pressed && onPress && styles.pressedCard,
        style,
      ]}
    >
      <View style={styles.statsHeader}>
        <View style={styles.statsIconContainer}>
          <MaterialIcons name={icon} size={20} color={Colors.primary} />
        </View>
        {percentageChange !== undefined && (
          <View style={[styles.statsPercentage, { backgroundColor: isPositive ? '#DCFCE7' : '#FEE2E2' }]}>
            <MaterialIcons
              name={isPositive ? 'arrow-upward' : 'arrow-downward'}
              size={12}
              color={isPositive ? Colors.success : Colors.error}
            />
            <Text style={[styles.statsPercentText, { color: isPositive ? Colors.success : Colors.error }]}>
              {Math.abs(percentageChange)}%
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsLabel}>{label}</Text>
    </Pressable>
  );
};

// ==========================================
// SUBSCRIPTION CARD
// ==========================================
interface SubscriptionCardProps {
  tier: string;
  price: string;
  billingPeriod?: string;
  features: string[];
  isHighlighted?: boolean;
  onSelect: () => void;
  buttonLabel?: string;
  style?: ViewStyle;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  tier,
  price,
  billingPeriod = 'month',
  features,
  isHighlighted = false,
  onSelect,
  buttonLabel = 'Get Started',
  style,
}) => {
  return (
    <View
      style={[
        styles.subscriptionCard,
        Shadows.large,
        isHighlighted && { borderColor: Colors.primary, borderWidth: 2 },
        style,
      ]}
    >
      {isHighlighted && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>RECOMMENDED</Text>
        </View>
      )}
      <Text style={styles.subTier}>{tier}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.subPrice}>{price}</Text>
        <Text style={styles.subPeriod}>/{billingPeriod}</Text>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.featuresList}>
        {features.map((feat, i) => (
          <View key={i} style={styles.featureItem}>
            <MaterialIcons name="check-circle" size={18} color={Colors.primary} />
            <Text style={styles.featureText}>{feat}</Text>
          </View>
        ))}
      </View>

      <Button
        label={buttonLabel}
        onPress={onSelect}
        variant={isHighlighted ? 'primary' : 'outlined'}
        style={{ marginTop: Spacing.md }}
      />
    </View>
  );
};

// ==========================================
// REVIEW CARD
// ==========================================
interface ReviewCardProps {
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  date: string;
  comment: string;
  style?: ViewStyle;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  reviewerName,
  reviewerAvatar,
  rating,
  date,
  comment,
  style,
}) => {
  return (
    <View style={[styles.reviewCard, Shadows.small, style]}>
      <View style={styles.reviewHeader}>
        <Avatar source={reviewerAvatar} name={reviewerName} size={36} />
        <View style={styles.reviewerDetails}>
          <Text style={styles.reviewerName}>{reviewerName}</Text>
          <View style={styles.reviewRatingRow}>
            <Rating rating={rating} size={12} />
            <Text style={styles.reviewDate}>{date}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.reviewComment}>{comment}</Text>
    </View>
  );
};

// ==========================================
// NOTIFICATION CARD
// ==========================================
interface NotificationCardProps extends BaseCardProps {
  title: string;
  description: string;
  timestamp: string;
  isRead?: boolean;
  type?: 'booking' | 'payment' | 'message' | 'promo';
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  title,
  description,
  timestamp,
  isRead = false,
  type = 'booking',
  onPress,
  style,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'payment':
        return { name: 'payment', color: Colors.success };
      case 'message':
        return { name: 'chat', color: Colors.secondary };
      case 'promo':
        return { name: 'local-offer', color: Colors.accent };
      case 'booking':
      default:
        return { name: 'work', color: Colors.primary };
    }
  };

  const iconInfo = getIcon();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.notificationCard,
        !isRead && styles.unreadNotification,
        pressed && styles.pressedCard,
        style,
      ]}
    >
      <View style={[styles.notifIconContainer, { backgroundColor: iconInfo.color + '15' }]}>
        <MaterialIcons name={iconInfo.name as any} size={20} color={iconInfo.color} />
      </View>
      <View style={styles.notifContent}>
        <Text style={[styles.notifTitle, !isRead && styles.notifTitleUnread]}>{title}</Text>
        <Text style={styles.notifDescription}>{description}</Text>
        <Text style={styles.notifTime}>{timestamp}</Text>
      </View>
      {!isRead && <View style={styles.unreadDot} />}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.cards,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pressedCard: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workerHeaderDetails: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: Typography.weights.bold,
    color: Colors.textPrimary,
    marginRight: Spacing.sm,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: Typography.weights.regular,
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
    fontFamily: Typography.weights.medium,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  cardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
    fontFamily: Typography.weights.regular,
  },
  rateText: {
    fontSize: 16,
    fontFamily: Typography.weights.bold,
    color: Colors.primary,
  },
  rateSubtext: {
    fontSize: 12,
    fontFamily: Typography.weights.regular,
    color: Colors.textSecondary,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.md,
  },
  skillBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.small,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  skillText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: Typography.weights.medium,
  },
  viewDetailsText: {
    fontSize: 13,
    fontFamily: Typography.weights.semiBold,
    color: Colors.secondary,
  },
  bookingServiceTitle: {
    fontSize: 16,
    fontFamily: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  bookingProviderSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: Typography.weights.regular,
    marginTop: 2,
  },
  bookingDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingDetailsCol: {
    flex: 1.2,
  },
  bookingMetaText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
    fontFamily: Typography.weights.medium,
  },
  bookingPricingCol: {
    flex: 0.8,
    alignItems: 'flex-end',
  },
  bookingPriceLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: Typography.weights.regular,
  },
  bookingPriceVal: {
    fontSize: 18,
    fontFamily: Typography.weights.bold,
    color: Colors.primary,
    marginTop: 2,
  },
  bookingActionRow: {
    marginTop: Spacing.md,
  },
  infoCard: {
    borderLeftWidth: 4,
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  infoIcon: {
    marginRight: Spacing.md,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  infoTitle: {
    fontSize: 15,
    fontFamily: Typography.weights.bold,
    marginBottom: 2,
  },
  infoDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: Typography.weights.regular,
    lineHeight: 18,
  },
  statsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 140,
    flex: 1,
    marginHorizontal: Spacing.xs,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statsIconContainer: {
    backgroundColor: Colors.primaryLight,
    padding: 6,
    borderRadius: 8,
  },
  statsPercentage: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statsPercentText: {
    fontSize: 10,
    fontFamily: Typography.weights.bold,
    marginLeft: 2,
  },
  statsValue: {
    fontSize: 24,
    fontFamily: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  statsLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Typography.weights.medium,
    marginTop: 4,
  },
  subscriptionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.cards,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  popularText: {
    color: Colors.surface,
    fontSize: 10,
    fontFamily: Typography.weights.bold,
  },
  subTier: {
    fontSize: 18,
    fontFamily: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginVertical: Spacing.md,
  },
  subPrice: {
    fontSize: 32,
    fontFamily: Typography.weights.bold,
    color: Colors.primary,
  },
  subPeriod: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: Typography.weights.regular,
  },
  featuresList: {
    marginVertical: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  featureText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
    fontFamily: Typography.weights.regular,
  },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  reviewerDetails: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontFamily: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  reviewRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  reviewDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: Typography.weights.regular,
  },
  reviewComment: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: Typography.weights.regular,
    lineHeight: 18,
  },
  notificationCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.medium,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  unreadNotification: {
    backgroundColor: '#F0FDFA', // teal 50
    borderColor: '#CCFBF1',
  },
  notifIconContainer: {
    padding: 10,
    borderRadius: 10,
    marginRight: Spacing.md,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 14,
    fontFamily: Typography.weights.medium,
    color: Colors.textSecondary,
  },
  notifTitleUnread: {
    fontFamily: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  notifDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
    fontFamily: Typography.weights.regular,
  },
  notifTime: {
    fontSize: 11,
    color: Colors.placeholder,
    marginTop: Spacing.xs,
    fontFamily: Typography.weights.regular,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
  },
});
