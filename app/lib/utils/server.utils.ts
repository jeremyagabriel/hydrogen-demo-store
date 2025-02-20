import type {AppLoadContext} from '@shopify/remix-oxygen';
import type {Metafield} from '@shopify/hydrogen/storefront-api-types';

import {LAYOUT_QUERY} from '~/data/graphql/storefront/shop';
import {PRODUCT_METAFIELDS_IDENTIFIERS} from '~/lib/constants';
import type {MetafieldIdentifier, Seo} from '~/lib/types';

import {parseMetafieldsFromProduct} from './product.utils';

export const getShop = async (context: AppLoadContext) => {
  const layout = await context.storefront.query(LAYOUT_QUERY, {
    cache: context.storefront.CacheShort(),
  });
  return layout.shop;
};

export const getPrimaryDomain = ({
  context,
  request,
}: {
  context: AppLoadContext;
  request?: Request;
}) => {
  const PRIMARY_DOMAIN = context.env.PRIMARY_DOMAIN;
  let primaryDomainOrigin = '';
  if (PRIMARY_DOMAIN) {
    try {
      primaryDomainOrigin = new URL(PRIMARY_DOMAIN).origin;
    } catch (error) {}
  }
  if (!primaryDomainOrigin && request) {
    primaryDomainOrigin = new URL(request.url).origin;
  }
  return primaryDomainOrigin;
};

export const getPublicEnvs = async ({
  context,
  request,
}: {
  context: AppLoadContext;
  request?: Request;
}): Promise<Record<string, string>> => {
  const PRIMARY_DOMAIN = getPrimaryDomain({context, request});

  const publicEnvs = Object.entries({...context.env}).reduce(
    (acc: any, [key, value]) => {
      if (key.startsWith('PUBLIC_')) acc[key] = value;
      return acc;
    },
    {},
  );

  return {...publicEnvs, PRIMARY_DOMAIN};
};

export const getMetafieldsQueryString = (
  identifiers: MetafieldIdentifier[] = [],
) => {
  const identifiersString = JSON.stringify(identifiers)
    .replaceAll('"namespace"', 'namespace')
    .replaceAll('"key"', 'key');
  return `
    metafields(identifiers: ${identifiersString}) {
      createdAt
      description
      id
      key
      namespace
      type
      updatedAt
      value
      references(first: 10) {
        nodes {
          ... on Metaobject {
            fields {
              key
              type
              value
            }
          }
        }
      }
    }`;
};

/* Update both metafields query strings together, one for Storefront API and Admin API. */

export const getAdminMetafieldsQueryString = (
  identifiers: MetafieldIdentifier[] = [],
) => {
  const identifiersString = JSON.stringify(identifiers)
    .replaceAll('"namespace"', 'namespace')
    .replaceAll('"key"', 'key');
  return `
    metafields(identifiers: ${identifiersString}) {
      createdAt
      description
      id
      key
      namespace
      type
      updatedAt
      value
      references(first: 10) {
        nodes {
          ... on Metaobject {
            fields {
              key
              type
              value
            }
          }
        }
      }
    }`;
};

export const PRODUCTS_METAFIELDS_QUERY_STRING = getMetafieldsQueryString(
  PRODUCT_METAFIELDS_IDENTIFIERS,
);

/* Metafields graphql query with Admin API for draft products */
export const ADMIN_PRODUCTS_METAFIELDS_QUERY_STRING = `
  metafields(first: 50) {
    nodes {
      createdAt
      description
      id
      key
      namespace
      type
      updatedAt
      value
      references(first: 10) {
        nodes {
          ... on Metaobject {
            fields {
              key
              type
              value
            }
          }
        }
      }
    }
  }`;

export const getMetafields = async (
  context: AppLoadContext,
  {
    handle,
    isDraftProduct,
    identifiers,
  }: {
    handle: string | undefined;
    isDraftProduct?: boolean;
    identifiers: MetafieldIdentifier[];
  },
): Promise<Record<string, Metafield | null> | null> => {
  const {admin, storefront} = context;

  if (!handle || !identifiers?.length) return null;

  let metafields;

  const PRODUCT_METAFIELDS_QUERY = `#graphql
  query ProductMetafields(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ${getMetafieldsQueryString(identifiers)}
    }
  }
`;

  const {product: storefrontProduct} = await storefront.query(
    PRODUCT_METAFIELDS_QUERY,
    {
      variables: {
        handle,
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      },
      cache: storefront.CacheShort(),
    },
  );

  if (!storefrontProduct) return {};

  metafields = parseMetafieldsFromProduct({
    product: storefrontProduct,
    identifiers,
  });

  // if (isDraftProduct) {
  //   const ADMIN_PRODUCT_METAFIELDS_QUERY = `
  //     query AdminProductMetafields(
  //       $handle: String!
  //     ) {
  //       productByIdentifier(identifier: {handle: $handle}) {
  //         ${ADMIN_PRODUCTS_METAFIELDS_QUERY_STRING}
  //       }
  //     }
  //   `;

  //   const {productByIdentifier: adminProduct} = await admin.query(
  //     ADMIN_PRODUCT_METAFIELDS_QUERY,
  //     {
  //       variables: {
  //         handle,
  //       },
  //       cache: admin.CacheShort(),
  //     },
  //   );

  //   if (!adminProduct) return {};

  //   metafields = parseMetafieldsFromProduct({
  //     product: {...adminProduct, metafields: adminProduct.metafields?.nodes},
  //     identifiers,
  //   });
  // } else {
  //   const PRODUCT_METAFIELDS_QUERY = `#graphql
  //     query ProductMetafields(
  //       $handle: String!
  //       $country: CountryCode
  //       $language: LanguageCode
  //     ) @inContext(country: $country, language: $language) {
  //       product(handle: $handle) {
  //         ${getMetafieldsQueryString(identifiers)}
  //       }
  //     }
  //   `;

  //   const {product: storefrontProduct} = await storefront.query(
  //     PRODUCT_METAFIELDS_QUERY,
  //     {
  //       variables: {
  //         handle,
  //         country: storefront.i18n.country,
  //         language: storefront.i18n.language,
  //       },
  //       cache: storefront.CacheShort(),
  //     },
  //   );

  //   if (!storefrontProduct) return {};

  //   metafields = parseMetafieldsFromProduct({
  //     product: storefrontProduct,
  //     identifiers,
  //   });
  // }

  return metafields;
};
