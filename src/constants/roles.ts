export const Roles = {
  Admin: "admin",
  DeliveryBoy: "delivery_boy",
  StoreOwner: "store_owner",
} as const;

export type RoleSlug = typeof Roles[keyof typeof Roles];