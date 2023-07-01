/**
 * Used a contract with Node.js middleware
 */
export interface OrdersPayload {
  items: Order[];
  totalItems: number;
  totalPrice: number;
  datePlaced: number; // in milliseconds
  user: string;
}

export interface OrdersResponse extends OrdersPayload {
  _id: string;
}

/**
 * Every single itterable item
 */
export interface Order {
  user: string;
  productTitle: string;
  productId: string;
  quantity: number;
  userId: string;
  price: number;
}

export interface VerificationResponse {
  items: VerificationItem[];
}

export interface VerificationItem {
  id: string;
  pId: string;
  vId: string;
  oldPrice: number;
  newPrice: number;
}
