import { KApp } from '@kustomer/apps-server-sdk';
import * as dotenv from 'dotenv';

import changelog from './changelog.json';

import { name, version } from './src/_constants.js';
import { settings } from './src/settings.js';
import { klasses } from './src/klasses.js';
import { i18n } from './src/i18n.js';
import { Calendly } from './src/Calendly';

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
  visibility: 'private', // NOTE: For some reason, I can't do a public app?
  description: 'This is the description for **Calendly App Tutorial**',
  dependencies: ['kustomer-^1.5.0'],
  default: false,
  system: false,
  url: process.env.BASE_URL,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  iconUrl: `${process.env.BASE_URL}/assets/images/icon.png`,
  env: 'prod', // NOTE: I set this as "qa" when creating the repo... but I can't start the server if this isn't "prod" 🧐
  changelog,
  roles: [
    'org.user.customer.read',
    'org.user.customer.write',
    'org.user.message.read',
    'org.permission.customer.read',
    'org.permission.customer.create',
    'org.permission.customer.update',
    'org.permission.message.read',
  ],
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

// Create a variable to hold the Calendly API
let calendly;

// When the user installs the Kustomer app
app.onInstall = async (_user, org) => {
  try {
    app.log.info('Installed app, registering Calendly webhooks');

    // Register the webhooks we need with the calendly API
    await Calendly.registerWebhooks(org);
  } catch (e) {
    app.log.error(JSON.stringify(e, undefined, 2));
  }
};

// For each Klass we need to create, instantiate it
klasses.forEach(({ name, mapKObject, ...k }) => app.useKlass(name, k));

// TODO: Create the view

(async () => {
  try {
    // Start the app
    await app.start({ port: +(process.env.PORT || 3000) });

    // Get the settings for the app by app name
    const allSettings = await app.in(name).settings.get();

    // Create an instance of the Calendly API
    calendly = new Calendly(allSettings?.default.authToken, app);

    // Set up the hook to listen to Calendly, when fired it will call the event handler
    app.onHook(SUBSCRIPTION_EVENT, handlers.onSubscriptionEvent(app, calendly));
  } catch (e) {
    app.log.error(JSON.stringify(e, undefined, 2));
  }
})();
