import { PostHog } from 'posthog-node';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';

const COOKIE_KEY = 'distinct_id';

const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
});

export function getDistinctId(cookieStore: ReturnType<typeof cookies>) {
  const distinctId = cookieStore.get(COOKIE_KEY)?.value;
  return distinctId || uuidv4();
}

export function captureEvent(event: string, properties?: Record<string, any>) {
  const cookieStore = cookies();
  const distinctId = getDistinctId(cookieStore);
  posthog.capture({
    distinctId,
    event,
    properties,
  });
}