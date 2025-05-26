import CONFIG from '../config';
import { getAccessToken } from '../utils/auth';

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
};

export async function getData() {
  const fetchResponse = await fetch(ENDPOINTS.STORIES);
  return await fetchResponse.json();
}

export async function getRegistered({ name, email, password }) {
  const data = JSON.stringify({ name, email, password });

  const fetchResponse = await fetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getLogin({ email, password }) {
  const data = JSON.stringify({ email, password });

  const fetchResponse = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getMyUserInfo() {
  const accessToken = getAccessToken();

  const fetchResponse = await fetch(ENDPOINTS.MY_USER_INFO, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

//fungsi untuk get api di home
export async function fetchStories(params = {}) {
  try {
    // Ambil token dari localStorage
    const token = getAccessToken();
    if (!token) {
      throw new Error('Access token is missing or invalid.');
    }

    // Buat URL dengan query parameters
    const queryParams = new URLSearchParams(params).toString();
    const url = `${CONFIG.BASE_URL}/stories${queryParams ? `?${queryParams}` : ''}`;

    // Lakukan permintaan GET ke API
    const fetchResponse = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Tangani kasus jika fetch gagal sepenuhnya (misalnya, server tidak tersedia)
    if (!fetchResponse.ok) {
      const errorData = await fetchResponse.json(); // Coba parse pesan error dari API

      // Jika token tidak valid, hapus token dan redirect ke halaman login
      if (errorData.message && errorData.message.includes('Invalid token signature')) {
        removeAccessToken(); // Hapus token yang tidak valid
        location.hash = '/login'; // Redirect ke halaman login
        throw new Error('Token invalid. Redirecting to login...');
      }

      throw new Error(errorData.message || 'Failed to fetch stories.');
    }

    // Parse respons sebagai JSON
    const json = await fetchResponse.json();

    // Kembalikan data dengan properti tambahan
    return {
      ...json,
      ok: fetchResponse.ok,
    };
  } catch (error) {
    // Tangani error dengan lebih baik
    console.error('fetchStories: error', error.message);

    // Jika error terjadi karena koneksi gagal, tangani secara spesifik
    if (error.message.includes('Failed to fetch')) {
      console.error(
        'Server API is unreachable. Please check your internet connection or the API URL.',
      );
    }

    throw error; // Lanjutkan error agar dapat ditangani di luar fungsi
  }
}

export async function fetchStoryById(id) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error('Access token is missing or invalid.');
    }

    const url = `${CONFIG.BASE_URL}/stories/${id}`;

    const fetchResponse = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!fetchResponse.ok) {
      const errorData = await fetchResponse.json();
      throw new Error(errorData.message || 'Failed to fetch story details.');
    }

    const json = await fetchResponse.json();

    return {
      ...json,
      ok: fetchResponse.ok,
    };
  } catch (error) {
    console.error('fetchStoryById: error', error.message);
    throw error;
  }
}

//function api addnewstory alias post
export async function addNewStory(storyData) {
  try {
    const token = getAccessToken();
    if (!token) {
      throw new Error('Access token is missing or invalid.');
    }

    const { description, photo, lat, lon } = storyData;

    const formData = new FormData();
    formData.append('description', description);

    // Only append photo if it exists
    if (photo) {
      formData.append('photo', photo);
    }
    if (typeof lat === 'number' && !isNaN(lat)) formData.append('lat', lat.toString());
    if (typeof lon === 'number' && !isNaN(lon)) formData.append('lon', lon.toString());

    const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add story.');
    }

    const json = await response.json();
    if (json.error) {
      throw new Error(json.message || 'Failed to add story.');
    }

    return json;
  } catch (error) {
    console.error('addNewStory: error', error.message);
    throw error;
  }
}

//untuk logout
export function removeAccessToken() {
  try {
    localStorage.removeItem(CONFIG.ACCESS_TOKEN_KEY);
    return true;
  } catch (error) {
    console.error('getLogout: error:', error);
    return false;
  }
}

export function getLogout() {
  removeAccessToken();
}

export async function subscribePushNotification(subscription) {
  try {
    // Get token from storage
    const token = getAccessToken();
    if (!token) {
      throw new Error('Access token is missing or invalid. Please login first.');
    }

    // Make API request
    const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      }),
    });

    // Check if response is successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to subscribe to notifications');
    }

    // Parse successful response
    const data = await response.json();
    console.log('Successfully subscribed:', data);
    return data;
  } catch (error) {
    console.error('Subscribe error:', error);
    // Re-throw the error for the caller to handle
    throw error;
  }
}

//unsubcribetions

export async function unsubscribePushNotification({ endpoint }) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({ endpoint });

  const fetchResponse = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();
  console.log('Successfully unsubscribed:', json);

  return {
    ...json,
    ok: fetchResponse.ok,
  };
}
