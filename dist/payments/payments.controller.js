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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const payments_service_1 = require("./payments.service");
const supabase_auth_guard_1 = require("../auth/supabase-auth.guard");
let PaymentsController = class PaymentsController {
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    async createPaymentQr(body) {
        return this.paymentsService.createPaymentQr(body.invoiceId, body.amount);
    }
    async checkStatus(tranId) {
        return this.paymentsService.checkTransaction(tranId);
    }
    async generateWebsiteQr(body) {
        return this.paymentsService.generateWebsiteQr(body.amount, body.customerInfo);
    }
    async checkWebsiteStatus(tranId) {
        return this.paymentsService.checkTransaction(tranId);
    }
    async webhook(payload) {
        return this.paymentsService.handleWebhook(payload);
    }
    async recordManualPayment(body) {
        return this.paymentsService.recordManualPayment(body);
    }
    async getPaymentsByInvoice(invoiceId) {
        return this.paymentsService.findByInvoice(invoiceId);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('create-qr'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createPaymentQr", null);
__decorate([
    (0, common_1.Get)('check'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __param(0, (0, common_1.Query)('tranId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "checkStatus", null);
__decorate([
    (0, common_1.Post)('generate-qr'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "generateWebsiteQr", null);
__decorate([
    (0, common_1.Get)('check-status/:tranId'),
    __param(0, (0, common_1.Param)('tranId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "checkWebsiteStatus", null);
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "webhook", null);
__decorate([
    (0, common_1.Post)('manual'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "recordManualPayment", null);
__decorate([
    (0, common_1.Get)('invoice/:invoiceId'),
    (0, common_1.UseGuards)(supabase_auth_guard_1.SupabaseAuthGuard),
    __param(0, (0, common_1.Param)('invoiceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPaymentsByInvoice", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map