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
exports.ProductPackagesController = void 0;
const common_1 = require("@nestjs/common");
const product_packages_service_1 = require("./product-packages.service");
const create_product_package_dto_1 = require("./dto/create-product-package.dto");
const update_product_package_dto_1 = require("./dto/update-product-package.dto");
const supabase_auth_guard_1 = require("../auth/supabase-auth.guard");
let ProductPackagesController = class ProductPackagesController {
    constructor(productPackagesService) {
        this.productPackagesService = productPackagesService;
    }
    create(createDto, req) {
        const storeId = req.user?.store?.id;
        return this.productPackagesService.create(createDto, storeId);
    }
    findAll() {
        return this.productPackagesService.findAll();
    }
    findOne(id) {
        return this.productPackagesService.findOne(id);
    }
    update(id, updateDto) {
        return this.productPackagesService.update(id, updateDto);
    }
    remove(id) {
        return this.productPackagesService.remove(id);
    }
};
exports.ProductPackagesController = ProductPackagesController;
__decorate([
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_package_dto_1.CreateProductPackageDto, Object]),
    __metadata("design:returntype", void 0)
], ProductPackagesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductPackagesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductPackagesController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_package_dto_1.UpdateProductPackageDto]),
    __metadata("design:returntype", void 0)
], ProductPackagesController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductPackagesController.prototype, "remove", null);
exports.ProductPackagesController = ProductPackagesController = __decorate([
    (0, common_1.Controller)('product-packages'),
    __metadata("design:paramtypes", [product_packages_service_1.ProductPackagesService])
], ProductPackagesController);
//# sourceMappingURL=product-packages.controller.js.map