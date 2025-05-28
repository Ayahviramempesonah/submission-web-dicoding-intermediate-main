import { convertBase64ToUint8Array } from './index';
import CONFIG from '../config';

import { subscribePushNotification, unsubscribePushNotification } from '../data/api';

export function isNotificationAvailable() {
  return 'Notification' in window;
}

export function isNotificationGranted() {
  return Notification.permission === 'granted';
}

export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    console.error('Notification API unsupported.');
    return false;
  }

  if (isNotificationGranted()) {
    return true;
  }

  const status = await Notification.requestPermission();

  if (status === 'denied') {
    alert('Izin notifikasi ditolak.');
    return false;
  }

  if (status === 'default') {
    alert('Izin notifikasi ditutup atau diabaikan.');
    return false;
  }

  return true;
}

export async function getPushSubscription() {
  const registration = await navigator.serviceWorker.ready;
  return await registration.pushManager.getSubscription();
}

export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
}

export function generateSubscribeOptions() {
  //cek dulu
  const applicationServerKey = convertBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY);

  // Log untuk verifikasi
  console.log('VAPID Public Key (String):', CONFIG.VAPID_PUBLIC_KEY);
  console.log('Application Server Key (Uint8Array):', applicationServerKey);
  // console.log('Is Uint8Array:', applicationServerKey instanceof Uint8Array);

  return {
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey,
  };
}

export async function subscribe() {
  console.log('subscribe', subscribe);

  if (!(await requestNotificationPermission())) {
    return;
  }

  if (await isCurrentPushSubscriptionAvailable()) {
    alert('Sudah berlangganan push notification.');
    return;
  }

  console.log('Mulai berlangganan push notification...');

  const failureSubscribeMessage = 'Langganan push notification gagal diaktifkan.';
  const successSubscribeMessage = 'Langganan push notification berhasil diaktifkan.';

  let pushSubscription;

  try {
    const registration = await navigator.serviceWorker.ready;
    console.log('registration', registration);

    pushSubscription = await registration.pushManager.subscribe(generateSubscribeOptions());

    // console.log('pushSubscription',pushSubscription)

    const { endpoint, keys } = pushSubscription.toJSON();
    const response = await subscribePushNotification({ endpoint, keys });

    if (response.error) {
      console.error('subscribe: response:', response);
      alert(failureSubscribeMessage);

      // Undo subscribe to push notification
      await pushSubscription.unsubscribe();

      return;
    }

    alert(successSubscribeMessage);
  } catch (error) {
    console.error('subscribe: error:', error);
    alert(failureSubscribeMessage);

    // Undo subscribe to push notification
    // Pastikan pushSubscription ada dan valid sebelum mencoba unsubscribe
    if (pushSubscription && typeof pushSubscription.unsubscribe === 'function') {
      try {
        await pushSubscription.unsubscribe();
        console.log('Berhasil unsubscribe setelah upaya langganan gagal.');
      } catch (unsubError) {
        console.error('Error saat mencoba unsubscribe setelah langganan gagal:', unsubError);
      }
    } else {
      console.warn('pushSubscription tidak tersedia untuk unsubscribe setelah error.');
    }
  }
}

export async function unsubscribe() {
  const failureUnsubscribeMessage = 'Langganan push notification gagal dinonaktifkan.';
  const successUnsubscribeMessage = 'Langganan push notification berhasil dinonaktifkan.';

  try {
    const pushSubscription = await getPushSubscription();

    if (!pushSubscription) {
      alert('Tidak bisa memutus langganan push notification karena belum berlangganan sebelumnya.');
      return;
    }

    const { endpoint, keys } = pushSubscription.toJSON();
    const response = await unsubscribePushNotification({ endpoint });

    if (response.error) {
      alert(failureUnsubscribeMessage);
      console.error('unsubscribe: response:', response);

      return;
    }

    const unsubscribed = await pushSubscription.unsubscribe();

    if (!unsubscribed) {
      alert(failureUnsubscribeMessage);
      await subscribePushNotification({ endpoint, keys });

      return;
    }

    alert(successUnsubscribeMessage);
  } catch (error) {
    alert(failureUnsubscribeMessage);
    console.error('unsubscribe: error:', error);
  }
}
