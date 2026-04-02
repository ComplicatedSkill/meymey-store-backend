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
exports.StockAdjustmentsController = void 0;
const common_1 = require("@nestjs/common");
const stock_adjustments_service_1 = require("./stock-adjustments.service");
const supabase_auth_guard_1 = require("../auth/supabase-auth.guard");
let StockAdjustmentsController = class StockAdjustmentsController {
    constructor(stockAdjustmentsService) {
        this.stockAdjustmentsService = stockAdjustmentsService;
    }
    create(createDto, req) {
        createDto.adjusted_by = req.user?.userId;
        return this.stockAdjustmentsService.create(createDto);
    }
    findAll() {
        return this.stockAdjustmentsService.findAll();
    }
    findOne(id) {
        return this.stockAdjustmentsService.findOne(id);
    }
    findByProduct(productId) {
        return this.stockAdjustmentsService.findByProduct(productId);
    }
};
exports.StockAdjustmentsController = StockAdjustmentsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stock_adjustments_service_1.CreateStockAdjustmentDto, Object]),
    __metadata("design:returntype", void 0)
], StockAdjustmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StockAdjustmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StockAdjustmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('product/:productId'),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StockAdjustmentsController.prototype, "findByProduct", null);
exports.StockAdjustmentsController = StockAdjustmentsController = __decorate([
    (0, common_1.Controller)('stock-adjustments'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __metadata("design:paramtypes", [stock_adjustments_service_1.StockAdjustmentsService])
], StockAdjustmentsController);
//# sourceMappingURL=stock-adjustments.controller.js.map