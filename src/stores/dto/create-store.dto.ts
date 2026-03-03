export class CreateStoreDto {
  store_name: string;
  store_category?: string;
  username: string;
  phone_number?: string;
  products_sold?: string[];
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  secondary_phone?: string;
  whatsapp_number?: string;
}
