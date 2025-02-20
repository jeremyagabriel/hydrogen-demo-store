import type {ReactNode} from 'react';

import {Analytics, Modal} from '~/components';
import {
  useCartAddDiscountUrl,
  useScrollToHashOnNavigation,
  useSetViewportHeightCssVar,
} from '~/hooks';

export function Layout({children}: {children: ReactNode}) {
  useCartAddDiscountUrl();
  useScrollToHashOnNavigation();
  useSetViewportHeightCssVar();

  return (
    <>
      <Analytics />

      <div
        className="flex h-[var(--viewport-height)] flex-col"
        data-comp={Layout.displayName}
      >
        <main role="main" id="mainContent" className={`grow`}>
          {children}
        </main>

        <Modal />
      </div>
    </>
  );
}

Layout.displayName = 'Layout';
