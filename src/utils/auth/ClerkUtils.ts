import { User } from '@clerk/nextjs/dist/types/server';

export async function captureClerkUserOrganizationMemberships(user: User) {
    console.log("Capturing current user's organization memberships...");
    try {
        const response = await fetch(`https://api.clerk.com/v1/users/${user.id}/organization_memberships?limit=100`, {
            headers: {
                Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const memberships = await response.json();

        console.log('MenuOverlay: User Memberships:', memberships.data);
        return memberships;
    } catch (error) {
        console.error('Error fetching organization memberships:', error);
    }
}

export async function isClerkUserAdmin(user: User) {
    let isAdmin = false;
    if (user) {
        const user_organization_memberships = await captureClerkUserOrganizationMemberships(user);
        isAdmin = user_organization_memberships.data.some(
            (membership: any) => membership.organization.name === 'ADMIN' && membership.role === 'admin',
        );
    }
    return isAdmin;
}
