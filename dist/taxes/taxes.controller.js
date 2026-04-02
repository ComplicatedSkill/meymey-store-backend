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
exports.TaxesController = void 0;
const common_1 = require("@nestjs/common");
const taxes_service_1 = require("./taxes.service");
const create_tax_dto_1 = require("./dto/create-tax.dto");
const update_tax_dto_1 = require("./dto/update-tax.dto");
const supabase_auth_guard_1 = require("../auth/supabase-auth.guard");
let TaxesController = class TaxesController {
    constructor(taxesService) {
        this.taxesService = taxesService;
    }
    create(createDto, req) {
        const storeId = req.user.store?.id;
        return this.taxesService.create(createDto, storeId);
    }
    findAll(req) {
        const storeId = req.user.store?.id;
        return this.taxesService.findAll(storeId);
    }
    findOne(id, req) {
        const storeId = req.user.store?.id;
        return this.taxesService.findOne(id, storeId);
    }
    update(id, updateDto, req) {
        const storeId = req.user.store?.id;
        return this.taxesService.update(id, updateDto, storeId);
    }
    remove(id, req) {
        const storeId = req.user.store?.id;
        return this.taxesService.remove(id, storeId);
    }
};
exports.TaxesController = TaxesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_tax_dto_1.CreateTaxDto, Object]),
    __metadata("design:returntype", void 0)
], TaxesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TaxesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TaxesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_tax_dto_1.UpdateTaxDto, Object]),
    __metadata("design:returntype", void 0)
], TaxesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TaxesController.prototype, "remove", null);
exports.TaxesController = TaxesController = __decorate([
    (0, common_1.Controller)('taxes'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __metadata("design:paramtypes", [taxes_service_1.TaxesService])
], TaxesController);
//# sourceMappingURL=taxes.controller.js.map