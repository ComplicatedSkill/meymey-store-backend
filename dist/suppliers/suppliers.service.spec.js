"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const suppliers_service_1 = require("./suppliers.service");
describe('SuppliersService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [suppliers_service_1.SuppliersService],
        }).compile();
        service = module.get(suppliers_service_1.SuppliersService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=suppliers.service.spec.js.map