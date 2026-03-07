import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class SaveDeviceTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsOptional()
  device_type?: string;
}
