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

/**
 * Get community insights (hybrid: real data if enough users, seeded otherwise)
 * @param {string} goal - Hair goal (e.g., 'length', 'repair')
 * @param {number} week - Week number in journey
 * @param {number} completion - User's completion percentage (0-100)
 * @returns {Promise<Object>} Community insights with headline, subtext, tip
 */
export async function getCommunityInsights(goal, week, completion) {
  const { data } = await api.get("/hair-goals/community-stats", {
    params: { goal, week, completion }
  });
  return data;
}

// ============================================
// REPORT CARD API FUNCTIONS
// ============================================

/**
 * Get user's Report Card
 * Returns computed aggregates from all weekly check-ins
 */
export async function getReportCard() {
  const { data } = await api.get("/hair-goals/report-card");
  return data;
}

/**
 * Force recompute Report Card
 * Triggers on-demand recalculation of all stats
 */
export async function recomputeReportCard() {
  const { data } = await api.post("/hair-goals/report-card/recompute");
  return data;
}

/**
 * Get habit and harm label mappings
 */
export async function getReportCardLabels() {
  const { data } = await api.get("/hair-goals/report-card/labels");
  return data;
}

/**
 * Get all archived Report Cards
 */
export async function getReportCardArchives() {
  const { data } = await api.get("/hair-goals/report-card/archives");
  return data;
}

/**
 * Archive current Report Card and start fresh
 * @param {string} title - Optional title for the archive (default: "My Hair Journey")
 */
export async function archiveReportCard(title = "My Hair Journey") {
  const { data } = await api.post("/hair-goals/report-card/archives", { title });
  return data;
}

/**
 * Get single archived Report Card by ID
 * @param {string} archiveId - Archive document ID
 */
export async function getReportCardArchiveById(archiveId) {
  const { data } = await api.get(`/hair-goals/report-card/archives/${archiveId}`);
  return data;
}

/**
 * Seed sample Report Card data for testing/demo
 * Creates 12 weeks of sample weekly reports with check-in data
 * WARNING: This will clear existing weekly reports!
 * @param {number} weeks - Number of weeks to generate (default: 12, max: 24)
 */
export async function seedReportCardData(weeks = 12) {
  const { data } = await api.post("/hair-goals/report-card/seed", { weeks });
  return data;
}
