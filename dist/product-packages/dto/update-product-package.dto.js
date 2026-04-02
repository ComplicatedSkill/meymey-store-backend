"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProductPackageDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_product_package_dto_1 = require("./create-product-package.dto");
class UpdateProductPackageDto extends (0, mapped_types_1.PartialType)(create_product_package_dto_1.CreateProductPackageDto) {
}
exports.UpdateProductPackageDto = UpdateProductPackageDto;
//# sourceMappingURL=update-product-package.dto.js.map