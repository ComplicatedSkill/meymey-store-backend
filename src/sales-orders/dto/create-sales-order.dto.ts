import {
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SalesOrderItemDto } from './sales-order-item.dto';

export class DeliveryInfoDto {
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  recipientName?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  trackingNumber?: string;
}

export class CreateSalesOrderDto {
  @IsOptional()
  @IsString()
  customer_id?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalesOrderItemDto)
  items: SalesOrderItemDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  order_date?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  sale_type?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DeliveryInfoDto)
  delivery_info?: DeliveryInfoDto;
}
