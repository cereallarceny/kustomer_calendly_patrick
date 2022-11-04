import pkg from '../package.json';

export const name = pkg.name;
export const version = pkg.version;

export const onCalendlyEvent = 'calendly.event';

export const calendlyInviteeCreated = 'invitee.created';
export const calendlyInviteeCancelled = 'invitee.canceled';
export const calendlyEvents = [
  calendlyInviteeCreated,
  calendlyInviteeCancelled,
];
