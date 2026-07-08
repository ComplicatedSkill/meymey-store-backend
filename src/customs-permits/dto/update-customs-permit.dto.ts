import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomsPermitDto } from './create-customs-permit.dto';

export class UpdateCustomsPermitDto extends PartialType(
  CreateCustomsPermitDto,
) {}
