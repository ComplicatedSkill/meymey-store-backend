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
exports.StockBatchesController = void 0;
const common_1 = require("@nestjs/common");
const stock_batches_service_1 = require("./stock-batches.service");
const create_stock_batch_dto_1 = require("./dto/create-stock-batch.dto");
const supabase_auth_guard_1 = require("../auth/supabase-auth.guard");
let StockBatchesController = class StockBatchesController {
    constructor(stockBatchesService) {
        this.stockBatchesService = stockBatchesService;
    }
    create(createDto, req) {
        const storeId = req.user.store?.id;
        return this.stockBatchesService.create(createDto, storeId);
    }
    findAll(req) {
        const storeId = req.user.store?.id;
        return this.stockBatchesService.findAll(storeId);
    }
    findByProduct(productId, variantId, req) {
        const storeId = req.user.store?.id;
        return this.stockBatchesService.findByProduct(productId, storeId, variantId);
    }
    getAvailableStock(productId, variantId, req) {
        const storeId = req.user.store?.id;
        return this.stockBatchesService.getAvailableStock(productId, storeId, variantId);
    }
    findOne(id, req) {
        const storeId = req.user.store?.id;
        return this.stockBatchesService.findOne(id, storeId);
    }
    remove(id, req) {
        const storeId = req.user.store?.id;
        return this.stockBatchesService.remove(id, storeId);
    }
};
exports.StockBatchesController = StockBatchesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_stock_batch_dto_1.CreateStockBatchDto, Object]),
    __metadata("design:returntype", void 0)
], StockBatchesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StockBatchesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('product/:productId'),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Query)('variantId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], StockBatchesController.prototype, "findByProduct", null);
__decorate([
    (0, common_1.Get)('available/:productId'),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Query)('variantId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], StockBatchesController.prototype, "getAvailableStock", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], StockBatchesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], StockBatchesController.prototype, "remove", null);
exports.StockBatchesController = StockBatchesController = __decorate([
    (0, common_1.Controller)('stock-batches'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __metadata("design:paramtypes", [stock_batches_service_1.StockBatchesService])
], StockBatchesController);
//# sourceMappingURL=stock-batches.controller.js.map