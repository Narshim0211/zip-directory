import api from '../api/axios';

export async function getOverview() {
  const { data } = await api.get('/api/admin/stats');
  return data;
}

export async function listPendingBusinesses(limit = 5) {
  const { data } = await api.get('/api/admin/businesses', { params: { status: 'pending' } });
  return (data?.businesses || []).slice(0, limit);
}

export async function approveBusiness(id) {
  const { data } = await api.put(`/api/admin/businesses/${id}/approve`);
  return data;
}

export async function rejectBusiness(id) {
  const { data } = await api.put(`/api/admin/businesses/${id}/reject`);
  return data;
}

export async function listUsers(params = {}) {
  const { data } = await api.get('/api/admin/users', { params });
  return data;
}

export async function updateUserRole(id, role) {
  const { data } = await api.patch(`/api/admin/users/${id}/role`, { role });
  return data.user;
}

export async function deleteUser(id) {
  return api.delete(`/api/admin/users/${id}`);
}

