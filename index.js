import fs from 'fs';
import { KApp, ROLES } from '@kustomer/apps-server-sdk';
import * as dotenv from 'dotenv';

import changelog from './changelog.json';

import { name, version, onCalendlyEvent } from './src/_constants.js';
import { settings } from './src/settings.js';
import { i18n } from './src/i18n.js';
import { event } from './src/klasses.js';
import { handleCalendlyEvent } from './src/handlers.js';
import { Calendly } from './src/Calendly.js';

// Register dotenv
dotenv.config();

// Check for the existence of a baseUrl
if (!process.env.BASE_URL) {
  throw new Error('baseUrl is required');
}

// Check for the existence of proper auth tokens
if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
  throw new Error('clientId and clientSecret are required');
}

// Create the Kustomer app
const app = new KApp({
  app: name,
  version,
  title: 'Kustomer Calendly Patrick',
  visibility: 'private',
  description: 'This is the description for **Calendly App Tutorial**',
  dependencies: ['kustomer-^1.5.0'],
  default: false,
  system: false,
  url: process.env.BASE_URL,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  iconUrl: `${process.env.BASE_URL}/assets/icon.png`,
  env: 'prod',
  changelog,
  roles: ROLES.common,
  appDetails: {
    appDeveloper: {
      name: 'Kustomer',
      website: 'https://kustomer.com',
      supportEmail: 'support@kustomer.com',
    },
    externalPlatform: {
      name: 'Calendly',
      website: 'https://calendly.com',
    },
  },
  screenshots: [],
  settings,
  i18n,
});

// When the user installs the Kustomer app
app.onInstall = async (_user, org) => {
  try {
    app.log.info('Installed app, registering Calendly webhooks');

    // Get the settings
    const allSettings = await app.org(org).settings.get();

    // Create an instance of the Calendly API
    const calendly = new Calendly(allSettings?.default.authToken, app);

    // Register the webhooks we need with the calendly API
    await calendly.registerWebhooks(org);

    // Set up the hook to listen to Calendly, when fired it will call the event handler
    app.onHook(onCalendlyEvent, handleCalendlyEvent(app, calendly));
  } catch (e) {
    app.log.error(e);
  }
};

// Create the event klass
app.useKlass(event.name, event.schema);

// Create the event view
app.useView(
  'event-view',
  fs.readFileSync('./src/eventView.jsx', { encoding: 'utf-8' }),
  {
    resource: 'kobject',
    context: 'expanded-timeline',
    displayName: 'Calendly Event',
    icon: 'calendar',
    state: 'open',
    klass: event.name,
  }
);

(async () => {
  try {
    // Start the app
    await app.start({ port: +(process.env.PORT || 3000) });
  } catch (e) {
    app.log.error(e);
  }
})();
