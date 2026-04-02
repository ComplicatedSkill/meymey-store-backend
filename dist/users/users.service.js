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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let UsersService = class UsersService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async findOne(id) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .auth.admin.getUserById(id);
        if (error || !data.user)
            return null;
        return {
            id: data.user.id,
            email: data.user.email || '',
            created_at: data.user.created_at,
        };
    }
    async findByEmail(email) {
        const users = await this.findAll();
        return users.find((u) => u.email === email) || null;
    }
    async findAll() {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .auth.admin.listUsers();
        if (error)
            throw error;
        return data.users.map((user) => ({
            id: user.id,
            email: user.email || '',
            created_at: user.created_at,
        }));
    }
    async create(createDto) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .auth.admin.createUser({
            email: createDto.email,
            password: createDto.password,
            email_confirm: true,
        });
        if (error)
            throw error;
        return {
            id: data.user.id,
            email: data.user.email || '',
            created_at: data.user.created_at,
        };
    }
    async update(id, updateDto) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .auth.admin.updateUserById(id, {
            email: updateDto.email,
            password: updateDto.password,
        });
        if (error)
            throw error;
        return {
            id: data.user.id,
            email: data.user.email || '',
            created_at: data.user.created_at,
        };
    }
    async remove(id) {
        const { error } = await this.supabaseService
            .getAdminClient()
            .auth.admin.deleteUser(id);
        if (error)
            throw error;
        return { message: 'User deleted successfully' };
    }
    async saveDeviceToken(userId, token, deviceType) {
        const { data, error } = await this.supabaseService
            .getAdminClient()
            .from('user_device_tokens')
            .upsert({
            user_id: userId,
            token: token,
            device_type: deviceType,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,token' })
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], UsersService);
//# sourceMappingURL=users.service.js.map