// Web Push — inscrição do navegador pra notificações reais (grátis, sem
// serviço pago: usa VAPID direto contra o push service do próprio browser).

import { supabase } from './supabase';

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const out = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let i = 0; i < rawData.length; i++) out[i] = rawData.charCodeAt(i);
  return out;
}

export function isPushSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
}

export async function getPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return null;
  return reg.pushManager.getSubscription();
}

const capabilityKey = 'cpm:push-capability:v1';

function pushCapability(): string {
  let capability = localStorage.getItem(capabilityKey);
  if (!capability || !/^[a-f0-9]{64}$/.test(capability)) {
    capability = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
    localStorage.setItem(capabilityKey, capability);
  }
  return capability;
}

export async function subscribeToPush(): Promise<boolean> {
  if (!isPushSupported()) return false;
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) return false;

  const reg = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;

  let sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  const capability = pushCapability();
  const register = async (subscription: PushSubscription) => {
    const json = subscription.toJSON();
    return supabase.rpc('register_push_subscription', {
      p_endpoint: json.endpoint!, p_p256dh: json.keys!.p256dh!,
      p_auth: json.keys!.auth!, p_capability: capability,
    });
  };
  let { error } = await register(sub);
  // Legacy subscriptions have no capability. Rotate the browser subscription;
  // knowing the old endpoint alone never grants access to its database row.
  if (error?.code === '42501') {
    await sub.unsubscribe();
    sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) });
    ({ error } = await register(sub));
  }

  return !error;
}

export async function unsubscribeFromPush(): Promise<void> {
  const sub = await getPushSubscription();
  if (!sub) return;
  const capability = localStorage.getItem(capabilityKey);
  if (capability) {
    const { error } = await supabase.rpc('unregister_push_subscription', {
      p_endpoint: sub.endpoint, p_capability: capability,
    });
    if (error) throw error;
  }
  // Invalidates a legacy browser subscription too; broadcast removes expired rows.
  if (!await sub.unsubscribe()) throw new Error('Não foi possível desativar as notificações');
}

// Dispara um broadcast pros inscritos — só funciona pra usuários staff (checado
// no servidor via RLS); qualquer outro chamador recebe 401/403 sem efeito.
export async function sendBroadcast(opts: { title: string; body?: string; url?: string }): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;
  try {
    const res = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify(opts),
    });
    return res.ok;
  } catch {
    return false;
  }
}
