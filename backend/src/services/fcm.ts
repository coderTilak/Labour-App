/**
 * Firebase Cloud Messaging Service
 * 
 * Handles push notification delivery to mobile devices.
 * Requires firebase-admin SDK and a service account JSON.
 * 
 * Setup:
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Go to Project Settings > Service Accounts > Generate New Private Key
 * 3. Save the JSON file as backend/firebase-service-account.json
 * 4. Set FIREBASE_SERVICE_ACCOUNT_PATH in .env
 */

import { createClient } from '@supabase/supabase-js';

// Firebase Admin SDK — lazy loaded when credentials are available
let firebaseAdmin: any = null;
let isFirebaseInitialized = false;

export function initializeFirebase() {
  try {
    // Dynamic import to avoid crash if firebase-admin isn't installed yet
    const admin = require('firebase-admin');
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

    if (!serviceAccountPath) {
      console.warn('[FCM] FIREBASE_SERVICE_ACCOUNT_PATH not set. Push notifications disabled.');
      return false;
    }

    const serviceAccount = require(serviceAccountPath);
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    firebaseAdmin = admin;
    isFirebaseInitialized = true;
    console.log('[FCM] Firebase Admin SDK initialized successfully.');
    return true;
  } catch (error: any) {
    console.warn(`[FCM] Firebase initialization skipped: ${error.message}`);
    return false;
  }
}

/**
 * Send a push notification to a specific device token
 */
export async function sendToDevice(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> {
  if (!isFirebaseInitialized || !firebaseAdmin) {
    console.warn('[FCM] Firebase not initialized. Notification not sent.');
    return false;
  }

  try {
    const message = {
      token,
      notification: { title, body },
      data: data || {},
      android: {
        priority: 'high' as const,
        notification: {
          sound: 'default',
          channelId: 'labour_connect_bookings',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await firebaseAdmin.messaging().send(message);
    console.log(`[FCM] Notification sent: ${response}`);
    return true;
  } catch (error: any) {
    console.error(`[FCM] Error sending notification: ${error.message}`);
    return false;
  }
}

/**
 * Send a push notification to multiple device tokens
 */
export async function sendToMultipleDevices(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ successCount: number; failureCount: number }> {
  if (!isFirebaseInitialized || !firebaseAdmin) {
    console.warn('[FCM] Firebase not initialized. Notifications not sent.');
    return { successCount: 0, failureCount: tokens.length };
  }

  try {
    const message = {
      tokens,
      notification: { title, body },
      data: data || {},
      android: {
        priority: 'high' as const,
        notification: {
          sound: 'default',
          channelId: 'labour_connect_bookings',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    const response = await firebaseAdmin.messaging().sendEachForMulticast(message);
    console.log(`[FCM] Multicast sent: ${response.successCount} success, ${response.failureCount} failed`);
    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error: any) {
    console.error(`[FCM] Error sending multicast: ${error.message}`);
    return { successCount: 0, failureCount: tokens.length };
  }
}

/**
 * Send a booking notification to a provider (worker or company)
 * Looks up FCM tokens from the database and sends push + stores in-app notification
 */
export async function sendBookingNotification(
  supabaseAdmin: any,
  providerUserId: string,
  bookingId: string,
  notificationType: string,
  title: string,
  body: string
): Promise<void> {
  // 1. Store in-app notification
  await supabaseAdmin.from('notifications').insert({
    user_id: providerUserId,
    title,
    body,
    type: notificationType,
    data: { booking_id: bookingId },
  });

  // 2. Look up FCM tokens for the user
  const { data: tokens } = await supabaseAdmin
    .from('fcm_tokens')
    .select('token')
    .eq('user_id', providerUserId)
    .eq('is_active', true);

  if (!tokens || tokens.length === 0) {
    console.log(`[FCM] No active tokens for user ${providerUserId}`);
    return;
  }

  // 3. Send push notification to all user devices
  const deviceTokens = tokens.map((t: any) => t.token);
  if (deviceTokens.length === 1) {
    await sendToDevice(deviceTokens[0], title, body, {
      booking_id: bookingId,
      type: notificationType,
    });
  } else {
    await sendToMultipleDevices(deviceTokens, title, body, {
      booking_id: bookingId,
      type: notificationType,
    });
  }
}
