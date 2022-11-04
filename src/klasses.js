import { getInviteId } from './_helpers.js';

export const event = {
  name: 'event',
  schema: {
    icon: 'calendar',
    color: '#3e9cf0',
    metadata: {
      properties: {
        canceledStr: {
          displayName: 'Canceled',
        },
        cancelReasonStr: {
          displayName: 'Cancel reason',
        },
        canceledDateStr: {
          displayName: 'Canceled date',
        },
        eventDescriptionStr: {
          displayName: 'Event description',
        },
        eventDurationNum: {
          displayName: 'Event duration',
        },
        eventLocationStr: {
          displayName: 'Event location',
        },
        eventNameStr: {
          displayName: 'Event name',
        },
        eventTypeStr: {
          displayName: 'Event type',
        },
        startTimeAt: {
          displayName: 'Start time',
        },
        endTimeAt: {
          displayName: 'End time',
        },
      },
    },
  },
  mapKObject: (event) => ({
    custom: {
      canceledStr: event.status === 'canceled' ? 'Yes' : 'No',
      cancelReasonStr: event.canceledReason || 'N/A',
      canceledDateStr:
        event.status === 'canceled' ? event.eventUpdatedAt : 'N/A',
      eventDescriptionStr: event.eventDescription,
      eventDurationNum: event.eventDuration,
      eventLocationStr: event.eventLocation,
      eventNameStr: event.eventName,
      eventTypeStr: event.eventType,
      startTimeAt: event.eventStartTime,
      endTimeAt: event.eventEndTime,
    },
    data: { payload: event },
    title: event.eventName,
    externalId: getInviteId(event.uri),
  }),
};
