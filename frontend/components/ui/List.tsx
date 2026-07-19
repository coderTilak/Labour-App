import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Pressable,
  ViewStyle,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/Theme';
import { MaterialIcons } from '@expo/vector-icons';
import { WorkerCard, CompanyCard, BookingCard, NotificationCard } from './Card';
import { EmptyState, EmptyStateType } from './States';

interface BaseListProps<T> {
  data: T[];
  onItemPress?: (item: T) => void;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  emptyType?: EmptyStateType;
  emptyTitle?: string;
  emptyDesc?: string;
  onEmptyActionPress?: () => void;
}

// ==========================================
// WORKER LIST
// ==========================================
export const WorkerList: React.FC<BaseListProps<any>> = ({
  data,
  onItemPress,
  style,
  contentContainerStyle,
  onEmptyActionPress,
}) => {
  return (
    <FlatList
      data={data}
      style={[styles.list, style]}
      contentContainerStyle={[styles.listContent, contentContainerStyle]}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <WorkerCard
          name={item.name}
          avatarUri={item.avatarUri}
          rating={item.rating}
          reviewsCount={item.reviewsCount}
          status={item.status}
          category={item.category}
          location={item.location}
          hourlyRate={item.hourlyRate}
          skills={item.skills}
          onPress={() => onItemPress?.(item)}
        />
      )}
      ListEmptyComponent={
        <EmptyState
          type="workers"
          onActionPress={onEmptyActionPress}
        />
      }
    />
  );
};

// ==========================================
// COMPANY LIST
// ==========================================
export const CompanyList: React.FC<BaseListProps<any>> = ({
  data,
  onItemPress,
  style,
  contentContainerStyle,
  onEmptyActionPress,
}) => {
  return (
    <FlatList
      data={data}
      style={[styles.list, style]}
      contentContainerStyle={[styles.listContent, contentContainerStyle]}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <CompanyCard
          name={item.name}
          logoUri={item.logoUri}
          isVerified={item.isVerified}
          rating={item.rating}
          workersCount={item.workersCount}
          specialization={item.specialization}
          location={item.location}
          onPress={() => onItemPress?.(item)}
        />
      )}
      ListEmptyComponent={
        <EmptyState
          type="workers" // Fallback placeholder
          title="No Companies Found"
          description="There are no labor agencies registered under this category."
          actionLabel="View All Companies"
          onActionPress={onEmptyActionPress}
        />
      }
    />
  );
};

// ==========================================
// BOOKING LIST
// ==========================================
interface BookingListProps extends BaseListProps<any> {
  onActionButtonPress?: (item: any) => void;
}

export const BookingList: React.FC<BookingListProps> = ({
  data,
  onItemPress,
  onActionButtonPress,
  style,
  contentContainerStyle,
  onEmptyActionPress,
}) => {
  return (
    <FlatList
      data={data}
      style={[styles.list, style]}
      contentContainerStyle={[styles.listContent, contentContainerStyle]}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <BookingCard
          serviceType={item.serviceType}
          providerName={item.providerName}
          providerAvatar={item.providerAvatar}
          date={item.date}
          timeSlot={item.timeSlot}
          price={item.price}
          status={item.status}
          onActionButtonPress={
            item.status === 'pending' || item.status === 'available'
              ? () => onActionButtonPress?.(item)
              : undefined
          }
          actionButtonLabel={item.status === 'pending' ? 'Cancel Booking' : 'Complete'}
          onPress={() => onItemPress?.(item)}
        />
      )}
      ListEmptyComponent={
        <EmptyState
          type="bookings"
          onActionPress={onEmptyActionPress}
        />
      }
    />
  );
};

// ==========================================
// NOTIFICATION LIST
// ==========================================
export const NotificationList: React.FC<BaseListProps<any>> = ({
  data,
  onItemPress,
  style,
  contentContainerStyle,
  onEmptyActionPress,
}) => {
  return (
    <FlatList
      data={data}
      style={[styles.list, style]}
      contentContainerStyle={[styles.listContent, contentContainerStyle]}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <NotificationCard
          title={item.title}
          description={item.description}
          timestamp={item.timestamp}
          isRead={item.isRead}
          type={item.type}
          onPress={() => onItemPress?.(item)}
        />
      )}
      ListEmptyComponent={
        <EmptyState
          type="notifications"
          onActionPress={onEmptyActionPress}
        />
      }
    />
  );
};

// ==========================================
// SERVICE CATEGORY LIST / GRID
// ==========================================
export const ServiceList: React.FC<BaseListProps<any> & { numColumns?: number }> = ({
  data,
  onItemPress,
  numColumns = 2,
  style,
  contentContainerStyle,
}) => {
  return (
    <FlatList
      data={data}
      style={[styles.list, style]}
      contentContainerStyle={[styles.listContent, contentContainerStyle]}
      keyExtractor={(item) => item.id.toString()}
      numColumns={numColumns}
      columnWrapperStyle={numColumns > 1 ? styles.gridRow : undefined}
      renderItem={({ item }) => {
        return (
          <Pressable
            style={({ pressed }) => [
              numColumns > 1 ? styles.serviceGridItem : styles.serviceRowItem,
              pressed && styles.pressedService,
            ]}
            onPress={() => onItemPress?.(item)}
          >
            <View style={[styles.serviceIconContainer, { backgroundColor: Colors.primaryLight }]}>
              <MaterialIcons
                name={item.icon || 'engineering'}
                size={28}
                color={Colors.primary}
              />
            </View>
            <View style={styles.serviceTextContainer}>
              <Text style={styles.serviceTitle}>{item.name}</Text>
              <Text style={styles.serviceCount}>{item.workerCount || 0} Professionals</Text>
            </View>
            {numColumns === 1 && (
              <MaterialIcons name="chevron-right" size={20} color={Colors.textSecondary} />
            )}
          </Pressable>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    width: '100%',
  },
  listContent: {
    paddingVertical: Spacing.sm,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  serviceGridItem: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceRowItem: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  pressedService: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  serviceIconContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.small,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceTextContainer: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'center',
  },
  serviceTitle: {
    fontSize: 15,
    fontFamily: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  serviceCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Typography.weights.regular,
    marginTop: 2,
  },
});
