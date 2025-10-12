// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn:
    process.env.NODE_ENV === 'production'
      ? 'https://472c1eb8713106ddc86876d1342dd275@o4509958493962240.ingest.de.sentry.io/4510170902233168'
      : undefined,

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 1 : 0,

  // Enable logs to be sent to Sentry
  enableLogs: process.env.NODE_ENV === 'production',

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
