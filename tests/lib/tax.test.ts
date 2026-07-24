import { describe, expect, it } from 'vitest';
import {
    CA_SALES_TAX_RATE_BPS,
    classifyTaxJurisdiction,
    extractUsStateFromAddress,
    orderTaxProfile,
    taxSetAsideCents,
} from '../../shared/tax';

describe('sales tax policy', () => {
    it('extracts states from Stripe-formatted and legacy addresses', () => {
        expect(extractUsStateFromAddress('5130 La Jolla Blvd\nSan Diego, CA, 92109\nUS')).toBe('CA');
        expect(extractUsStateFromAddress('123 Main St, Austin, TX 78701')).toBe('TX');
        expect(extractUsStateFromAddress('9 Ocean Ave\nPortland, Oregon')).toBe('OR');
        expect(extractUsStateFromAddress('12 Rue de Rivoli, Paris')).toBeNull();
        expect(extractUsStateFromAddress('')).toBeNull();
        expect(extractUsStateFromAddress(null)).toBeNull();
    });

    it('classifies pickup and California deliveries as CA taxable', () => {
        expect(classifyTaxJurisdiction({ deliveryMethod: 'local_pickup', international: false, shippingAddress: '' })).toBe('CA');
        expect(
            classifyTaxJurisdiction({
                deliveryMethod: 'domestic_shipping',
                international: false,
                shippingAddress: '1 Market St\nSan Francisco, CA, 94105\nUS',
            }),
        ).toBe('CA');
    });

    it('classifies other-state deliveries as interstate and quotes as international', () => {
        expect(
            classifyTaxJurisdiction({
                deliveryMethod: 'domestic_shipping',
                international: false,
                shippingAddress: '200 5th Ave\nNew York, NY, 10010\nUS',
            }),
        ).toBe('interstate');
        expect(classifyTaxJurisdiction({ deliveryMethod: 'international_quote', international: true, shippingAddress: '' })).toBe(
            'international',
        );
        expect(classifyTaxJurisdiction({ deliveryMethod: null, international: true, shippingAddress: 'Toronto, Canada' })).toBe(
            'international',
        );
    });

    it('lets a parseable U.S. address outrank the legacy international flag', () => {
        expect(
            classifyTaxJurisdiction({ deliveryMethod: null, international: true, shippingAddress: '49329 Escalante indio CA 92201' }),
        ).toBe('CA');
        expect(classifyTaxJurisdiction({ deliveryMethod: null, international: true, shippingAddress: 'Austin, TX 78701' })).toBe(
            'interstate',
        );
    });

    it('reserves tax when the destination state cannot be determined', () => {
        expect(classifyTaxJurisdiction({ deliveryMethod: 'domestic_shipping', international: false, shippingAddress: 'unknown' })).toBe(
            'CA',
        );
    });

    it('backs the tax portion out of a tax-inclusive total', () => {
        expect(taxSetAsideCents(50000, CA_SALES_TAX_RATE_BPS)).toBe(3596);
        expect(taxSetAsideCents(0, CA_SALES_TAX_RATE_BPS)).toBe(0);
        expect(taxSetAsideCents(54500, CA_SALES_TAX_RATE_BPS)).toBe(3920);
    });

    it('produces a zero set-aside profile for exempt orders', () => {
        expect(
            orderTaxProfile({
                deliveryMethod: 'domestic_shipping',
                international: false,
                shippingAddress: 'Denver, CO 80202',
                totalCents: 50000,
            }),
        ).toEqual({ taxJurisdiction: 'interstate', taxRateBps: 0, taxSetAsideCents: 0 });
        expect(orderTaxProfile({ deliveryMethod: 'local_pickup', international: false, shippingAddress: '', totalCents: 50000 })).toEqual({
            taxJurisdiction: 'CA',
            taxRateBps: CA_SALES_TAX_RATE_BPS,
            taxSetAsideCents: 3596,
        });
    });
});
