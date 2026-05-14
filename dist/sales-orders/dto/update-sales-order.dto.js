"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSalesOrderDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_sales_order_dto_1 = require("./create-sales-order.dto");
class UpdateSalesOrderDto extends (0, mapped_types_1.PartialType)(create_sales_order_dto_1.CreateSalesOrderDto) {
}
exports.UpdateSalesOrderDto = UpdateSalesOrderDto;
//# sourceMappingURL=update-sales-order.dto.js.map