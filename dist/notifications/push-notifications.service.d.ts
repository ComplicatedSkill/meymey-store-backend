import { ConfigService } from '@nestjs/config';
export declare class PushNotificationsService {
    private configService;
    private initialized;
    constructor(configService: ConfigService);
    private initializeFirebase;
    private sanitizeData;
    sendToToken(token: string, title: string, body: string, data?: any): Promise<string | undefined>;
    sendToTopic(topic: string, title: string, body: string, data?: any): Promise<string | undefined>;
}
