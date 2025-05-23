// import { fetchStoryById } from '../../data/api';
import { generateItemDetailTemplate, generateLoaderAbsoluteTemplate } from '../../template';
import Map from '../../utils/map';
import * as STORYAPI from '../../data/api';
// import { parseActivePathname } from '../../routes/url-parser';
import DetailPresenter from './detail-presenter';
import { parseActivePathname } from '../../routes/url-parser';
// import  generateLoaderAbsoluteTemplate  from '../../template';
// console.log('fetchstory', fetchStoryById)
export default class DetailPage {
  #presenter;
  #model;
  #map = null;

  async render() {
    return `
     <section class="detail-container" aria-labelledby="detail-title">
  <h1 id="detail-title">Story Detail</h1>
  
  <!-- Loading State -->
  <div 
    id="story-detail-loadiing" 
    aria-live="polite" 
    aria-busy="true" 
    hidden
  >
    <p class="visually-hidden">Memuat detail story...</p>
    <div class="loading-spinner" aria-hidden="true"></div>
  </div>
  
  <!-- Konten Utama -->
  <div 
    id="story-detail" 
    aria-live="polite" 
    role="article"
  >
    <!-- Konten akan diisi secara dinamis -->
  </div>
</section>
    `;
  }

  async afterRender() {
    this.#presenter = new DetailPresenter(parseActivePathname().id, {
      view: this,
      apiModel: STORYAPI,
    });

    await this.#presenter.showStoryDetail(); //fungsi dari presenter
  }

  async populateStoryAndInitailMap(message, report) {
    document.getElementById('story-detail').innerHTML = generateItemDetailTemplate({
      title: report.title,
      name: report.name,
      description: report.description,
      photoUrl: report.photoUrl,
      createdAt: report.createdAt,
      // lat: report.lat,
      // lon: report.lon,
      lat: report.location.latitude,
      lon: report.location.longitude,
    });
    //map
    await this.#presenter.showDetailMap();
    if (this.#map) {
      const reportCoordinate = [report.location.latitude, report.location.longitude];
      const markerOptions = { alt: report.name };
      const popupOptions = { content: report.name };
      this.#map.changeCamera(reportCoordinate);
      this.#map.addMarker(reportCoordinate, markerOptions, popupOptions);
    }
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 15,
      locate: true,
    });
  }

  //loading item

  showLoadingItem() {
    document.getElementById('story-detail-loadiing').innerHTML = 'Memuat..';
  }

  hideLoadingItem() {
    document.getElementById('story-detail-loadiing').innerHTML = '';
  }

  // show loading component
  showMapLoading() {
    document.getElementById('map-loading-container').innerHTML = 'bbbb';
  }

  hideMapLoading() {
    document.getElementById('map-loading-container').innerHTML = '';
  }
}
