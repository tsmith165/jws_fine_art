export type TaxJurisdiction = 'CA' | 'interstate' | 'international';

export const SALES_TAX_POLICY_VERSION = '2026-07-24';

// Combined rate at the studio (5130 La Jolla Blvd, San Diego, CA 92109):
// 7.25% statewide base + 0.50% San Diego County district tax. Listed prices
// are tax-inclusive, so this rate backs the tax portion out of the total.
// Re-verify each January and July at https://maps.cdtfa.ca.gov/ and update
// docs/PAYMENTS_AND_TAXES.md together with this value.
export const CA_SALES_TAX_RATE_BPS = 775;

const US_STATE_CODES = new Set([
    'AL',
    'AK',
    'AZ',
    'AR',
    'CA',
    'CO',
    'CT',
    'DE',
    'DC',
    'FL',
    'GA',
    'HI',
    'ID',
    'IL',
    'IN',
    'IA',
    'KS',
    'KY',
    'LA',
    'ME',
    'MD',
    'MA',
    'MI',
    'MN',
    'MS',
    'MO',
    'MT',
    'NE',
    'NV',
    'NH',
    'NJ',
    'NM',
    'NY',
    'NC',
    'ND',
    'OH',
    'OK',
    'OR',
    'PA',
    'PR',
    'RI',
    'SC',
    'SD',
    'TN',
    'TX',
    'UT',
    'VT',
    'VA',
    'WA',
    'WV',
    'WI',
    'WY',
]);

const US_STATE_NAMES: Record<string, string> = {
    alabama: 'AL',
    alaska: 'AK',
    arizona: 'AZ',
    arkansas: 'AR',
    california: 'CA',
    colorado: 'CO',
    connecticut: 'CT',
    delaware: 'DE',
    florida: 'FL',
    georgia: 'GA',
    hawaii: 'HI',
    idaho: 'ID',
    illinois: 'IL',
    indiana: 'IN',
    iowa: 'IA',
    kansas: 'KS',
    kentucky: 'KY',
    louisiana: 'LA',
    maine: 'ME',
    maryland: 'MD',
    massachusetts: 'MA',
    michigan: 'MI',
    minnesota: 'MN',
    mississippi: 'MS',
    missouri: 'MO',
    montana: 'MT',
    nebraska: 'NE',
    nevada: 'NV',
    'new hampshire': 'NH',
    'new jersey': 'NJ',
    'new mexico': 'NM',
    'new york': 'NY',
    'north carolina': 'NC',
    'north dakota': 'ND',
    ohio: 'OH',
    oklahoma: 'OK',
    oregon: 'OR',
    pennsylvania: 'PA',
    'rhode island': 'RI',
    'south carolina': 'SC',
    'south dakota': 'SD',
    tennessee: 'TN',
    texas: 'TX',
    utah: 'UT',
    vermont: 'VT',
    virginia: 'VA',
    washington: 'WA',
    'west virginia': 'WV',
    wisconsin: 'WI',
    wyoming: 'WY',
};

export function extractUsStateFromAddress(address: string | null | undefined): string | null {
    if (!address) return null;
    const lower = address.toLowerCase();
    // Longest names first so "West Virginia" never matches as "Virginia".
    const stateNames = Object.entries(US_STATE_NAMES).sort((a, b) => b[0].length - a[0].length);
    for (const [name, code] of stateNames) {
        if (new RegExp(`\\b${name}\\b`).test(lower)) return code;
    }
    // Stripe-formatted locality lines look like "San Diego, CA, 92109"; legacy
    // records commonly use "San Diego, CA 92109". Prefer a code adjacent to a
    // ZIP, then fall back to any standalone state code token.
    const nearZip = address.match(/\b([A-Za-z]{2})[,\s]+\d{5}(?:-\d{4})?\b/);
    if (nearZip && US_STATE_CODES.has(nearZip[1].toUpperCase())) return nearZip[1].toUpperCase();
    // Only trust uppercase standalone tokens ("CA") — lowercase words like
    // "de" or "la" in foreign addresses must not read as state codes.
    const tokens = address.match(/\b[A-Z]{2}\b/g) ?? [];
    for (const token of tokens) {
        if (US_STATE_CODES.has(token)) return token;
    }
    return null;
}

export function classifyTaxJurisdiction(order: {
    deliveryMethod?: 'domestic_shipping' | 'local_pickup' | 'international_quote' | null;
    international: boolean;
    shippingAddress: string | null | undefined;
}): TaxJurisdiction {
    if (order.deliveryMethod === 'international_quote') return 'international';
    if (order.deliveryMethod === 'local_pickup') return 'CA';
    // A parseable U.S. address outranks the legacy `international` flag,
    // which is unreliable on imported orders (real CA sales carried it).
    const state = extractUsStateFromAddress(order.shippingAddress);
    if (state === 'CA') return 'CA';
    if (state) return 'interstate';
    if (order.international) return 'international';
    // Unknown destination: reserve tax rather than under-report it.
    return 'CA';
}

// Listed prices are tax-inclusive, so the CA-taxable portion is backed out of
// the collected total: taxable = total ÷ (1 + rate), tax = total − taxable.
export function taxSetAsideCents(totalCents: number, rateBps: number): number {
    if (!Number.isFinite(totalCents) || totalCents <= 0 || rateBps <= 0) return 0;
    const taxableCents = Math.round(totalCents / (1 + rateBps / 10000));
    return totalCents - taxableCents;
}

export function orderTaxProfile(order: {
    deliveryMethod?: 'domestic_shipping' | 'local_pickup' | 'international_quote' | null;
    international: boolean;
    shippingAddress: string | null | undefined;
    totalCents: number;
}): { taxJurisdiction: TaxJurisdiction; taxRateBps: number; taxSetAsideCents: number } {
    const taxJurisdiction = classifyTaxJurisdiction(order);
    if (taxJurisdiction !== 'CA') return { taxJurisdiction, taxRateBps: 0, taxSetAsideCents: 0 };
    return {
        taxJurisdiction,
        taxRateBps: CA_SALES_TAX_RATE_BPS,
        taxSetAsideCents: taxSetAsideCents(order.totalCents, CA_SALES_TAX_RATE_BPS),
    };
}
