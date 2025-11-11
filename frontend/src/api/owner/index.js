import api from "../axios";

const prefix = process.env.REACT_APP_OWNER_API_PREFIX || "/owner";

const buildPath = (path) => `${prefix}${path}`;

const ownerApi = {
  get: (path, config) => api.get(buildPath(path), config),
  post: (path, data, config) => api.post(buildPath(path), data, config),
  put: (path, data, config) => api.put(buildPath(path), data, config),
  del: (path, config) => api.delete(buildPath(path), config),
};

export default ownerApi;
