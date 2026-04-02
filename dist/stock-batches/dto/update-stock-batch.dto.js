"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateStockBatchDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_stock_batch_dto_1 = require("./create-stock-batch.dto");
class UpdateStockBatchDto extends (0, mapped_types_1.PartialType)(create_stock_batch_dto_1.CreateStockBatchDto) {
}
exports.UpdateStockBatchDto = UpdateStockBatchDto;
//# sourceMappingURL=update-stock-batch.dto.js.map