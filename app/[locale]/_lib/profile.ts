// Profile Types with strict TypeScript
export interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'BANNED';
  country: string;
  createdAt: string;
  cart: CartItem[];
  favorite: FavoriteProduct[];
  order: Order[];
}

export interface CartItem {
  id: string;
  quantity: number;
  size: 'Small' | 'Medium' | 'Large' | 'XLarge';
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    slug: string;
  };
}

export interface FavoriteProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  discount: number | null;
  rating: number;
  inStock: boolean;
}

export interface Order {
  id: string;
  totalAmount: number;
  status: 'PENDING_PAYMENT' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  createdAt: string;
}

export interface AdminAction {
  success: boolean;
  message: string;
}
