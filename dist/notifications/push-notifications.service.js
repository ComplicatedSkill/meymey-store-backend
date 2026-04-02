"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const admin = require("firebase-admin");
const path = require("path");
let PushNotificationsService = class PushNotificationsService {
    constructor(configService) {
        this.configService = configService;
        this.initialized = false;
        this.initializeFirebase();
    }
    initializeFirebase() {
        try {
            const serviceAccountJson = this.configService.get('FIREBASE_SERVICE_ACCOUNT_JSON');
            const serviceAccountPath = this.configService.get('FIREBASE_SERVICE_ACCOUNT_PATH');
            if (admin.apps.length) {
                this.initialized = true;
                return;
            }
            if (serviceAccountJson) {
                const serviceAccount = JSON.parse(serviceAccountJson);
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                });
                this.initialized = true;
                console.log('Firebase Admin SDK initialized successfully (from JSON env)');
            }
            else if (serviceAccountPath) {
                const absolutePath = path.isAbsolute(serviceAccountPath)
                    ? serviceAccountPath
                    : path.resolve(process.cwd(), serviceAccountPath);
                console.log(`Initializing Firebase Admin with: ${absolutePath}`);
                admin.initializeApp({
                    credential: admin.credential.cert(absolutePath),
                });
                this.initialized = true;
                console.log('Firebase Admin SDK initialized successfully (from file)');
            }
            else {
                console.warn('Neither FIREBASE_SERVICE_ACCOUNT_JSON nor FIREBASE_SERVICE_ACCOUNT_PATH found. Push notifications will be disabled.');
            }
        }
        catch (error) {
            console.error('Failed to initialize Firebase Admin SDK:', error);
        }
    }
    sanitizeData(data) {
        if (!data)
            return {};
        const sanitized = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const value = data[key];
                if (value === null || value === undefined) {
                    continue;
                }
                if (typeof value === 'object') {
                    sanitized[key] = JSON.stringify(value);
                }
                else {
                    sanitized[key] = String(value);
                }
            }
        }
        return sanitized;
    }
    async sendToToken(token, title, body, data) {
        if (!this.initialized) {
            console.warn('Push notification skipped: Firebase not initialized');
            return;
        }
        const message = {
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
        }
        catch (error) {
            console.error('Error sending push notification:', error);
            throw new common_1.InternalServerErrorException('Failed to send push notification');
        }
    }
    async sendToTopic(topic, title, body, data) {
        if (!this.initialized) {
            console.warn('Push notification skipped: Firebase not initialized');
            return;
        }
        const message = {
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
        }
        catch (error) {
            console.error('Error sending push notification to topic:', error);
            throw new common_1.InternalServerErrorException('Failed to send push notification to topic');
        }
    }
};
exports.PushNotificationsService = PushNotificationsService;
exports.PushNotificationsService = PushNotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PushNotificationsService);
//# sourceMappingURL=push-notifications.service.js.map