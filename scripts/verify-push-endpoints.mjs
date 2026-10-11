import assert from 'node:assert/strict';
import { isTrustedPushEndpoint } from '../lib/push-endpoint.ts';

const cases = [
  ['https://fcm.googleapis.com/push/token', true],
  ['https://updates.push.services.mozilla.com/wpush/v2/token', true],
  ['https://web.push.apple.com/token', true],
  ['https://wns.notify.windows.com/token', true],
  ['https://127.0.0.1/private', false],
  ['http://fcm.googleapis.com/token', false],
  ['https://fcm.googleapis.com.attacker.test/token', false],
  ['https://user:pass@fcm.googleapis.com/token', false],
  ['https://fcm.googleapis.com:8443/token', false],
  ['https://fcm.googleapis.com/', false],
  ['https://attacker.test/token', false],
  ['not-a-url', false],
];
for (const [endpoint, expected] of cases) assert.equal(isTrustedPushEndpoint(endpoint), expected, endpoint);
console.log(`${cases.length} endpoint validation tests passed`);
