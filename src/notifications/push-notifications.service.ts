import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

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
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccountPath),
        });
        this.initialized = true;
      } else {
        console.warn(
          'FIREBASE_SERVICE_ACCOUNT_PATH not found. Push notifications will be disabled.',
        );
      }
    } catch (error) {
      console.error('Failed to initialize Firebase Admin SDK:', error);
    }
  }

  async sendToToken(token: string, title: string, body: string, data?: any) {
    if (!this.initialized) {
      console.warn('Push notification skipped: Firebase not initialized');
      return;
    }

    const message: admin.messaging.Message = {
      notification: { title, body },
      token,
      data: data || {},
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
      data: data || {},
    };

    try {
      const response = await admin.messaging().send(message);
      return response;
    } catch (error) {
      console.error('Error sending push notification to topic:', error);
      throw new InternalServerErrorException(
        'Failed to send push notification to topic',
      );
    }
  }
}
