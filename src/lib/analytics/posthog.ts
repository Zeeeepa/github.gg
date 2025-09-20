import posthog from 'posthog-js';

// Check if we're in a browser environment
const isClient = typeof window !== 'undefined' && typeof self !== 'undefined';

// Check if PostHog is properly configured
const isPostHogConfigured = () => {
  return process.env.NEXT_PUBLIC_POSTHOG_KEY && 
         process.env.NEXT_PUBLIC_POSTHOG_KEY !== 'undefined' &&
         process.env.NEXT_PUBLIC_POSTHOG_KEY !== '';
};

// Initialize PostHog with development fallbacks
export const initializePostHog = () => {
  // Only initialize on the client side
  if (!isClient) {
    console.log('📊 PostHog: Skipping initialization on server side');
    return null;
  }

  if (!isPostHogConfigured()) {
    console.log('📊 PostHog not configured - running in development mode without analytics');
    return null;
  }

  try {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: true,
      loaded: (ph) => {
        if (process.env.NODE_ENV === 'development') {
          ph.debug();
          console.log('📊 PostHog initialized in development mode');
        }
      }
    });
    return posthog;
  } catch (error) {
    console.error('Failed to initialize PostHog:', error);
    return null;
  }
};

// Safe PostHog wrapper functions
export const safePostHog = {
  capture: (event: string, properties?: Record<string, unknown>) => {
    if (isClient && posthog && isPostHogConfigured()) {
      posthog.capture(event, properties);
    } else if (process.env.NODE_ENV === 'development') {
      console.log('📊 [DEV] PostHog Event:', event, properties);
    }
  },

  identify: (distinctId: string, properties?: Record<string, unknown>) => {
    if (isClient && posthog && isPostHogConfigured()) {
      posthog.identify(distinctId, properties);
    } else if (process.env.NODE_ENV === 'development') {
      console.log('📊 [DEV] PostHog Identify:', distinctId, properties);
    }
  },

  reset: () => {
    if (isClient && posthog && isPostHogConfigured()) {
      posthog.reset();
    } else if (process.env.NODE_ENV === 'development') {
      console.log('📊 [DEV] PostHog Reset');
    }
  },

  isFeatureEnabled: (flag: string) => {
    if (isClient && posthog && isPostHogConfigured()) {
      return posthog.isFeatureEnabled(flag);
    }
    // In development without PostHog, return false for feature flags
    return false;
  }
};

// Export the initialized instance - only initialize on client side
export const posthogInstance = isClient ? initializePostHog() : null; 