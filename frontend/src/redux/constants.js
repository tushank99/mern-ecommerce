// In production, set VITE_API_URL to your backend URL (e.g., https://your-backend.onrender.com)
// In development, leave it empty to use the Vite proxy
export const BASE_URL = import.meta.env.VITE_API_URL || "";

export const USERS_URL = "/api/users";
export const CATEGORY_URL = "/api/category";
export const PRODUCT_URL = "/api/products";
export const UPLOAD_URL = "/api/upload";
export const ORDERS_URL = "/api/orders";
export const PAYPAL_URL = "/api/config/paypal";
