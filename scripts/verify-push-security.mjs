import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import ts from 'typescript';

const source = ts.transpileModule(fs.readFileSync('lib/push.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function fixture(errors = []) {
  const calls = [], store = new Map();
  let unsubscribed = 0, registered = 0;
  const subscription = { endpoint: 'https://fcm.googleapis.com/push/test',
    toJSON: () => ({ endpoint: 'https://fcm.googleapis.com/push/test', keys: { p256dh: 'a'.repeat(87), auth: 'b'.repeat(22) } }),
    unsubscribe: async () => { unsubscribed++; return true; },
  };
  const registration = { pushManager: { subscribe: async () => { registered++; return subscription; }, getSubscription: async () => subscription } };
  const exports = {};
  const context = {
    exports, require: () => ({ supabase: { rpc: async (name, args) => {
      calls.push({ name, args }); return { data: true, error: errors.shift() ?? null };
    } } }),
    window: { PushManager: class {} },
    navigator: { serviceWorker: { register: async () => registration, ready: Promise.resolve(registration), getRegistration: async () => registration } },
    Notification: { requestPermission: async () => 'granted' },
    localStorage: { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) },
    crypto: crypto.webcrypto, Uint8Array, atob,
    process: { env: { NEXT_PUBLIC_VAPID_PUBLIC_KEY: Buffer.alloc(65, 1).toString('base64url') } },
  };
  vm.runInNewContext(source, context);
  return { exports, calls, store, counts: () => ({ unsubscribed, registered }) };
}
const normal = fixture();
assert.equal(await normal.exports.subscribeToPush(), true);
assert.equal(normal.calls[0].name, 'register_push_subscription');
assert.match(normal.calls[0].args.p_capability, /^[a-f0-9]{64}$/);
assert.equal('user_id' in normal.calls[0].args, false);
await normal.exports.subscribeToPush();
assert.equal(normal.calls[0].args.p_capability, normal.calls[1].args.p_capability);
await normal.exports.unsubscribeFromPush();
assert.equal(normal.calls[2].name, 'unregister_push_subscription');
assert.equal(normal.calls[2].args.p_capability, normal.calls[0].args.p_capability);
assert.equal(normal.counts().unsubscribed, 1);

const legacy = fixture([{ code: '42501' }]);
assert.equal(await legacy.exports.subscribeToPush(), true);
assert.equal(legacy.counts().unsubscribed, 1);
assert.equal(legacy.counts().registered, 2);
assert.equal(legacy.calls[0].args.p_capability, legacy.calls[1].args.p_capability);

// Reload module with an existing capability and a failing deregistration request.
const failed = fixture([{ code: '503', message: 'offline' }]);
failed.store.set('cpm:push-capability:v1', 'a'.repeat(64));
await assert.rejects(failed.exports.unsubscribeFromPush());
assert.equal(failed.counts().unsubscribed, 0);

const legacyUnsubscribe = fixture();
await legacyUnsubscribe.exports.unsubscribeFromPush();
assert.equal(legacyUnsubscribe.calls.length, 0);
assert.equal(legacyUnsubscribe.counts().unsubscribed, 1);
console.log('Push client scenarios passed: RPC registration, capability persistence, legacy rotation, deregistration errors and legacy unsubscribe.');
