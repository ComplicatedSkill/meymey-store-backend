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
exports.SupabaseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
let SupabaseService = class SupabaseService {
    constructor(configService) {
        this.configService = configService;
        const supabaseUrl = this.configService.get('SUPABASE_URL');
        const supabaseAnonKey = this.configService.get('SUPABASE_ANON_KEY');
        const supabaseServiceRoleKey = this.configService.get('SUPABASE_SERVICE_ROLE_KEY');
        if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
            throw new Error('Missing Supabase configuration');
        }
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey);
        this.supabaseAdmin = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }
    getClient() {
        return this.supabase;
    }
    getAdminClient() {
        return this.supabaseAdmin;
    }
    async uploadFile(bucket, path, file, mimeType) {
        await this.ensureBucketExists(bucket);
        const { data, error } = await this.supabaseAdmin.storage
            .from(bucket)
            .upload(path, file, {
            contentType: mimeType,
            upsert: true,
        });
        if (error) {
            throw error;
        }
        const { data: publicUrlData } = this.supabaseAdmin.storage
            .from(bucket)
            .getPublicUrl(path);
        return publicUrlData.publicUrl;
    }
    async ensureBucketExists(bucket) {
        const { data: buckets, error: listError } = await this.supabaseAdmin.storage.listBuckets();
        if (listError) {
            throw listError;
        }
        const exists = buckets.some((b) => b.name === bucket);
        if (!exists) {
            const { error: createError } = await this.supabaseAdmin.storage.createBucket(bucket, {
                public: true,
                fileSizeLimit: 5242880,
            });
            if (createError) {
                throw createError;
            }
        }
    }
};
exports.SupabaseService = SupabaseService;
exports.SupabaseService = SupabaseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SupabaseService);
//# sourceMappingURL=supabase.service.js.map