import '../../src/lib/config';

type JwtTemplate = { id: string; name: string };
type ClerkOrganization = { id: string; name: string };
type ClerkMembership = {
    role: string;
    permissions: string[];
    public_user_data?: { user_id?: string } | null;
};
type ClerkUser = { id: string; public_metadata?: Record<string, unknown> };

function unwrapList<T>(value: T[] | { data: T[] }): T[] {
    return Array.isArray(value) ? value : value.data;
}

function clerkIssuerFromPublishableKey(key: string): string {
    const encoded = key.replace(/^pk_(test|live)_/, '');
    const decoded = Buffer.from(encoded, 'base64').toString('utf8').replace(/\$$/, '');
    if (!decoded.includes('.')) throw new Error('Unable to derive the Clerk issuer domain from the publishable key.');
    return `https://${decoded}`;
}

const secretKey = process.env.CLERK_SECRET_KEY;
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (!secretKey || !publishableKey) throw new Error('Clerk secret and publishable keys are required.');

const issuer = clerkIssuerFromPublishableKey(publishableKey);
const headers = { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' };
const organizationsResponse = await fetch('https://api.clerk.com/v1/organizations?query=ADMIN&limit=100', { headers });
if (!organizationsResponse.ok) throw new Error(`Unable to list Clerk organizations (${organizationsResponse.status}).`);
const organizations = unwrapList((await organizationsResponse.json()) as ClerkOrganization[] | { data: ClerkOrganization[] });
const ownerOrganization = organizations.find((organization) => organization.name === 'ADMIN');
if (!ownerOrganization) throw new Error('The existing ADMIN organization could not be found in Clerk.');
const membershipsResponse = await fetch(`https://api.clerk.com/v1/organizations/${ownerOrganization.id}/memberships?limit=100`, {
    headers,
});
if (!membershipsResponse.ok) throw new Error(`Unable to list Clerk owner memberships (${membershipsResponse.status}).`);
const memberships = unwrapList((await membershipsResponse.json()) as ClerkMembership[] | { data: ClerkMembership[] });
const ownerUserIds = memberships
    .filter((membership) => membership.role === 'org:admin' || membership.permissions.includes('org:sys_domains:manage'))
    .map((membership) => membership.public_user_data?.user_id)
    .filter((userId): userId is string => Boolean(userId));
if (ownerUserIds.length === 0) throw new Error('The ADMIN organization has no qualifying owner memberships.');
for (const userId of ownerUserIds) {
    const userResponse = await fetch(`https://api.clerk.com/v1/users/${userId}`, { headers });
    if (!userResponse.ok) throw new Error(`Unable to read a Clerk owner (${userResponse.status}).`);
    const user = (await userResponse.json()) as ClerkUser;
    if (user.public_metadata?.role === 'ADMIN') continue;
    const metadataResponse = await fetch(`https://api.clerk.com/v1/users/${userId}/metadata`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ public_metadata: { ...user.public_metadata, role: 'ADMIN' } }),
    });
    if (!metadataResponse.ok) throw new Error(`Unable to synchronize the Clerk owner role (${metadataResponse.status}).`);
}
const listResponse = await fetch('https://api.clerk.com/v1/jwt_templates?limit=100', { headers });
if (!listResponse.ok) throw new Error(`Unable to list Clerk JWT templates (${listResponse.status}).`);
const templateResponse = (await listResponse.json()) as JwtTemplate[] | { data: JwtTemplate[] };
const templates = unwrapList(templateResponse);
const existing = templates.find((template) => template.name === 'convex');
const body = JSON.stringify({
    name: 'convex',
    lifetime: 60,
    allowed_clock_skew: 5,
    claims: { aud: 'convex', owner_role: '{{user.public_metadata.role}}' },
});
const response = await fetch(
    existing ? `https://api.clerk.com/v1/jwt_templates/${existing.id}` : 'https://api.clerk.com/v1/jwt_templates',
    {
        method: existing ? 'PATCH' : 'POST',
        headers,
        body,
    },
);
if (!response.ok) throw new Error(`Unable to ${existing ? 'update' : 'create'} the Clerk Convex JWT template (${response.status}).`);
console.log(JSON.stringify({ configured: true, action: existing ? 'updated' : 'created', issuer, ownerRoleCount: ownerUserIds.length }));
