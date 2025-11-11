import api from "../axios";

const prefix = process.env.REACT_APP_VISITOR_API_PREFIX || "/visitor";

const buildPath = (path) => `${prefix}${path}`;

const visitorApi = {
  get: (path, config) => api.get(buildPath(path), config),
  post: (path, data, config) => api.post(buildPath(path), data, config),
};

export default visitorApi;
