import api from "../../api/axios";

const getFeed = async () => {
  const { data } = await api.get('/feed/visitor');
  return Array.isArray(data) ? data : [];
};

export default { getFeed };
