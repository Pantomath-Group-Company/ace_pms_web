import { useCmsStrategyNav } from './cms/store';
import { formatAsOn } from './cms/navParser';

// The "figures as on" date shown across disclaimers. It tracks the latest month
// of the uploaded NAV series (the newest data on the site); before anything is
// uploaded it stays at the committed default so nothing changes.
const DEFAULT_AS_ON = '31 July 2026';

export function useAsOnDate(): string {
  const navs = useCmsStrategyNav();
  if (!navs.length) return DEFAULT_AS_ON;
  const latest = navs.reduce((m, n) => (n.asOf > m ? n.asOf : m), navs[0].asOf);
  return formatAsOn(latest); // e.g. "31 Aug 2026"
}

/** Replace the "as on <date>" inside a disclaimer string with the live date. */
export function applyAsOn(text: string, asOn: string): string {
  return text.replace(/as on\s+\d{1,2}\s+[A-Za-z]+\s+\d{4}/gi, `as on ${asOn}`);
}
