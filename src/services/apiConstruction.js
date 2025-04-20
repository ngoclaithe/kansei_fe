import apiClient from './apiClient';

const constructionApi = {

  getConstructions: (skip = 0, limit = 100) => {
    return apiClient.get(`/constructions?skip=${skip}&limit=${limit}`);
  },

  getConstruction: (constructionId) => {
    return apiClient.get(`/constructions/${constructionId}`);
  },

  getConstructionByCode: (constructionCode) => {
    return apiClient.get(`/constructions/code/${constructionCode}`);
  },

  createConstruction: (constructionData) => {
    return apiClient.post('/constructions/', constructionData);
  },

  updateConstruction: (constructionId, constructionData) => {
    return apiClient.put(`/constructions/${constructionId}`, constructionData);
  },

  deleteConstruction: (constructionId) => {
    return apiClient.delete(`/constructions/${constructionId}`);
  }
};

export default constructionApi;