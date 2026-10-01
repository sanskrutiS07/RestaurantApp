export type MenuCategory = 'Starters' | 'Mains' | 'Desserts' | 'Drinks';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: MenuCategory;
  veg: boolean;
  image: string;
}

export interface CartLine {
  item: MenuItem;
  quantity: number;
}

export interface PlacedOrder {
  orderId: string;
  table: number;
  lines: CartLine[];
  subtotal: number;
  tax: number;
  total: number;
  placedAt: Date;
  variant: 'A' | 'B';
}
