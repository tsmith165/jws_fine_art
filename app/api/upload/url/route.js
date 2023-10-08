import { generate_upload_url } from "@/lib/s3_api_calls";
import { authenticate } from "@/lib/authMiddleware";

export async function POST(req) {
  console.log(`Authenticating...`);

  const isAuthenticated = await authenticate(req);

  // Return early if not authenticated.
  if (!isAuthenticated) {
    return Response.json({ error: "Authentication failed" }, { status: 401 });
  }

  console.log(`Auth Successful. Attempting to get upload URL...`);

  const passed_json = await req.json();

  if (!passed_json) {
    console.error(`Request body is undefined`);
    return Response.json({ error: "Request body is undefined" }, { status: 400 });
  }

  const image_name = passed_json?.image_name;
  const image_type = passed_json?.image_type;
  console.log(`Passed image_name: ${image_name} | image_type: ${image_type}`);

  try {
    const url = await generate_upload_url(image_name, image_type);
    console.log(`Upload URL (Next Line): ${url}`);
    return Response.json({ url });
  } catch (error) {
    console.error(`Error while generating upload URL: ${error.message}`);
    return Response.json({ error: "Failed to generate upload URL." }, { status: 500 });
  }
}
