import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Injectable()
export class PushNotificationsService {
  private initialized = false;

  constructor(private configService: ConfigService) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      const serviceAccountPath = this.configService.get<string>(
        'FIREBASE_SERVICE_ACCOUNT_PATH',
      );

      if (serviceAccountPath) {
        const absolutePath = path.isAbsolute(serviceAccountPath)
          ? serviceAccountPath
          : path.resolve(process.cwd(), serviceAccountPath);

        console.log(`Initializing Firebase Admin with: ${absolutePath}`);

        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert(absolutePath),
          });
        }
        this.initialized = true;
        console.log('Firebase Admin SDK initialized successfully');
      } else {
        console.warn(
          'FIREBASE_SERVICE_ACCOUNT_PATH not found in environment. Push notifications will be disabled.',
        );
      }
    } catch (error) {
      console.error('Failed to initialize Firebase Admin SDK:', error);
    }
  }

  private sanitizeData(data?: any): { [key: string]: string } {
    if (!data) return {};
    const sanitized: { [key: string]: string } = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        if (value === null || value === undefined) {
          continue;
        }
        if (typeof value === 'object') {
          sanitized[key] = JSON.stringify(value);
        } else {
          sanitized[key] = String(value);
        }
      }
    }
    return sanitized;
  }

  async sendToToken(token: string, title: string, body: string, data?: any) {
    if (!this.initialized) {
      console.warn('Push notification skipped: Firebase not initialized');
      return;
    }

    const message: admin.messaging.Message = {
      notification: { title, body },
      token,
      data: this.sanitizeData(data),
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            contentAvailable: true,
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    try {
      const response = await admin.messaging().send(message);
      return response;
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw new InternalServerErrorException(
        'Failed to send push notification',
      );
    }
  }

  async sendToTopic(topic: string, title: string, body: string, data?: any) {
    if (!this.initialized) {
      console.warn('Push notification skipped: Firebase not initialized');
      return;
    }

    const message: admin.messaging.Message = {
      notification: { title, body },
      topic,
      data: this.sanitizeData(data),
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            contentAvailable: true,
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    try {
      console.log(`Sending push notification to topic: ${topic}`);
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:', response);
      return response;
    } catch (error) {
      console.error('Error sending push notification to topic:', error);
      throw new InternalServerErrorException(
        'Failed to send push notification to topic',
      );
    }
  }
}
