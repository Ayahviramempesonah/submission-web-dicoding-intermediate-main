import { getActiveRoute } from '../routes/url-parser';
import CONFIG from '../config';

export function getAccessToken() {
  try {
    const accesToken = localStorage.getItem(CONFIG.ACCESS_TOKEN_KEY);
    if (!accesToken) {
      return null;
    }
    return accesToken;
  } catch (err) {
    console.log('getaccessToken : error', err.message);
    return null;
  }
}

export function putAccessToken(token) {
  try {
    localStorage.setItem(CONFIG.ACCESS_TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.log('putAccesToken: error', error.message);
    return false;
  }
}

export function removeAccessToken() {
  try {
    localStorage.removeItem(CONFIG.ACCESS_TOKEN_KEY);
    return true;
  } catch (error) {
    console.log('removeAccessToken: error', error.message);
    return false;
  }
}

const unauthenticatedRoutesOnly = ['/login', '/register'];

export function checkUnauthenticatedRouteOnly(page) {
  const url = getActiveRoute();
  const isLogin = !!getAccessToken();

  if (unauthenticatedRoutesOnly.includes(url) && isLogin) {
    location.hash = '/';
    return null;
  }

  return page;
}

export function checkAuthenticatedRoute(page) {
  const isLogin = !!getAccessToken();

  if (!isLogin) {
    location.hash = '/login';
    return null;
  }

  return page;
}
