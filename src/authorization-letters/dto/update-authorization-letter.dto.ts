import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthorizationLetterDto } from './create-authorization-letter.dto';

export class UpdateAuthorizationLetterDto extends PartialType(
  CreateAuthorizationLetterDto,
) {}
