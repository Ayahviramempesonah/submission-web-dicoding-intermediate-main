import * as STORYAPI from '../../data/api';
import Map from '../../utils/map';
import HomePresenter from './home-presenter';
import { generateItemStories } from '../../template';

export default class HomePage {
  #presenter;
  #map;

  async render() {
    return `
    
    <section>
 <div class="reports-list__map__container">
  <div id="map" class="reports-list__map"   role="region" aria-label="Peta lokasi"></div>
  <div id="map-loading-container"></div>
 </div>
 </section>
<div id="story-loading-container"></div>
<section class="container"   aria-labelledby="stories-heading" >
 <h1 class="section-title">InstaLite Story</h1>
 <div id="story-list" class="story-list" role="list" aria-live="polite" ></div>
 </section> 

    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: STORYAPI,
    });

    //panggil initialMap di sini

    try {
      await this.initialMap();
      await this.#presenter.initialGalleryAndMap();
    } catch (error) {
      console.error('Error during initialization:', error.message);

      // Tampilkan pesan error di UI
      document.getElementById('story-list').innerHTML = `
        <p style="color: red;">${error.message}</p>
      `;
    }
  }

  storyList(reports) {
    if (!reports || reports.length === 0) {
      document.getElementById('story-list').innerHTML = '<p>No stories available.</p>';
      return;
    }

    const html = reports.reduce((accumulator, report) => {
      if (report.lat !== null && report.lon !== null && !isNaN(report.lat) && !isNaN(report.lon)) {
        // console.log(report);
        const coordinate = [report.lat, report.lon];
        const markerOptions = { alt: report.name };
        const popupOptions = { content: report.description };
        // console.log('coordinate', coordinate);
        this.#map.addMarker(coordinate, markerOptions, popupOptions);
      }

      return accumulator.concat(
        generateItemStories({
          photoUrl: report.photoUrl,
          name: report.name,
          description: report.description,
          createdAt: report.createdAt,
          id: report.id,
          lat: report.lat,
          lon: report.lon,
        }),
      );
    }, '');
    //  const html =  generateItemStories()
    document.getElementById('story-list').innerHTML = `
      <div class="story-list">${html}</div>
    `;
    //eventlistener button untuh pindah halaman
    document.querySelectorAll('.detail-button').forEach((button) => {
      button.addEventListener('click', () => {
        const storyId = button.getAttribute('data-id'); // Ambil ID cerita dari atribut data-id
        window.location.href = `#/stories/${storyId}`; // Navigasi ke halaman detail
      });
    });
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 10,
      Draggable: true,
    });

    // this.#map.addMapEventListener('click', (e) => {
    //   const coordinate = [e.latlng.lat, e.latlng.lng];
    //   const markerOptions = { alt: 'Drag me to set location' };
    //   this.#map.addMarker(coordinate, markerOptions);
    // });
    //baru

    // Inisialisasi peta
  }

  showLoading() {
    document.getElementById('map-loading-container').innerHTML = 'Memuat Data...';
    document.getElementById('story-loading-container').innerHTML = 'Memuat Data...';
  }

  hideLoading() {
    document.getElementById('map-loading-container').innerHTML = '';
    document.getElementById('story-loading-container').innerHTML = '';
  }

  populateReportsListError(message) {
    document.getElementById('story-list').innerHTML = `
      <p style="color: red;">${message}</p>
    `;
  }
}
