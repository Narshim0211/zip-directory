import api from "../../api/axios";

const getFeed = async () => {
  const { data } = await api.get('/feed/visitor');
  // Backend returns { items: [...], hasMore: boolean }
  return Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []);
};

export default { getFeed };
