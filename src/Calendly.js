import fetch from 'node-fetch';
import { onCalendlyEvent, calendlyEvents } from './_constants.js';

export class Calendly {
  // Store the baseUrl, token, and Kustomer app here
  baseUrl = 'https://api.calendly.com';
  token;
  app;

  constructor(token, app) {
    this.token = token;
    this.app = app;
  }

  // Get the standard headers for all requests
  get headers() {
    return {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    };
  }

  // Construct the Kustomer webhook URL based on the orgId given by the Kustomer install process
  webhookUrl(orgId) {
    return `${this.app.manifest.url}/orgs/${orgId}/hooks/${onCalendlyEvent}`;
  }

  // Get the current user of the Calendly account
  async getCurrentUser() {
    const res = await fetch(`${this.baseUrl}/users/me`, this.headers).then(
      (r) => r.json()
    );

    return res?.data?.resource;
  }

  // Get an event from the Calendly API
  async getEventResource(url) {
    const res = await fetch(url, this.headers).then((r) => r.json());

    return res?.data?.resource;
  }

  // Get the events that haven't already been registered in Calendly as webhooks
  async getEventsNotAlreadyRegistered(orgId) {
    const { collection } = await this.getWebhooks();

    if (!collection || !collection.length) return calendlyEvents;

    return calendlyEvents.filter((event) => {
      return !collection.find((webhook) => {
        return (
          webhook.events.includes(event) &&
          webhook.callback_url === this.webhookUrl(orgId)
        );
      });
    });
  }

  // Get all Calendly webhooks
  async getWebhooks() {
    const user = await this.getCurrentUser();
    const res = await fetch(
      `${this.baseUrl}/webhook_subscriptions?scope=organization&organization=${user.current_organization}`,
      this.headers
    ).then((r) => r.json());

    return res?.data;
  }

  // Create a given set of webhooks in Calendly
  async createWebhooks(orgId) {
    const user = await this.getCurrentUser();

    const payload = {
      url: this.webhookUrl(orgId),
      events: calendlyEvents,
      organization: user?.current_organization,
      scope: 'organization',
    };

    const res = await fetch(`${this.baseUrl}/webhook_subscriptions`, {
      body: payload,
      ...this.headers,
    }).then((r) => r.json());

    return res?.data?.resource;
  }

  // Register the webhooks we need with the calendly API
  async registerWebhooks(orgId) {
    const events = await this.getEventsNotAlreadyRegistered(orgId);

    if (!events.length) {
      this.app.log.info('Events already registered');
      return [];
    }

    return this.createWebhooks(orgId);
  }
}
