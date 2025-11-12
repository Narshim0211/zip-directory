import api from "../../api/axios";

// follow by profile type and id. type: 'owner' | 'visitor' | undefined (legacy user id)
const follow = async (id, type) => {
  if (type === 'owner') {
    const { data } = await api.post(`/v1/owner-profiles/${id}/follow`);
    return data;
  }
  if (type === 'visitor') {
    const { data } = await api.post(`/v1/visitor-profiles/${id}/follow`);
    return data;
  }
  // legacy
  const { data } = await api.post(`/follow/follow/${id}`);
  return data;
};

const unfollow = async (id, type) => {
  if (type === 'owner') {
    const { data } = await api.delete(`/v1/owner-profiles/${id}/follow`);
    return data;
  }
  if (type === 'visitor') {
    const { data } = await api.delete(`/v1/visitor-profiles/${id}/follow`);
    return data;
  }
  const { data } = await api.delete(`/follow/unfollow/${id}`);
  return data;
};

const getFollowing = async () => {
  const { data } = await api.get("/follow/following");
  return data;
};

export default { follow, unfollow, getFollowing };
