export const getInviteId = (uri) =>
  uri?.replace(
    /https:\/\/api.calendly\.com\/scheduled_events\/.*\/invitees\//,
    ''
  );
