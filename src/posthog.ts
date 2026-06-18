import posthog from 'posthog-js'

let initialized = false

function ensurePostHog() {
  if (initialized) return posthog

  const apiKey = process.env.POSTHOG_API_KEY
  if (!apiKey) {
    console.warn('[posthog] POSTHOG_API_KEY not set — analytics disabled')
    return null
  }

  posthog.init(apiKey, {
    api_host: process.env.POSTHOG_HOST || 'https://us.i.posthog.com',
    capture_pageview: false,
    autocapture: false,
    persistence: 'localStorage'
  })
  initialized = true
  return posthog
}

export function identifyUser(distinctId: string) {
  ensurePostHog()?.identify(distinctId)
}

export function captureEvent(
  event: string,
  properties?: Record<string, unknown>
) {
  ensurePostHog()?.capture(event, properties)
}
