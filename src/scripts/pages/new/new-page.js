import Map from '../../utils/map';
import NewPresenter from './new-presenter';
import * as StoryApi from '../../data/api';
import { generateLoaderAbsoluteTemplate } from '../../template';
import Camera from '../../utils/camera';

export default class AddStoryPage {
  #presenter;
  #form;
  #camera;
  #videoStream = null;
  #isCameraOpen = false;
  #takenDocumentations = [];
  #map = null;

  async render() {
    return `
   <section class="add-story-container" aria-labelledby="story-form-title">
  <h2 id="story-form-title">Bagikan Storymu pada dunia</h2>
  
  <form id="add-story-form">
    <!-- Title -->
    <div class="form-group">
      <label for="title">Judul:</label>
      <input type="text" id="title" name="title" required placeholder="Judul story">
    </div>

    <!-- Description -->
    <div class="form-group">
      <label for="description">Deskripsi:</label>
      <textarea id="description" name="description" required placeholder="Ceritakan kisahmu" rows="5"></textarea>
    </div>

    <!-- Dokumentasi -->
    <div class="new-form__documentations__container">
      <div class="new-form__documentations__buttons">
        <button id="documentations-input-button" class="btn btn-outline" type="button" aria-label="Upload gambar">
          Ambil Gambar
        </button>
        <input id="documentations-input" type="file" accept="image/*" hidden>
        
        <button id="open-documentations-camera-button" class="btn btn-outline" type="button" aria-label="Buka kamera">
          Buka Kamera
        </button>
      </div>

      <!-- Kamera -->
      <div id="camera-container" class="new-form__camera__container" hidden>
        <video id="camera-video" aria-label="Pratinjau kamera">
          Browser tidak mendukung akses kamera.
        </video>
        <canvas id="camera-canvas" hidden></canvas>
        
        <div class="new-form__camera__tools">
          <select id="camera-select" aria-label="Pilih kamera"></select>
          <button id="camera-take-button" class="btn" type="button" aria-label="Ambil foto">
            Ambil Gambar
          </button>
        </div>
      </div>

      <!-- Daftar Gambar -->
      <ul id="documentations-taken-list" class="new-form__documentations__outputs" aria-live="polite"></ul>
    </div>

    <!-- Lokasi -->
    <div class="form-group">
      <fieldset>
        <legend class="new-form__location__title">Lokasi</legend>
        <div class="new-form__location__map__container">
          <div id="map" class="new-form__location__map" aria-label="Peta lokasi"></div>
          <div id="map-loading-container" class="map-loading-overlay">
            <div class="loading-spinner" aria-hidden="true"></div>
            <p>Memuat peta...</p>
          </div>
        </div>
        <div class="new-form__location__lat-lng">
          <label for="latitude">Garis Lintang:</label>
          <input type="number" id="latitude" name="latitude" readonly>
          
          <label for="longitude">Garis Bujur:</label>
          <input type="number" id="longitude" name="longitude" readonly>
        </div>
      </fieldset>
    </div>

    <button type="submit" class="btn btn-primary">Kirim</button>
  </form>
  
  <p id="form-message" class="form-message" aria-live="polite"></p>
</section>
    `;
  }

