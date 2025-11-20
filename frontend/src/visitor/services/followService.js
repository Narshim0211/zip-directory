import api from "../../api/axios";

// Use unified follow API at /v1/follow
const follow = async (id, type) => {
  const { data } = await api.post(`/v1/follow/${id}`);
  return data;
};

const unfollow = async (id, type) => {
  const { data } = await api.delete(`/v1/follow/${id}`);
  return data;
};

const getFollowing = async () => {
  const { data } = await api.get("/v1/follow/following");
  // Extract array from nested response
  return data.data || [];
};

export default { follow, unfollow, getFollowing };
