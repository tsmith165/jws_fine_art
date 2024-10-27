import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

const COOKIE_KEY = 'distinct_id';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  let distinctId = cookieStore.get(COOKIE_KEY)?.value;

  if (!distinctId) {
    distinctId = uuidv4();
    cookieStore.set(COOKIE_KEY, distinctId, { maxAge: 60 * 60 * 24 * 365, path: '/' });
  }

  return NextResponse.json({ distinctId });
}