import { createContext, useContext, useEffect, useState } from 'react';

const CurrencyContext = createContext(null);

// Fallback rate used if the live-rate fetch fails or is still loading.
// (Approx NGN per 1 USD — update periodically, or rely on the live fetch below.)
const FALLBACK_NGN_PER_USD = 1550;

// Countries that should see Naira directly instead of a converted price.
const NAIRA_COUNTRIES = new Set(['NG']);

export function CurrencyProvider({ children }) {
  const [countryCode, setCountryCode] = useState(null); // e.g. 'NG', 'US'
  const [rate, setRate] = useState(FALLBACK_NGN_PER_USD); // NGN per 1 USD
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function detect() {
      try {
        // Free, no-key IP geolocation. Falls back to Naira display on failure.
        const geoRes = await fetch('https://ipapi.co/json/');
        const geo = await geoRes.json();
        if (!cancelled && geo?.country_code) {
          setCountryCode(geo.country_code);
        }
      } catch {
        // Network/geo lookup failed — default to Naira, no conversion.
        if (!cancelled) setCountryCode('NG');
      }

      try {
        // Free exchange-rate endpoint, no key required.
        const rateRes = await fetch('https://open.er-api.com/v6/latest/USD');
        const rateData = await rateRes.json();
        const ngn = rateData?.rates?.NGN;
        if (!cancelled && ngn) setRate(ngn);
      } catch {
        // Keep FALLBACK_NGN_PER_USD if this fails.
      }

      if (!cancelled) setReady(true);
    }

    detect();
    return () => {
      cancelled = true;
    };
  }, []);

  const showNaira = !countryCode || NAIRA_COUNTRIES.has(countryCode);

  // Always pass the price in Naira (the store's real currency).
  // Returns a formatted string in the visitor's local display currency.
  function formatPrice(nairaAmount) {
    const amount = Number(nairaAmount) || 0;
    if (showNaira) {
      return `₦${amount.toLocaleString('en-NG')}`;
    }
    const usd = amount / rate;
    return `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return (
    <CurrencyContext.Provider value={{ countryCode, showNaira, rate, ready, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider');
  return ctx;
}
