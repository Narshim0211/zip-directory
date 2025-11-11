import api from "../../api/axios";

const follow = async (id) => {
  const { data } = await api.post(`/follow/follow/${id}`);
  return data;
};

const unfollow = async (id) => {
  const { data } = await api.delete(`/follow/unfollow/${id}`);
  return data;
};

const getFollowing = async () => {
  const { data } = await api.get("/follow/following");
  return data;
};

export default { follow, unfollow, getFollowing };
