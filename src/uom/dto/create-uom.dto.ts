import { IsString } from 'class-validator';

export class CreateUomDto {
  @IsString()
  name: string;

  @IsString()
  abbreviation: string;
}
