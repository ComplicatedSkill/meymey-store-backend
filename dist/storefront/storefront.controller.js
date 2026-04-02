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
exports.StorefrontController = void 0;
const common_1 = require("@nestjs/common");
const storefront_service_1 = require("./storefront.service");
let StorefrontController = class StorefrontController {
    constructor(storefrontService) {
        this.storefrontService = storefrontService;
    }
    getHomepage() {
        return this.storefrontService.getHomepage();
    }
    getProducts(brandId) {
        return this.storefrontService.getProducts({ brandId });
    }
    getProduct(productId) {
        return this.storefrontService.getProduct(productId);
    }
    getCategories() {
        return this.storefrontService.getCategories();
    }
    placeOrder(body) {
        return this.storefrontService.placeOrder(body);
    }
};
exports.StorefrontController = StorefrontController;
__decorate([
    (0, common_1.Get)('homepage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StorefrontController.prototype, "getHomepage", null);
__decorate([
    (0, common_1.Get)('products'),
    __param(0, (0, common_1.Query)('brandId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StorefrontController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Get)('products/:productId'),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StorefrontController.prototype, "getProduct", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StorefrontController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Post)('orders'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StorefrontController.prototype, "placeOrder", null);
exports.StorefrontController = StorefrontController = __decorate([
    (0, common_1.Controller)('storefront'),
    __metadata("design:paramtypes", [storefront_service_1.StorefrontService])
], StorefrontController);
//# sourceMappingURL=storefront.controller.js.map