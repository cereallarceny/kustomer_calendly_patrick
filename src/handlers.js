import { event as eventKlass } from './klasses.js';

const createEventKobject = async (customers, event) => {
  // Get the customer by email from Kustomer
  let customer = await customers.getByEmail(event.calendly.email);

  // Create a new kobject based on the calendly metadata
  const kobject = eventKlass.mapKObject(event.calendly);

  // If we already have a customer, create their kobject and get out
  if (customer) {
    await customers.createKObject(customer.id, eventKlass.name, kobject);
    return;
  }

  // Otherwise, create the customer in Kustomer
  customer = await customers.create({
    name: event.calendly.name,
    emails: [{ email: event.calendly.email }],
  });

  // And then create their kobject
  await customers.createKObject(customer.id, eventKlass.name, kobject);
};

const updateEventKobject = async (kobjects, event) => {
  // Create a kobject based on the calendly metadata
  const kobject = eventKlass.mapKObject(event.calendly);

  // Update it in Kustomer
  await kobjects.update(event.kobject.id, eventKlass.name, kobject);
};

export const handleCalendlyEvent =
  (app, calendly) => async (org, _query, _headers, body) => {
    try {
      // Get the event resource
      const { event_type, name, start_time, end_time } =
        await calendly.getEventResource(
          body.payload.uri.match(/.+?(?=\/invitee)/)[0]
        );

      // Get the event type resource
      const { type, description_plain, duration } =
        await calendly.getEventResource(event_type);

      // Get the org object from the organization name
      const Org = app.in(org);

      // Get the kobject for this event
      const kobject = await Org.kobjects.getByExternalId(
        body.payload.uri,
        eventKlass.name
      );

      // Create the event to be stored in Kustomer with custom Calendly metadata
      const event = {
        kobject,
        calendly: {
          ...body.payload,
          eventType: type,
          eventName: name,
          eventDescription: description_plain,
          eventDuration: duration,
          eventStartTime: start_time,
          eventEndTime: end_time,
          status: body.payload.status,
          qAndA: body.payload?.questions_and_answers,
          eventUpdatedAt: body.payload.updated_at,
          canceledReason: body.payload?.cancellation?.reason,
          eventLocation: body.payload?.location?.location,
        },
      };

      // If the kobject already exists, update it
      if (kobject) {
        return await updateEventKobject(Org.kobjects, event);
      }

      // Otherwise, create it
      return await createEventKobject(Org.customers, event);
    } catch (e) {
      app.log.error('Failed to handle Calendly event', e);
    }
  };
