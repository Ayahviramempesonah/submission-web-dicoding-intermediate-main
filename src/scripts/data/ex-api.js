const BASE_URL = 'https://story-api.dicoding.dev/v1';

// Register a new user
async function register(name, email, password) {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });
    return await response.json();
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// Login user
async function login(email, password) {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Add new story (authenticated)
async function addStory(token, { description, photo, lat, lon }) {
  try {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);
    if (lat) formData.append('lat', lat);
    if (lon) formData.append('lon', lon);

    const response = await fetch(`${BASE_URL}/stories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    return await response.json();
  } catch (error) {
    console.error('Add story error:', error);
    throw error;
  }
}

// Add new story (guest)
async function addStoryGuest({ description, photo, lat, lon }) {
  try {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photo);
    if (lat) formData.append('lat', lat);
    if (lon) formData.append('lon', lon);

    const response = await fetch(`${BASE_URL}/stories/guest`, {
      method: 'POST',
      body: formData,
    });
    return await response.json();
  } catch (error) {
    console.error('Add guest story error:', error);
    throw error;
  }
}

// Get all stories
async function getAllStories(token, { page, size, location } = {}) {
  try {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (size) params.append('size', size);
    if (location !== undefined) params.append('location', location ? 1 : 0);

    const response = await fetch(`${BASE_URL}/stories?${params.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Get stories error:', error);
    throw error;
  }
}

// Get story detail
async function getStoryDetail(token, storyId) {
  try {
    const response = await fetch(`${BASE_URL}/stories/${storyId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Get story detail error:', error);
    throw error;
  }
}

// Subscribe to push notifications
async function subscribePushNotification(token, subscription) {
  try {
    const response = await fetch(`${BASE_URL}/notifications/subscribe`, {
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
    return await response.json();
  } catch (error) {
    console.error('Subscribe error:', error);
    throw error;
  }
}

// Unsubscribe from push notifications
async function unsubscribePushNotification(token, endpoint) {
  try {
    const response = await fetch(`${BASE_URL}/notifications/subscribe`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoint }),
    });
    return await response.json();
  } catch (error) {
    console.error('Unsubscribe error:', error);
    throw error;
  }
}

// Example usage:

// async function exampleUsage() {
//   // Register
//   const registerResponse = await register('John Doe', 'john@example.com', 'password123');
//   console.log(registerResponse);

//   // Login
//   const loginResponse = await login('john@example.com', 'password123');
//   console.log(loginResponse);
//   const token = loginResponse.loginResult.token;

// Add story (authenticated)
//   const photoFile = /* get file input */
//   const addStoryResponse = await addStory(token, {
//     description: 'My first story',
//     photo: photoFile,
//     lat: -6.200000,
//     lon: 106.816666
//   });
//   console.log(addStoryResponse);

//   // Get all stories
//   const storiesResponse = await getAllStories(token, { page: 1, size: 10 });
//   console.log(storiesResponse);

//   // Get story detail
//   if (storiesResponse.listStory.length > 0) {
//     const storyDetail = await getStoryDetail(token, storiesResponse.listStory[0].id);
//     console.log(storyDetail);
//   }
// }
