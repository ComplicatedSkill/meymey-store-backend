"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUomDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_uom_dto_1 = require("./create-uom.dto");
class UpdateUomDto extends (0, mapped_types_1.PartialType)(create_uom_dto_1.CreateUomDto) {
}
exports.UpdateUomDto = UpdateUomDto;
//# sourceMappingURL=update-uom.dto.js.map