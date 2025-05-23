import { reportMapper } from '../../data/api-mapper';

export default class DetailPresenter {
  #reportId;
  #view;
  #apiModel;

  constructor(reportId, { view, apiModel }) {
    this.#reportId = reportId;
    this.#view = view;
    this.#apiModel = apiModel;
  }

  async showDetailMap() {
    console.log('apiModel in showStoryDetail:', this.#apiModel);

    // this.#view.showMapLoading();

    try {
      const lihat = await this.#view.initialMap();
      console.log('initialmap log', lihat);
    } catch (error) {
      console.error('showDetailMap: error:', error);
    } finally {
      //  this.#view.hideMapLoading();
    }
  }

  async showStoryDetail() {
    this.#view.showLoadingItem();
    try {
      const response = await this.#apiModel.fetchStoryById(this.#reportId);
      console.log('response', response);

      if (!response.ok) {
        console.error('showStoryDetail: error:', response.message);
        return;
      }

      const report = await reportMapper(response.story);
      console.log(report);

      this.#view.populateStoryAndInitailMap(response.message, report);
    } catch (error) {
      console.error('showStoryDetail: error:', error);
    } finally {
      this.#view.hideLoadingItem();
    }
  }
}
