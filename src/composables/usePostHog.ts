import posthog from 'posthog-js'

export function usePostHog() {
  // Initialize PostHog
  posthog.init('phc_chCJaExbWBFBxhVOXmLWLbQqBcupesLCbhxSDYV1nFT', {
    api_host: 'https://eu.i.posthog.com',
    person_profiles: 'identified_only',
    opt_out_capturing_by_default: false, // Track by default until user decides
  })

  // Check for existing consent
  const analyticsConsent = localStorage.getItem('analytics-consent')
  if (analyticsConsent === 'declined') {
    posthog.opt_out_capturing()
  } else if (analyticsConsent === 'accepted') {
    posthog.opt_in_capturing()
  }
  // If no choice made yet, tracking is enabled by default

  return { posthog }
}