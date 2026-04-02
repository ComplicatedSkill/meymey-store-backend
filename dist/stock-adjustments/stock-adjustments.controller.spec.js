"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const stock_adjustments_controller_1 = require("./stock-adjustments.controller");
describe('StockAdjustmentsController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [stock_adjustments_controller_1.StockAdjustmentsController],
        }).compile();
        controller = module.get(stock_adjustments_controller_1.StockAdjustmentsController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=stock-adjustments.controller.spec.js.map