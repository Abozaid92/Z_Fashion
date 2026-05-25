// ─────────────────────────────────────────────
// Shared types used across all checkout modules
// ─────────────────────────────────────────────

export type Country = {
  code: string; // ISO 3166-1 alpha-2  e.g. "EG"
  name: string; // e.g. "Egypt"
  flag: string; // emoji  e.g. "🇪🇬"
  dialCode: string; // e.g. "+20"
};

export type State = {
  code: string;
  name: string;
};

export type ShippingMethod = {
  id: "standard" | "express" | "overnight";
  label: string;
  description: string;
  price: number;
  eta: string;
};

export type OrderItem = {
  id: string;
  name: string;
  variant: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

export type CheckoutStep = 1 | 2 | 3;

export type AddressData = {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  country: string;
  state: string;
  postalCode: string;
  shippingMethod: ShippingMethod["id"];
};

export type PaymentData = {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
};

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "standard",
    label: "Standard Shipping",
    description: "Delivered in 5–7 business days",
    price: 0,
    eta: "5–7 days",
  },
  {
    id: "express",
    label: "Express Shipping",
    description: "Delivered in 2–3 business days",
    price: 9.99,
    eta: "2–3 days",
  },
  {
    id: "overnight",
    label: "Overnight Delivery",
    description: "Next business day by 12:00 PM",
    price: 24.99,
    eta: "Next day",
  },
];

export const ORDER_ITEMS: OrderItem[] = [
  {
    id: "1",
    name: "Aether Wireless Headphones",
    variant: "Midnight Black / Over-Ear",
    price: 189.0,
    quantity: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&h=120&fit=crop",
  },
  {
    id: "2",
    name: "Vela Leather Carry Case",
    variant: "Saddle Tan",
    price: 49.0,
    quantity: 2,
    imageUrl:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=120&h=120&fit=crop",
  },
];
