# BookAstors Push Notifications Guide

## Setup & Configuration

### 1. Firebase Cloud Messaging Setup
```typescript
// src/services/notifications/fcm.ts
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

export class FCMService {
  // Request Permission
  async requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  }

  // Get FCM Token
  async getFCMToken() {
    try {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        return fcmToken;
      }
      return null;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  // Register Background Handler
  async registerBackgroundHandler() {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Message handled in the background:', remoteMessage);
    });
  }
}

export const fcmService = new FCMService();
```

### 2. Local Notifications Setup
```typescript
// src/services/notifications/local.ts
import PushNotification from 'react-native-push-notification';

export class LocalNotificationService {
  configure() {
    PushNotification.configure({
      onRegister: function(token) {
        console.log('TOKEN:', token);
      },
      
      onNotification: function(notification) {
        console.log('NOTIFICATION:', notification);
      },
      
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios'
    });
  }

  // Create Channel (Android)
  createChannel() {
    PushNotification.createChannel({
      channelId: 'bookastors-channel',
      channelName: 'BookAstors Notifications',
      channelDescription: 'BookAstors notification channel',
      importance: 4,
      vibrate: true,
    });
  }

  // Show Local Notification
  showNotification(id: number, title: string, message: string, data = {}) {
    PushNotification.localNotification({
      channelId: 'bookastors-channel',
      id: id,
      title: title,
      message: message,
      playSound: true,
      soundName: 'default',
      data: data,
    });
  }
}

export const localNotificationService = new LocalNotificationService();
```

## Notification Types & Templates

### 1. Notification Types
```typescript
// src/types/notifications.ts
export enum NotificationType {
  BOOKING_CONFIRMATION = 'BOOKING_CONFIRMATION',
  BOOKING_REMINDER = 'BOOKING_REMINDER',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  SALON_UPDATE = 'SALON_UPDATE',
  PROMOTIONAL = 'PROMOTIONAL'
}

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
}
```

### 2. Notification Templates
```typescript
// src/services/notifications/templates.ts
export const notificationTemplates = {
  bookingConfirmation: (salonName: string, date: string) => ({
    type: NotificationType.BOOKING_CONFIRMATION,
    title: 'Booking Confirmed!',
    body: `Your appointment at ${salonName} on ${date} is confirmed.`
  }),

  bookingReminder: (salonName: string, time: string) => ({
    type: NotificationType.BOOKING_REMINDER,
    title: 'Upcoming Appointment',
    body: `Reminder: Your appointment at ${salonName} is at ${time}.`
  }),

  bookingCancelled: (salonName: string) => ({
    type: NotificationType.BOOKING_CANCELLED,
    title: 'Booking Cancelled',
    body: `Your appointment at ${salonName} has been cancelled.`
  })
};
```

## Notification Management

### 1. Notification Manager
```typescript
// src/services/notifications/manager.ts
import { fcmService } from './fcm';
import { localNotificationService } from './local';
import { notificationTemplates } from './templates';
import { store } from '@/store/redux/store';
import { updateNotificationStatus } from '@/store/redux/slices/notificationSlice';

export class NotificationManager {
  async initialize() {
    // Initialize FCM
    const hasPermission = await fcmService.requestUserPermission();
    if (hasPermission) {
      const token = await fcmService.getFCMToken();
      if (token) {
        // Save token to backend
        await this.updateFCMToken(token);
      }
    }

    // Initialize Local Notifications
    localNotificationService.configure();
    localNotificationService.createChannel();

    // Register Handlers
    this.registerNotificationHandlers();
  }

  private async updateFCMToken(token: string) {
    const { user } = store.getState().auth;
    if (user) {
      // Update token in Firebase
      await updateUserFCMToken(user.id, token);
    }
  }

  private registerNotificationHandlers() {
    // Foreground Handler
    messaging().onMessage(async (remoteMessage) => {
      this.handleForegroundMessage(remoteMessage);
    });

    // Background Handler
    fcmService.registerBackgroundHandler();

    // Notification Tap Handler
    messaging().onNotificationOpenedApp((remoteMessage) => {
      this.handleNotificationTap(remoteMessage);
    });
  }

  private handleForegroundMessage(remoteMessage: any) {
    const { notification, data } = remoteMessage;
    
    if (notification) {
      localNotificationService.showNotification(
        Date.now(),
        notification.title,
        notification.body,
        data
      );
    }
  }

  private handleNotificationTap(remoteMessage: any) {
    const { data } = remoteMessage;
    
    // Navigate based on notification type
    switch (data.type) {
      case NotificationType.BOOKING_CONFIRMATION:
      case NotificationType.BOOKING_REMINDER:
        navigateToBookingDetails(data.bookingId);
        break;
      case NotificationType.SALON_UPDATE:
        navigateToSalonDetails(data.salonId);
        break;
      // Add more cases as needed
    }
  }

  // Send Booking Confirmation
  async sendBookingConfirmation(booking: Booking) {
    const template = notificationTemplates.bookingConfirmation(
      booking.salonName,
      formatDate(booking.date)
    );

    await this.sendNotification(booking.userId, template);
  }

  // Send Booking Reminder
  async sendBookingReminder(booking: Booking) {
    const template = notificationTemplates.bookingReminder(
      booking.salonName,
      formatTime(booking.timeSlot.start)
    );

    await this.sendNotification(booking.userId, template);
  }

  // Generic send notification method
  private async sendNotification(userId: string, notification: NotificationPayload) {
    try {
      // Send to Firebase Cloud Function
      await sendCloudNotification(userId, notification);
      
      // Update local notification status
      store.dispatch(updateNotificationStatus({
        id: Date.now().toString(),
        ...notification,
        status: 'sent'
      }));
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
}

export const notificationManager = new NotificationManager();
```

