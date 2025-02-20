import {useLoaderData} from '@remix-run/react';
import {ProductProvider} from '@shopify/hydrogen-react';
import {json} from '@shopify/remix-oxygen';
import {Analytics, AnalyticsPageType} from '@shopify/hydrogen';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import type {ShopifyAnalyticsProduct} from '@shopify/hydrogen';

import {normalizeAdminProduct} from '~/lib/utils';
import {ADMIN_PRODUCT_QUERY} from '~/data/graphql/admin/product';
import {PRODUCT_QUERY} from '~/data/graphql/storefront/product';
import {routeHeaders} from '~/data/cache';
import {useGlobal} from '~/hooks';
import type {ProductWithInitialGrouping} from '~/lib/types';
import {Product} from '~/components';

export const headers = routeHeaders;

/*
 * To add metafields to product object, update the PRODUCT_METAFIELDS_IDENTIFIERS
 * constant under lib/constants/product.ts
 */

export async function loader({params, context, request}: LoaderFunctionArgs) {
  const {handle} = params;
  const {admin, storefront} = context;

  const storeDomain = storefront.getShopifyDomain();
  const searchParams = new URL(request.url).searchParams;
  const selectedOptions: Record<string, any>[] = [];

  // set selected options from the query string
  searchParams.forEach((value, name) => {
    if (name === 'variant' || name === 'srsltid' || name.startsWith('utm_'))
      return;
    selectedOptions.push({name, value});
  });

  let queriedProduct;
  let productStatus;

  const {product: storefrontProduct} = await storefront.query(PRODUCT_QUERY, {
    variables: {
      handle,
      selectedOptions,
      country: storefront.i18n.country,
      language: storefront.i18n.language,
    },
    cache: storefront.CacheShort(),
  });

  queriedProduct = storefrontProduct;
  productStatus = 'ACTIVE';

  // if (!queriedProduct) {
  //   const {productByIdentifier: adminProduct} = await admin.query(
  //     ADMIN_PRODUCT_QUERY,
  //     {variables: {handle}, cache: admin.CacheShort()},
  //   );
  //   if (!adminProduct) return;
  //   queriedProduct = normalizeAdminProduct(adminProduct);
  //   productStatus = adminProduct.status;
  // }

  if (!queriedProduct) throw new Response(null, {status: 404});

  const product = {
    ...queriedProduct,
  } as ProductWithInitialGrouping;

  const selectedVariant = product.selectedVariant ?? product.variants?.nodes[0];

  const productAnalytics: ShopifyAnalyticsProduct = {
    productGid: product.id,
    variantGid: selectedVariant?.id || '',
    name: product.title,
    variantName: selectedVariant?.title || '',
    brand: product.vendor,
    price: selectedVariant?.price?.amount || '',
  };
  const analytics = {
    pageType: AnalyticsPageType.product,
    resourceId: product.id,
    products: [productAnalytics],
    totalValue: Number(selectedVariant?.price?.amount || 0),
  };

  return json({
    analytics,
    product,
    productStatus,
    selectedVariant,
    storeDomain,
    url: request.url,
  });
}

export default function ProductRoute() {
  const {product, selectedVariant: initialSelectedVariant} =
    useLoaderData<typeof loader>();
  const {isCartReady} = useGlobal();

  return (
    <ProductProvider
      data={product}
      initialVariantId={initialSelectedVariant?.id || null}
    >
      <div data-comp={ProductRoute.displayName}>
        <Product
          product={product}
          initialSelectedVariant={initialSelectedVariant}
        />
      </div>

      {isCartReady && (
        <Analytics.ProductView
          data={{
            products: [
              {
                id: product.id,
                title: product.title,
                price: initialSelectedVariant?.price.amount || '0',
                vendor: product.vendor,
                variantId: initialSelectedVariant?.id || '',
                variantTitle: initialSelectedVariant?.title || '',
                quantity: 1,
              },
            ],
          }}
          customData={{product, selectedVariant: initialSelectedVariant}}
        />
      )}
    </ProductProvider>
  );
}

ProductRoute.displayName = 'ProductRoute';
