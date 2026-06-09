import type { ReactPayPalScriptOptions } from "@paypal/react-paypal-js";

let currencyApplied = false;

/** PayPal breaks if every pricing card calls resetOptions — run once per page load. */
export function applyPayPalCurrencyOnce(
  dispatch: (action: { type: "resetOptions"; value: ReactPayPalScriptOptions }) => void,
  options: ReactPayPalScriptOptions,
  currency: string
) {
  if (currencyApplied || currency === "USD" || options.currency === currency) return;
  currencyApplied = true;
  dispatch({
    type: "resetOptions",
    value: { ...options, currency },
  });
}
