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
exports.StockMovementsController = void 0;
const common_1 = require("@nestjs/common");
const stock_movements_service_1 = require("./stock-movements.service");
const create_stock_movement_dto_1 = require("./dto/create-stock-movement.dto");
const update_stock_movement_dto_1 = require("./dto/update-stock-movement.dto");
const supabase_auth_guard_1 = require("../auth/supabase-auth.guard");
let StockMovementsController = class StockMovementsController {
    constructor(service) {
        this.service = service;
    }
    create(createDto, req) {
        const storeId = req.user.store?.id;
        return this.service.create(createDto, storeId);
    }
    findAll(req, productId) {
        const storeId = req.user.store?.id;
        if (productId) {
            return this.service.findByProduct(productId, storeId);
        }
        return this.service.findAll(storeId);
    }
    getStockLevel(productId, req, variantId) {
        const storeId = req.user.store?.id;
        return this.service.getStockLevel(productId, storeId, variantId);
    }
    findOne(id, req) {
        const storeId = req.user.store?.id;
        return this.service.findOne(id, storeId);
    }
    update(id, updateDto, req) {
        const storeId = req.user.store?.id;
        return this.service.update(id, updateDto, storeId);
    }
    remove(id, req) {
        const storeId = req.user.store?.id;
        return this.service.remove(id, storeId);
    }
};
exports.StockMovementsController = StockMovementsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_stock_movement_dto_1.CreateStockMovementDto, Object]),
    __metadata("design:returntype", void 0)
], StockMovementsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('product_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], StockMovementsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stock-level/:productId'),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Query)('variant_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], StockMovementsController.prototype, "getStockLevel", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], StockMovementsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_stock_movement_dto_1.UpdateStockMovementDto, Object]),
    __metadata("design:returntype", void 0)
], StockMovementsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], StockMovementsController.prototype, "remove", null);
exports.StockMovementsController = StockMovementsController = __decorate([
    (0, common_1.Controller)('stock-movements'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __metadata("design:paramtypes", [stock_movements_service_1.StockMovementsService])
], StockMovementsController);
//# sourceMappingURL=stock-movements.controller.js.map