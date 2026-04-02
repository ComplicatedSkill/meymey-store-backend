"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const stock_adjustments_service_1 = require("./stock-adjustments.service");
describe('StockAdjustmentsService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [stock_adjustments_service_1.StockAdjustmentsService],
        }).compile();
        service = module.get(stock_adjustments_service_1.StockAdjustmentsService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=stock-adjustments.service.spec.js.map