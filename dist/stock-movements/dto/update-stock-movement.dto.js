"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateStockMovementDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_stock_movement_dto_1 = require("./create-stock-movement.dto");
class UpdateStockMovementDto extends (0, mapped_types_1.PartialType)(create_stock_movement_dto_1.CreateStockMovementDto) {
}
exports.UpdateStockMovementDto = UpdateStockMovementDto;
//# sourceMappingURL=update-stock-movement.dto.js.map