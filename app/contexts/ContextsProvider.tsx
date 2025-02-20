import type {ReactNode} from 'react';

import {AnalyticsProvider} from './AnalyticsProvider';
import {GlobalProvider} from './GlobalProvider/GlobalProvider';
import {MenuProvider} from './MenuProvider/MenuProvider';

export function ContextsProvider({children}: {children: ReactNode}) {
  return (
    <GlobalProvider>
      <MenuProvider>
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </MenuProvider>
    </GlobalProvider>
  );
}
