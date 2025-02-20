import type {AspectRatio, MetafieldIdentifier} from '../types';

/*
 * Add metafield identifiers to the PRODUCT_METAFIELDS_IDENTIFIERS array to fetch desired metafields for products
 * e.g. [{namespace: 'global', key: 'description'}, {namespace: 'product', key: 'seasonal_colors'}]
 * If namespace is omitted, the app-reserved namespace will be used.
 */
export const PRODUCT_METAFIELDS_IDENTIFIERS = [
  {namespace: 'custom', key: 'care'},
  // {namespace: 'material', key: 'shirts'}, // <-- While localhost is running, comment this in to observe HMR error
  // {namespace: 'custom', key: 'color'}, // Additional lines to comment to debug
  // {namespace: 'custom', key: 'size'},
] as MetafieldIdentifier[];

/* Ensure updating this ratio as needed. Required format is 'width/height' */
export const PRODUCT_IMAGE_ASPECT_RATIO: AspectRatio =
  '3/4'; /* Ensure this is equivalent to product-image-aspect-ratio in app.css */
