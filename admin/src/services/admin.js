import api from '../api/axios';

export async function getOverview() {
  const { data } = await api.get('/admin/stats');
  return data;
}

export async function listPendingBusinesses(limit = 5) {
  const { data } = await api.get('/admin/businesses', { params: { status: 'pending' } });
  return (data?.businesses || []).slice(0, limit);
}

export async function approveBusiness(id) {
  const { data } = await api.put(`/admin/businesses/${id}/approve`);
  return data;
}

export async function rejectBusiness(id) {
  const { data } = await api.put(`/admin/businesses/${id}/reject`);
  return data;
}

export async function listUsers(params = {}) {
  const { data } = await api.get('/admin/users', { params });
  return data;
}

export async function updateUserRole(id, role) {
  const { data } = await api.patch(`/admin/users/${id}/role`, { role });
  return data.user;
}

export async function deleteUser(id) {
  return api.delete(`/admin/users/${id}`);
}

