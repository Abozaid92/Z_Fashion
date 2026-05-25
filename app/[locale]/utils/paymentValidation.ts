import { z } from "zod";

export const addressSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),

  phone: z
    .string()
    .min(6, "Enter a valid phone number")
    .max(20, "Phone number too long"),

  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name is too long")
    .regex(/^[A-Za-zÀ-ÿ\s'-]+$/, "First name contains invalid characters"),

  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name is too long")
    .regex(/^[A-Za-zÀ-ÿ\s'-]+$/, "Last name contains invalid characters"),

  address: z
    .string()
    .min(5, "Enter your full street address")
    .max(120, "Address is too long"),

  apartment: z.string().max(50, "Too long").optional().or(z.literal("")),

  city: z.string().min(2, "City is required").max(60, "City name is too long"),

  country: z.string().min(1, "Select a country"),
  state: z.string().min(1, "Select a state / governorate"),

  postalCode: z
    .string()
    .min(3, "Postal code is required")
    .max(12, "Postal code is too long"),

  shippingMethod: z.enum(["standard", "express", "overnight"], {
    required_error: "Choose a shipping method",
  }),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

export const paymentSchema = z.object({
  cardNumber: z
    .string()
    .min(19, "Card number must be 16 digits")
    .max(19, "Card number must be 16 digits")
    .regex(/^[\d ]+$/, "Card number must be numeric"),

  cardHolder: z
    .string()
    .min(3, "Cardholder name is required")
    .max(60, "Name is too long")
    .regex(/^[A-Za-zÀ-ÿ\s'-]+$/, "Enter a valid name"),

  expiry: z
    .string()
    .length(5, "Format: MM/YY")
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Format: MM/YY"),

  cvv: z
    .string()
    .min(3, "CVV is 3–4 digits")
    .max(4, "CVV is 3–4 digits")
    .regex(/^\d+$/, "CVV must be numeric"),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
