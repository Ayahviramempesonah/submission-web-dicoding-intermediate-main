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

//baru
// notification-helper.js
// import { convertBase64ToUint8Array } from './index';
// import CONFIG from '../config';

// export async function checkServiceWorkerSupport() {
//   if (!('serviceWorker' in navigator)) {
//     throw new Error('Browser tidak mendukung Service Worker');
//   }

//   if (!('PushManager' in window)) {
//     throw new Error('Browser tidak mendukung Push API');
//   }
// }

// export async function getServiceWorkerRegistration() {
//   await checkServiceWorkerSupport();

//   // Pastikan service worker sudah terdaftar
//   if (!navigator.serviceWorker.controller) {
//     await navigator.serviceWorker.register('/sw.js');
//   }

//   return await navigator.serviceWorker.ready;
// }

// export async function subscribe() {
//   try {
//     // 1. Verifikasi dukungan browser
//     await checkServiceWorkerSupport();

//     // 2. Dapatkan registration
//     const registration = await getServiceWorkerRegistration();

//     // 3. Minta izin notifikasi
//     const permission = await Notification.requestPermission();
//     if (permission !== 'granted') {
//       throw new Error('Izin notifikasi ditolak');
//     }

//     // 4. Verifikasi VAPID key
//     if (!CONFIG.VAPID_PUBLIC_KEY) {
//       throw new Error('VAPID_PUBLIC_KEY tidak terkonfigurasi');
//     }

//     // 5. Subscribe ke push service
//     const subscription = await registration.pushManager.subscribe({
//       userVisibleOnly: true,
//       applicationServerKey: convertBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY)
//     });

//     // 6. Kirim subscription ke server
//     const response = await subscribePushNotification({
//       endpoint: subscription.endpoint,
//       keys: subscription.toJSON().keys
//     });

//     if (response.error) {
//       await subscription.unsubscribe();
//       throw new Error(response.message || 'Gagal menyimpan subscription');
//     }

//     return subscription;
//   } catch (error) {
//     console.error('Error in subscribe:', error);
//     throw error;
//   }
// }
