export class SignUpDto {
  // Auth credentials
  email: string;
  password: string;

  // Store profile
  store_name: string;
  store_category?: string;
  username: string;
  phone_number?: string;
  products_sold?: string[];

  // Location
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;

  // Additional contact
  secondary_phone?: string;
  whatsapp_number?: string;

  // Store Branding
  logo_url?: string;
  description?: string;
  instagram?: string;
  twitter?: string;
  website?: string;
}
