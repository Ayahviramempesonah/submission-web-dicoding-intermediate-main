export default class NewPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async showNewFormMap() {
    this.#view.showMapLoading();
    try {
      const lihat = await this.#view.initialMap();
      return lihat;
    } catch (error) {
      console.error('showNewFormMap: error:', error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async addNewStory(storyDataFromView) {
    this.#view.showSubmitLoadingButton();
    try {
      // Extract data from the view's payload
      const { description, photoFile, latitude, longitude } = storyDataFromView;

      // The API likely expects a single photo file.
      // If photoFile is an array of blobs from the view, take the first one.
      const photoToSubmit =
        Array.isArray(photoFile) && photoFile.length > 0
          ? photoFile[0]
          : photoFile instanceof Blob || photoFile instanceof File
            ? photoFile
            : null;
      const parsedLat = parseFloat(latitude);
      const parsedLon = parseFloat(longitude);

      const modelPayload = {
        description: description,

        lat: latitude !== undefined && latitude !== null ? parseFloat(latitude) : undefined,
        lon: longitude !== undefined && longitude !== null ? parseFloat(longitude) : undefined,
        photo: photoToSubmit,
        lat: !isNaN(parsedLat) ? parsedLat : undefined,
        lon: !isNaN(parsedLon) ? parsedLon : undefined,
      };

      const response = await this.#model.addNewStory(modelPayload);
      //  console.log('log response',response)
      if (!response.ok) {
        console.log('response : error :', response);
        this.#view.storeFailed(response.message);
        return;
      }
      // this.#view.storeSuccesFully(response.message, response.data);
    } catch (error) {
      console.error('addNewStory (Presenter): error:', error);
      this.#view.storeFailed(error.message);
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
