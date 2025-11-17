import api from "./axios";

export async function getReports() {
  const { data } = await api.get("/hair-goals/reports");
  return data;
}

export async function getReportById(reportId) {
  const { data } = await api.get(`/hair-goals/reports/${reportId}`);
  return data;
}

export async function saveWeeklyReport(payload) {
  const { data } = await api.post("/hair-goals/reports", payload);
  return data;
}
