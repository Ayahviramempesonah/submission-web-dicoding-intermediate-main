export default class HomePresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  //perbaikan
  async initialGalleryAndMap() {
    this.#view.showLoading();

    try {
      const response = await this.#model.fetchStories({ page: 1, size: 10, location: 0 });
      this.#view.storyList(response.listStory);
    } catch (error) {
      console.error('initialGalleryAndMap: error:', error);
      this.#view.populateReportsListError(error.message || 'An error occurred.');
    } finally {
      this.#view.hideLoading();
    }
  }
}
