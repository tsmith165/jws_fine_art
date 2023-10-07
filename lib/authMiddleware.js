import { clerkClient, getAuth } from "@clerk/nextjs/server";

export async function authenticate(req) {
    try {
        const { userId } = getAuth(req);
        const user = userId ? await clerkClient.users.getUser(userId) : null;

        if (!user) {
            console.log("No user token found. Status: 401");
            return false; // Indicating failed authentication
        }

        if (!("publicMetadata" in user)) {
            console.log("User does not have publicMetadata. Status: 403");
            return false;
        }

        if (!("role" in user.publicMetadata)) {
            console.log(`User does not have a role. Status: 403`);
            return false;
        }

        if (user.publicMetadata.role !== "ADMIN") {
            console.log(`User does not have role admin. Status: 403`);
            return false;
        }

        return true; // Authentication successful
    } catch (error) {
        console.error("Error in authentication middleware:", error);
        return false;
    }
}
