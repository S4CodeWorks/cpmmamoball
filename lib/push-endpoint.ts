/** Only standard browser push services may receive server-side Web Push requests. */
export function isTrustedPushEndpoint(endpoint: string): boolean {
  if (endpoint.length > 4096) return false;
  try {
    const url = new URL(endpoint);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port
      && url.pathname !== '/' && (
        ['fcm.googleapis.com', 'updates.push.services.mozilla.com', 'web.push.apple.com'].includes(url.hostname)
        || /^[a-z0-9-]+\.notify\.windows\.com$/.test(url.hostname)
      );
  } catch {
    return false;
  }
}
