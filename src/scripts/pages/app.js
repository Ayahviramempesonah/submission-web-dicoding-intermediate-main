import routes from '../routes/routes';
import { getActiveRoute, getActivePathname } from '../routes/url-parser';
import {
  // generateAuthenticatedNavigationListTemplate,
  generateMainNavigationListTemplate,
  // generateSubscribeButtonTemplate,
  generateUnauthenticatedNavigationListTemplate,
} from '../template';
import { isServiceWorkerAvailable } from '../utils';
import { subscribe } from '../utils/notification-helper';
import { getAccessToken, removeAccessToken } from '../utils/auth';

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
    pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();
    document.getElementById('subscribe-button').addEventListener('click', () => {
      subscribe();
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
  #setupNavigationList() {
    const isLogin = !!getAccessToken();
    const navListMain = this.#drawerNavigation.children.namedItem('navlist-main');
    const navList = this.#drawerNavigation.children.namedItem('navlist');

    // User not log in
    if (!isLogin) {
      navListMain.innerHTML = '';
      navList.innerHTML = generateUnauthenticatedNavigationListTemplate();
      return;
    }

    navListMain.innerHTML = generateMainNavigationListTemplate();
    navList.innerHTML = generateAuthenticatedNavigationListTemplate();

    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', (event) => {
      event.preventDefault();

      if (confirm('Apakah Anda yakin ingin keluar?')) {
        getLogout();

        // Redirect
        location.hash = '/login';
      }
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    const route = routes[url];
    // get page
    const page = route();

    this.#content.innerHTML = await page.render();
    await page.afterRender();
    // this.#setupNavigationList();

    if (isServiceWorkerAvailable()) {
      // this.#setupPushNotification();
    }
    this; // first
  }
}

export default App;

//baru
// import routes from '../routes/routes';
// import { getActiveRoute } from '../routes/url-parser';
// import {
//   generateAuthenticatedNavigationListTemplate,
//   generateMainNavigationListTemplate,
//   generateSubscribeButtonTemplate,
//   generateUnauthenticatedNavigationListTemplate,
// } from '../template';
// import { isServiceWorkerAvailable } from '../utils';
// import { subscribe } from '../utils/notification-helper';
// import { getAccessToken, removeAccessToken } from '../utils/auth';

// class App {
//   #drawerNavigation;
//   #content = null;
//   #drawerButton = null;
//   #navigationDrawer = null;

//   constructor({ navigationDrawer, drawerButton, content, drawerNavigation }) {
//     this.#content = content;
//     this.#drawerButton = drawerButton;
//     this.#navigationDrawer = navigationDrawer;
//     this.#drawerNavigation = drawerNavigation;

//     this.#setupDrawer();
//   }

//   /**
//    * Setup Push Notification
//    */
//   async #setupPushNotification() {
//     try {
//       const pushNotificationTools = document.getElementById('push-notification-tools');
//       if (!pushNotificationTools) {
//         console.warn('Element "push-notification-tools" not found.');
//         return;
//       }

//       pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();
//       const subscribeButton = document.getElementById('subscribe-button');
//       if (subscribeButton) {
//         subscribeButton.addEventListener('click', () => {
//           subscribe().catch((error) => {
//             console.error('Failed to subscribe to push notifications:', error);
//           });
//         });
//       }
//     } catch (error) {
//       console.error('Error setting up push notification:', error);
//     }
//   }

//   /**
//    * Setup Drawer Navigation
//    */
//   #setupDrawer() {
//     this.#drawerButton.addEventListener('click', () => {
//       this.#navigationDrawer.classList.toggle('open');
//     });

//     document.body.addEventListener('click', (event) => {
//       const isTargetInsideDrawer = this.#navigationDrawer.contains(event.target);
//       const isTargetInsideButton = this.#drawerButton.contains(event.target);

//       // Close drawer if click is outside drawer and button
//       if (!isTargetInsideDrawer && !isTargetInsideButton) {
//         this.#navigationDrawer.classList.remove('open');
//       }

//       // Close drawer if a link inside the drawer is clicked
//       this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
//         if (link.contains(event.target)) {
//           this.#navigationDrawer.classList.remove('open');
//         }
//       });
//     });
//   }

//   /**
//    * Setup Navigation List Based on User Authentication Status
//    */
//   #setupNavigationList() {
//     try {
//       const isLogin = !!getAccessToken();
//       const navListMain = this.#drawerNavigation.children.namedItem('navlist-main');
//       const navList = this.#drawerNavigation.children.namedItem('navlist');

//       if (!navListMain || !navList) {
//         console.warn('Navigation elements "navlist-main" or "navlist" not found.');
//         return;
//       }

//       // Update navigation based on login status
//       if (!isLogin) {
//         navListMain.innerHTML = '';
//         navList.innerHTML = generateUnauthenticatedNavigationListTemplate();
//         return;
//       }

//       navListMain.innerHTML = generateMainNavigationListTemplate();
//       navList.innerHTML = generateAuthenticatedNavigationListTemplate();

//       // Add logout functionality
//       const logoutButton = document.getElementById('logout-button');
//       if (logoutButton) {
//         logoutButton.addEventListener('click', (event) => {
//           event.preventDefault();

//           if (confirm('Apakah Anda yakin ingin keluar?')) {
//             removeAccessToken(); // Clear access token
//             location.hash = '/login'; // Redirect to login page
//           }
//         });
//       }
//     } catch (error) {
//       console.error('Error setting up navigation list:', error);
//     }
//   }

//   /**
//    * Render Page Based on Active Route
//    */
//   async renderPage() {
//     try {
//       const url = getActiveRoute();
//       const route = routes[url];

//       if (!route) {
//         throw new Error(`Route not found for URL: ${url}`);
//       }

//       // Get page instance and render it
//       const page = route();
//       this.#content.innerHTML = await page.render();
//       await page.afterRender();

//       // Update navigation list and push notification setup
//       this.#setupNavigationList();

//       if (isServiceWorkerAvailable()) {
//         this.#setupPushNotification();
//       }
//     } catch (error) {
//       console.error('Error rendering page:', error);
//       this.#content.innerHTML = `<p>Error loading page. Please try again later.</p>`;
//     }
//   }
// }

// export default App;
