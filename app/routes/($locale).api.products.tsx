import {json} from '@shopify/remix-oxygen';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import type {
  Product,
  ProductSortKeys,
} from '@shopify/hydrogen/storefront-api-types';

import {PRODUCTS_QUERY} from '~/data/graphql/storefront/product';
import {ADMIN_PRODUCT_ITEM_BY_ID_QUERY} from '~/data/graphql/admin/product';
import {normalizeAdminProduct} from '~/lib/utils';
import {queryProducts} from '~/lib/products.server';

// Docs: https://shopify.dev/docs/api/storefront/latest/queries/products

export async function loader({request, context}: LoaderFunctionArgs) {
  const {admin} = context;
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);

  /* Products query by query */
  const query = String(searchParams.get('query') || '');
  const sortKey = String(
    (searchParams.get('sortKey') as null | ProductSortKeys) ?? 'BEST_SELLING',
  );
  const reverse = Boolean(searchParams.get('reverse') || false);
  const count = Number(searchParams.get('count')) || 10;

  const {products} = await queryProducts({
    context,
    query: PRODUCTS_QUERY,
    variables: {query, reverse, sortKey},
    count,
  });

  let queryIds = query.split(' OR ');
  queryIds = reverse ? [...queryIds].reverse() : queryIds;

  // if (products?.length !== queryIds.length) {
  //   const productsById = products?.reduce((acc, product) => {
  //     const id = product.id?.split('/').pop();
  //     if (id) {
  //       acc[id] = product;
  //     }
  //     return acc;
  //   }, {} as Record<string, Product>);
  //   const productsWithDrafts = await Promise.all(
  //     queryIds.map(async (queryId) => {
  //       const id = queryId.replace('id:', '');
  //       if (productsById?.[id]) return productsById[id];
  //       const {productByIdentifier: adminProduct} = await admin.query(
  //         ADMIN_PRODUCT_ITEM_BY_ID_QUERY,
  //         {
  //           variables: {id: `gid://shopify/Product/${id}`},
  //           cache: admin.CacheShort(),
  //         },
  //       );
  //       if (!adminProduct) return null;
  //       return normalizeAdminProduct(adminProduct);
  //     }),
  //   );
  //   products = productsWithDrafts.filter(Boolean) as Product[];
  // }

  return json({totalProducts: products?.length ?? 0, products});
}

// export async function loader({request, context}) {
//   //
// }
