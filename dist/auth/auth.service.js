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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let AuthService = class AuthService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async signUp(signUpDto) {
        const { email, password, store_name, store_category, username, phone_number, products_sold, address, city, state, country, postal_code, secondary_phone, whatsapp_number, logo_url, description, instagram, twitter, website, } = signUpDto;
        const { data: existingStore } = await this.supabaseService
            .getClient()
            .from('stores')
            .select('id')
            .eq('username', username)
            .single();
        if (existingStore) {
            throw new common_1.BadRequestException('Username already taken');
        }
        const { data: authData, error: authError } = await this.supabaseService
            .getAdminClient()
            .auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        });
        if (authError) {
            throw new common_1.UnauthorizedException(authError.message);
        }
        const { data: storeData, error: storeError } = await this.supabaseService
            .getClient()
            .from('stores')
            .insert({
            user_id: authData.user.id,
            store_name,
            store_category,
            username,
            phone_number,
            products_sold,
            address,
            city,
            state,
            country,
            postal_code,
            secondary_phone,
            whatsapp_number,
            logo_url,
            description,
            instagram,
            twitter,
            website,
        })
            .select()
            .single();
        if (storeError) {
            await this.supabaseService
                .getAdminClient()
                .auth.admin.deleteUser(authData.user.id);
            throw new common_1.BadRequestException('Failed to create store profile: ' + storeError.message);
        }
        return {
            user: authData.user,
            store: storeData,
        };
    }
    async signIn(email, password) {
        let data, error;
        try {
            ({ data, error } = await this.supabaseService
                .getClient()
                .auth.signInWithPassword({
                email,
                password,
            }));
        }
        catch (err) {
            throw new common_1.ServiceUnavailableException('Cannot connect to authentication service. Please try again later.');
        }
        if (error) {
            if (error.message?.includes('fetch') ||
                error.message?.includes('timeout') ||
                error.message?.includes('network') ||
                error.code === 'UND_ERR_CONNECT_TIMEOUT') {
                throw new common_1.ServiceUnavailableException('Cannot connect to authentication service. Please try again later.');
            }
            throw new common_1.UnauthorizedException(error.message);
        }
        const { data: storeData } = await this.supabaseService
            .getAdminClient()
            .from('stores')
            .select('*')
            .eq('user_id', data.user.id)
            .single();
        return {
            access_token: data.session?.access_token,
            refresh_token: data.session?.refresh_token,
            user: data.user,
            store: storeData || null,
        };
    }
    async getUser(accessToken) {
        const { data, error } = await this.supabaseService
            .getClient()
            .auth.getUser(accessToken);
        if (error) {
            throw new common_1.UnauthorizedException(error.message);
        }
        return data.user;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], AuthService);
//# sourceMappingURL=auth.service.js.map