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
exports.SupabaseAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let SupabaseAuthGuard = class SupabaseAuthGuard {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('Missing or invalid authorization header');
        }
        const token = authHeader.replace('Bearer ', '');
        try {
            const { data, error } = await this.supabaseService
                .getClient()
                .auth.getUser(token);
            if (error || !data.user) {
                throw new common_1.UnauthorizedException('Invalid token');
            }
            const requestedStoreId = request.headers['x-store-id'];
            let storeQuery = this.supabaseService
                .getAdminClient()
                .from('stores')
                .select('*')
                .eq('user_id', data.user.id);
            if (requestedStoreId) {
                storeQuery = storeQuery.eq('id', requestedStoreId);
            }
            const { data: storeData, error: storeError } = await storeQuery;
            if (storeError) {
                throw new common_1.UnauthorizedException('Error fetching store information');
            }
            if (requestedStoreId && (!storeData || storeData.length === 0)) {
                throw new common_1.UnauthorizedException('Requested store not found or access denied');
            }
            const selectedStore = storeData && storeData.length > 0 ? storeData[0] : null;
            request.user = {
                userId: data.user.id,
                email: data.user.email,
                role: data.user.role,
                store: selectedStore,
            };
            return true;
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException)
                throw error;
            throw new common_1.UnauthorizedException('Token validation failed');
        }
    }
};
exports.SupabaseAuthGuard = SupabaseAuthGuard;
exports.SupabaseAuthGuard = SupabaseAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], SupabaseAuthGuard);
//# sourceMappingURL=supabase-auth.guard.js.map