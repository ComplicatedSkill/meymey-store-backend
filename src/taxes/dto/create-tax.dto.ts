export class CreateTaxDto {
  name: string;
  rate: number;
  description?: string;
  is_active?: boolean;
}
