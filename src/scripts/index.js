// CSS imports
import '../styles/styles.css';
import '../styles/responsive.css';

import App from './pages/app';
import 'leaflet/dist/leaflet.css';
import { registerServiceWorker } from './utils';
import Camera from './utils/camera';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  await app.renderPage();

  await registerServiceWorker();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
    //stop all stream
    Camera.stopAllStreams();
  });
});
