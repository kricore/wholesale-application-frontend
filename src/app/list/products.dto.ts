/**
 * The main product interface
 */
export interface Product {
  id: string;
  title: string;
  desciption: string;
  featuredImage: string;
  variants: ProductVariation[];
}

/**
 * The remote response from the Shopify API
 */
export interface ProductsResponse {
  data: Product[];
}

export interface SingleProductResponse {
  data: Product;
}

/**
 * Extension of the onther interface for brevity
 */
export interface ProductVariation extends ProductPopup{}

/**
 * Used as the variations presented in the popup
 */
export interface ProductPopup {
  id: string;
  title: string;
  featuredImage: string | null;
  price: number;
  description: string;
  quantity: number;
  message?: string;
}