  async afterRender() {
    this.#presenter = new NewPresenter({
      view: this,
      model: StoryApi,
    });
    this.#takenDocumentations = [];
    this.#presenter.showNewFormMap();
    this.#setupForm();
  }

  // setup form
  #setupForm() {
    // Ambil elemen form
    this.#form = document.getElementById('add-story-form');
    if (!this.#form) {
      console.error('Form with ID "add-story-form" not found.');
      return;
    }

    // Handle submit form
    this.#form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        title: this.#form.elements.namedItem('title').value,
        description: this.#form.elements.namedItem('description').value,
        photoFile: this.#takenDocumentations.map((picture) => picture.blob),
        latitude: this.#form.elements.namedItem('latitude').value,
        longitude: this.#form.elements.namedItem('longitude').value,
      };

      // await this.#presenter.addNewStory(data);
      try {
        await this.#presenter.addNewStory(data);
        this.storeSuccesFully('Story submitted successfully!');
      } catch (err) {
        console.error('Error adding story:', err);
      }
    });

    // Handle input file (upload photo)
    document.getElementById('documentations-input').addEventListener('change', async (event) => {
      const insertingPicturesPromises = Object.values(event.target.files).map(async (file) => {
        return await this.#addTakenPicture(file);
      });
      await Promise.all(insertingPicturesPromises);

      await this.#populateTakenPictures();
    });

    // Handle button camera
    document.getElementById('documentations-input-button').addEventListener('click', () => {
      document.getElementById('documentations-input').click();
    });

    // camera container
    const cameraContainer = document.getElementById('camera-container');
    document
      .getElementById('open-documentations-camera-button')
      .addEventListener('click', async (event) => {
        cameraContainer.classList.toggle('open');
        this.#isCameraOpen = cameraContainer.classList.contains('open');

        if (this.#isCameraOpen) {
          event.currentTarget.textContent = 'Tutup Kamera';
          this.#setupCamera();
          await this.#camera.launch();
          this.#videoStream = null;

          return;
        }

        event.currentTarget.textContent = 'Buka Kamera';
        this.#camera.stop();
      });
  }

  //setup camera
  #setupCamera() {
    if (!this.#camera) {
      this.#camera = new Camera({
        video: document.getElementById('camera-video'),
        canvas: document.getElementById('camera-canvas'),
        cameraSelect: document.getElementById('camera-select'),
      });
    }

    this.#camera.addCheeseButtonListener('#camera-take-button', async () => {
      const image = await this.#camera.takePicture();
      await this.#addTakenPicture(image);
      await this.#populateTakenPictures();
    });
  }

  async #populateTakenPictures() {
    const html = this.#takenDocumentations.reduce((accumulator, picture, currentIndex) => {
      const imageUrl = URL.createObjectURL(picture.blob);
      return accumulator.concat(`
        <li class="new-form__documentations__outputs-item">
          <button type="button" data-deletepictureid="${picture.id}" class="new-form__documentations__outputs-item__delete-btn">
            <img src="${imageUrl}" alt="Dokumentasi ke-${currentIndex + 1}">
          </button>
        </li>
      `);
    }, '');

    const listElement = document.getElementById('documentations-taken-list');
    listElement.innerHTML = html;

    // Pasang event listener untuk tombol delete
    listElement.querySelectorAll('button[data-deletepictureid]').forEach((button) => {
      // Now listElement is defined
      button.addEventListener('click', (event) => {
        const pictureId = event.currentTarget.dataset.deletepictureid;

        const deleted = this.#removePicture(pictureId);
        if (!deleted) {
          console.warn(`Picture with id ${pictureId} was not found`);
        }

        // Refresh tampilan setelah penghapusan
        this.#populateTakenPictures();
      });
    });
  }

  // hapus gambar
  #removePicture(id) {
    const selectedPicture = this.#takenDocumentations.find((picture) => {
      return picture.id == id;
    });

    // Check if founded selectedPicture is available
    if (!selectedPicture) {
      return null;
    }

    // Deleting selected selectedPicture from takenPictures
    this.#takenDocumentations = this.#takenDocumentations.filter((picture) => {
      return picture.id != selectedPicture.id;
    });

    return selectedPicture;
  }

  //menyimpan gambar dengan nilai string dan id
  async #addTakenPicture(image) {
    let blob = image;

    // Assuming convertBase64ToBlob is defined elsewhere
    if (typeof image === 'string') {
      blob = await convertBase64ToBlob(image, 'image/png');
    }

    const newDocumentation = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      blob: blob,
    };
    this.#takenDocumentations = [...this.#takenDocumentations, newDocumentation];
  }

  async initialMap() {
    this.#map = await Map.build('#map', {
      zoom: 15,
      locate: true,
    });

    // Preparing marker for select coordinate
    const centerCoordinate = this.#map.getCenter();

    this.#updateLatLngInput(centerCoordinate.latitude, centerCoordinate.longitude);

    const draggableMarker = this.#map.addMarker(
      [centerCoordinate.latitude, centerCoordinate.longitude],
      { draggable: 'true' },
    );

    // Bind popup to marker
    draggableMarker.bindPopup('Lokasi Kamu').openPopup();

    // Update popup content when marker is moved
    draggableMarker.addEventListener('move', (event) => {
      const coordinate = event.target.getLatLng();
      this.#updateLatLngInput(coordinate.lat, coordinate.lng);

      // Update popup content with new coordinates
      draggableMarker.setPopupContent(`: ${coordinate.lat}, ${coordinate.lng}`);
    });

    // Handle map click event
    this.#map.addMapEventListener('click', (event) => {
      // Move marker to clicked location
      draggableMarker.setLatLng(event.latlng);

      // Update popup content with clicked coordinates
      draggableMarker
        .setPopupContent(` kamoh ada dsini Lat: ${event.latlng.lat}, Lng: ${event.latlng.lng}`)
        .openPopup();

      // Keep the map centered on the clicked location
      event.sourceTarget.flyTo(event.latlng);
    });

    return this.#map; // Or return true, or an object indicating success
  }

  #updateLatLngInput(latitude, longitude) {
    this.#form.elements.namedItem('latitude').value = latitude;
    this.#form.elements.namedItem('longitude').value = longitude;
  }

  storeFailed(message) {
    alert(message);
  }

  storeSuccesFully(message) {
    // alert(message);
    this.clearForm();
    location.hash = '/';
  }

  clearForm() {
    this.#form.reset();
  }

  showMapLoading() {
    document.getElementById('map-loading-container').innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById('map-loading-container').innerHTML = '';
  }

  showSubmitLoadingButton() {
    const submitButton = this.#form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      // You can add a loading spinner or change text, e.g.:
      // submitButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...`;
      submitButton.textContent = 'Submitting...';
    }
  }

  hideSubmitLoadingButton() {
    const submitButton = this.#form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Submit';
    }
  }
}
