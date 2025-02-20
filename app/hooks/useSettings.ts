import type {Settings} from '~/lib/types';

/**
 * Hook for getting settings from Pack's useSiteSettings hook, with a fallback to settings set in the global context provider to be used within error boundaries
 * @returns settings from site settings
 *  * @example
 * ```js
 * const settings = useSettings();
 * // or destructure
 * const {header} = useSettings();
 * ```
 */

export function useSettings(): Settings {
  return {};
}
