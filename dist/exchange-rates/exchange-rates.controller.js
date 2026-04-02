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
exports.ExchangeRatesController = void 0;
const common_1 = require("@nestjs/common");
const exchange_rates_service_1 = require("./exchange-rates.service");
const create_exchange_rate_dto_1 = require("./dto/create-exchange-rate.dto");
const update_exchange_rate_dto_1 = require("./dto/update-exchange-rate.dto");
const supabase_auth_guard_1 = require("../auth/supabase-auth.guard");
let ExchangeRatesController = class ExchangeRatesController {
    constructor(exchangeRatesService) {
        this.exchangeRatesService = exchangeRatesService;
    }
    create(createDto, req) {
        const storeId = req.user?.store?.id;
        return this.exchangeRatesService.create(createDto, storeId);
    }
    findAll() {
        return this.exchangeRatesService.findAll();
    }
    getRate(fromCurrency, toCurrency) {
        return this.exchangeRatesService.getRate(fromCurrency, toCurrency);
    }
    convert(amount, fromCurrency, toCurrency) {
        return this.exchangeRatesService.convert(parseFloat(amount), fromCurrency, toCurrency);
    }
    findOne(id) {
        return this.exchangeRatesService.findOne(id);
    }
    update(id, updateDto) {
        return this.exchangeRatesService.update(id, updateDto);
    }
    remove(id) {
        return this.exchangeRatesService.remove(id);
    }
};
exports.ExchangeRatesController = ExchangeRatesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_exchange_rate_dto_1.CreateExchangeRateDto, Object]),
    __metadata("design:returntype", void 0)
], ExchangeRatesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExchangeRatesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('rate'),
    __param(0, (0, common_1.Query)('from')),
    __param(1, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ExchangeRatesController.prototype, "getRate", null);
__decorate([
    (0, common_1.Get)('convert'),
    __param(0, (0, common_1.Query)('amount')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ExchangeRatesController.prototype, "convert", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExchangeRatesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_exchange_rate_dto_1.UpdateExchangeRateDto]),
    __metadata("design:returntype", void 0)
], ExchangeRatesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExchangeRatesController.prototype, "remove", null);
exports.ExchangeRatesController = ExchangeRatesController = __decorate([
    (0, common_1.Controller)('exchange-rates'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __metadata("design:paramtypes", [exchange_rates_service_1.ExchangeRatesService])
], ExchangeRatesController);
//# sourceMappingURL=exchange-rates.controller.js.map