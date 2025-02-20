import {json} from '@shopify/remix-oxygen';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {AnalyticsPageType} from '@shopify/hydrogen';

import {ProductsSliderDemo} from '~/components';
import {PRODUCTS_QUERY} from '~/data/graphql';
import {routeHeaders} from '~/data/cache';
import {queryProducts} from '~/lib/products.server';

export const headers = routeHeaders;

export async function loader({context, params, request}: LoaderFunctionArgs) {
  const {language, country} = context.storefront.i18n;

  if (
    params.locale &&
    params.locale.toLowerCase() !== `${language}-${country}`.toLowerCase()
  ) {
    // If the locale URL param is defined, yet we still are on `EN-US`
    // the the locale param must be invalid, send to the 404 page
    throw new Response(null, {status: 404});
  }

  const {products} = await queryProducts({
    context,
    query: PRODUCTS_QUERY,
    variables: {query: '', sortKey: 'BEST_SELLING'},
    count: 8,
  });

  const analytics = {pageType: AnalyticsPageType.home};

  return json({
    analytics,
    products,
    url: request.url,
  });
}

export default function Index() {
  return (
    <div>
      <ProductsSliderDemo />
    </div>
  );
}