### 2. Notification Hooks
```typescript
// src/hooks/useNotifications.ts
import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { notificationManager } from '@/services/notifications/manager';

export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const { notifications, settings } = useAppSelector(
    state => state.notifications
  );

  useEffect(() => {
    notificationManager.initialize();
  }, []);

  const updateNotificationSettings = async (settings: NotificationSettings) => {
    try {
      await updateUserNotificationSettings(settings);
      dispatch(setNotificationSettings(settings));
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  };

  return {
    notifications,
    settings,
    updateNotificationSettings
  };
};
```

## Cloud Functions for Notifications

### 1. Notification Triggers
```typescript
// functions/src/notifications/triggers.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Booking Confirmation Trigger
export const onBookingConfirmed = functions.firestore
  .document('bookings/{bookingId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();

    if (
      newData.status === 'confirmed' &&
      previousData.status === 'pending'
    ) {
      const user = await admin.firestore()
        .collection('users')
        .doc(newData.userId)
        .get();

      const userData = user.data();
      
      if (userData?.fcmTokens?.length) {
        await sendMulticastNotification(
          userData.fcmTokens,
          {
            title: 'Booking Confirmed!',
            body: `Your appointment has been confirmed.`,
            data: {
              type: 'BOOKING_CONFIRMATION',
              bookingId: context.params.bookingId
            }
          }
        );
      }
    }
  });

// Booking Reminder Trigger
export const sendBookingReminders = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    const in24Hours = new Date(now.toDate().getTime() + 24 * 60 * 60 * 1000);

    const bookings = await admin.firestore()
      .collection('bookings')
      .where('status', '==', 'confirmed')
      .where('date', '>=', now)
      .where('date', '<=', in24Hours)
      .get();

    const reminderPromises = bookings.docs.map(async (doc) => {
      const booking = doc.data();
      const user = await admin.firestore()
        .collection('users')
        .doc(booking.userId)
        .get();

      const userData = user.data();
      
      if (userData?.fcmTokens?.length) {
        return sendMulticastNotification(
          userData.fcmTokens,
          {
            title: 'Upcoming Appointment',
            body: `Your appointment is in 24 hours.`,
            data: {
              type: 'BOOKING_REMINDER',
              bookingId: doc.id
            }
          }
        );
      }
    });

    await Promise.all(reminderPromises);
  });
```

### 2. Notification Helpers
```typescript
// functions/src/notifications/helpers.ts
import * as admin from 'firebase-admin';

export async function sendMulticastNotification(
  tokens: string[],
  notification: admin.messaging.NotificationMessagePayload
) {
  try {
    const response = await admin.messaging().sendMulticast({
      tokens,
      notification,
      android: {
        priority: 'high'
      },
      apns: {
        payload: {
          aps: {
            contentAvailable: true
          }
        }
      }
    });

    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}
```

## Testing Notifications

### 1. Unit Tests
```typescript
// src/__tests__/services/notifications/manager.test.ts
import { NotificationManager } from '@/services/notifications/manager';
import { fcmService } from '@/services/notifications/fcm';

jest.mock('@/services/notifications/fcm');

describe('NotificationManager', () => {
  let notificationManager: NotificationManager;

  beforeEach(() => {
    notificationManager = new NotificationManager();
  });

  it('should initialize FCM', async () => {
    const mockRequestPermission = jest.spyOn(fcmService, 'requestUserPermission');
    const mockGetToken = jest.spyOn(fcmService, 'getFCMToken');

    mockRequestPermission.mockResolvedValue(true);
    mockGetToken.mockResolvedValue('mock-token');

    await notificationManager.initialize();

    expect(mockRequestPermission).toHaveBeenCalled();
    expect(mockGetToken).toHaveBeenCalled();
  });
});
```

### 2. Integration Tests
```typescript
// src/__tests__/services/notifications/integration.test.ts
import { notificationManager } from '@/services/notifications/manager';
import { store } from '@/store/redux/store';

describe('Notification Integration', () => {
  it('should update notification status in store after sending', async () => {
    const booking = {
      id: '123',
      userId: 'user123',
      salonName: 'Test Salon',
      date: new Date()
    };

    await notificationManager.sendBookingConfirmation(booking);

    const state = store.getState();
    const lastNotification = state.notifications.notifications[0];

    expect(lastNotification).toBeDefined();
    expect(lastNotification.status).toBe('sent');
  });
});
```
