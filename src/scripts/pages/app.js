import routes from '../routes/routes';
import { getActiveRoute, getActivePathname } from '../routes/url-parser';
import {
  generateSubscribeButtonTemplate,
  generateMainNavigationListTemplate,
  // generateSubscribeButtonTemplate,
  generateUnauthenticatedNavigationListTemplate,
} from '../template';
import { isServiceWorkerAvailable } from '../utils';
// import { subscr } from '../utils/notification-helper';
import { getAccessToken, removeAccessToken } from '../utils/auth';
import {
  isCurrentPushSubscriptionAvailable,
  subscribe,
  unsubscribe,
  getPushSubscription,
} from '../utils/notification-helper';

class App {
  #drawerNavigation;
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content, drawerNavigation }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#drawerNavigation = drawerNavigation;

    this.#setupDrawer();
  }

  async #setupPushNotification() {
    const pushNotificationTools = document.getElementById('push-notification-tools');
    const isSubscribed = await isCurrentPushSubscriptionAvailable();

    if (isSubscribed) {
      pushNotificationTools.innerHTML = '<button id="unsubscribe-button">Unsubscribe</button>';
      document.getElementById('unsubscribe-button').addEventListener('click', () => {
        unsubscribe().finally(() => {
          this.#setupPushNotification();
        });
      });

      return;
    }

    pushNotificationTools.innerHTML = '<button id="subscribe-button">Subscribe</button>';
    document.getElementById('subscribe-button').addEventListener('click', () => {
      subscribe().finally(() => {
        this.#setupPushNotification();
      });
    });
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  //navigation list
  #setupNavigationList() {}

  async renderPage() {
    const url = getActiveRoute();
    const route = routes[url];
    // get page
    const page = route();

    this.#content.innerHTML = await page.render();
    await page.afterRender();
    // this.#setupNavigationList();

    if (isServiceWorkerAvailable()) {
      this.#setupPushNotification();
    }
    this; // first
  }
}

export default App;
