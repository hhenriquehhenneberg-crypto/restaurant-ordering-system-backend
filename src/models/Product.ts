export interface Product {
  id: string;
  category_id: string;
  title: string;
  description: string | null;
  price: string;
  image: string | null;
  available: boolean;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}
