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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const supabase_service_1 = require("../supabase/supabase.service");
let UploadController = class UploadController {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async uploadLogo(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;
        const filePath = `logos/${fileName}`;
        try {
            const publicUrl = await this.supabaseService.uploadFile('stores', filePath, file.buffer, file.mimetype);
            return { url: publicUrl };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to upload logo: ' + error.message);
        }
    }
    async uploadProductImage(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;
        const filePath = `products/${fileName}`;
        try {
            const publicUrl = await this.supabaseService.uploadFile('stores', filePath, file.buffer, file.mimetype);
            return { url: publicUrl };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to upload product image: ' + error.message);
        }
    }
    async uploadCategoryImage(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;
        const filePath = `categories/${fileName}`;
        try {
            const publicUrl = await this.supabaseService.uploadFile('stores', filePath, file.buffer, file.mimetype);
            return { url: publicUrl };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to upload category image: ' + error.message);
        }
    }
    async uploadPackageImage(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;
        const filePath = `packages/${fileName}`;
        try {
            const publicUrl = await this.supabaseService.uploadFile('stores', filePath, file.buffer, file.mimetype);
            return { url: publicUrl };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to upload package image: ' + error.message);
        }
    }
    async uploadBrandImage(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExt}`;
        const filePath = `brands/${fileName}`;
        try {
            const publicUrl = await this.supabaseService.uploadFile('stores', filePath, file.buffer, file.mimetype);
            return { url: publicUrl };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to upload brand image: ' + error.message);
        }
    }
};
exports.UploadController = UploadController;
__decorate([
    (0, common_1.Post)('logo'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadLogo", null);
__decorate([
    (0, common_1.Post)('product'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadProductImage", null);
__decorate([
    (0, common_1.Post)('category'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadCategoryImage", null);
__decorate([
    (0, common_1.Post)('package'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadPackageImage", null);
__decorate([
    (0, common_1.Post)('brand'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadBrandImage", null);
exports.UploadController = UploadController = __decorate([
    (0, common_1.Controller)('upload'),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], UploadController);
//# sourceMappingURL=upload.controller.js.map