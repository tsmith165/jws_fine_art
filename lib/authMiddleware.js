import { clerkClient, getAuth } from "@clerk/nextjs/server";

export async function authenticate(req, res, next) {
  try {
    const { userId } = getAuth(req);
    const user = userId ? await clerkClient.users.getUser(userId) : null;

    if (!user) {
      console.log("No user token found. Status: 401");
      res.status(401).end();
      return;
    }

    if (!("publicMetadata" in user)) {
      console.log("User does not have publicMetadata. Status: 403");
      res.status(403).end();
      return;
    }

    if (!("role" in user.publicMetadata)) {
      console.log(`User does not have a role. Status: 403`);
      res.status(403).end();
      return;
    }

    if (user.publicMetadata.role !== "ADMIN") {
      console.log(`User does not have role admin. Status: 403`);
      res.status(403).end();
      return;
    }

    // If the user is authenticated and authorized, proceed to the next middleware
    next();
  } catch (error) {
    console.error("Error in authentication middleware:", error);
    res.status(500).end();
  }
}