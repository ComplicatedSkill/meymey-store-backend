"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePurchaseInventoryDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_purchase_inventory_dto_1 = require("./create-purchase-inventory.dto");
class UpdatePurchaseInventoryDto extends (0, mapped_types_1.PartialType)(create_purchase_inventory_dto_1.CreatePurchaseInventoryDto) {
}
exports.UpdatePurchaseInventoryDto = UpdatePurchaseInventoryDto;
//# sourceMappingURL=update-purchase-inventory.dto.js.map