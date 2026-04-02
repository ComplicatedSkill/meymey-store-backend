"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const suppliers_controller_1 = require("./suppliers.controller");
describe('SuppliersController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [suppliers_controller_1.SuppliersController],
        }).compile();
        controller = module.get(suppliers_controller_1.SuppliersController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=suppliers.controller.spec.js.map