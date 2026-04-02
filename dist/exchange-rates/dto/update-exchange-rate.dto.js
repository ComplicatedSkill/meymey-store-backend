"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateExchangeRateDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_exchange_rate_dto_1 = require("./create-exchange-rate.dto");
class UpdateExchangeRateDto extends (0, mapped_types_1.PartialType)(create_exchange_rate_dto_1.CreateExchangeRateDto) {
}
exports.UpdateExchangeRateDto = UpdateExchangeRateDto;
//# sourceMappingURL=update-exchange-rate.dto.js.map