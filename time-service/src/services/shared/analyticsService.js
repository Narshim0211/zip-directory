/**
 * Analytics Service
 * Provides metrics and insights for both Visitor and Owner users
 */
const VisitorTask = require('../../models/visitor/VisitorTask');
const VisitorGoal = require('../../models/visitor/VisitorGoal');
const VisitorReflection = require('../../models/visitor/VisitorReflection');
const OwnerTask = require('../../models/owner/OwnerTask');
const OwnerGoal = require('../../models/owner/OwnerGoal');
const OwnerReflection = require('../../models/owner/OwnerReflection');

class AnalyticsService {
  /**
   * Get visitor analytics
   * @param {string} userId - User ID
   * @param {string} period - Period (daily, weekly, monthly)
   * @returns {Promise<Object>} Analytics object
   */
  async getVisitorAnalytics(userId, period = 'daily') {
    try {
      const dateRange = this.getDateRange(period);

      const [
        totalTasks,
        completedTasks,
        activeTasks,
        totalGoals,
        activeGoals,
        completedGoals,
        reflectionsCount,
        taskCompletion,
        moodTrend,
      ] = await Promise.all([
        VisitorTask.countDocuments({ userId, createdAt: { $gte: dateRange.start } }),
        VisitorTask.countDocuments({
          userId,
          isCompleted: true,
          completedAt: { $gte: dateRange.start },
        }),
        VisitorTask.countDocuments({ userId, isCompleted: false }),
        VisitorGoal.countDocuments({ userId, createdAt: { $gte: dateRange.start } }),
        VisitorGoal.countDocuments({ userId, status: 'active' }),
        VisitorGoal.countDocuments({ userId, status: 'completed' }),
        VisitorReflection.countDocuments({ userId, date: { $gte: dateRange.start } }),
        this.calculateTaskCompletion(userId, dateRange.start),
        this.getMoodTrend(userId, dateRange.start),
      ]);

      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const analytics = {
        period,
        dateRange,
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          active: activeTasks,
          completionRate,
        },
        goals: {
          total: totalGoals,
          active: activeGoals,
          completed: completedGoals,
          completionRate: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0,
        },
        reflections: {
          total: reflectionsCount,
          moodTrend,
        },
        insights: this.generateVisitorInsights(
          completionRate,
          activeTasks,
          activeGoals,
          reflectionsCount
        ),
      };

      console.log(`[AnalyticsService] Generated visitor analytics for user ${userId}`);
      return analytics;
    } catch (error) {
      console.error('[AnalyticsService] getVisitorAnalytics error:', error.message);
      throw new Error(`Failed to generate analytics: ${error.message}`);
    }
  }

  /**
   * Get owner analytics
   * @param {string} userId - User ID
   * @param {string} businessId - Business ID
   * @param {string} period - Period (daily, weekly, monthly)
   * @returns {Promise<Object>} Analytics object
   */
  async getOwnerAnalytics(userId, businessId, period = 'daily') {
    try {
      const dateRange = this.getDateRange(period);

      const [
        totalTasks,
        completedTasks,
        inProgressTasks,
        blockedTasks,
        totalGoals,
        activeGoals,
        completedGoals,
        reflectionsCount,
        taskCompletion,
        teamPerformance,
      ] = await Promise.all([
        OwnerTask.countDocuments({
          userId,
          businessId: businessId || { $exists: true },
          createdAt: { $gte: dateRange.start },
        }),
        OwnerTask.countDocuments({
          userId,
          businessId: businessId || { $exists: true },
          status: 'completed',
          updatedAt: { $gte: dateRange.start },
        }),
        OwnerTask.countDocuments({
          userId,
          businessId: businessId || { $exists: true },
          status: 'in-progress',
        }),
        OwnerTask.countDocuments({
          userId,
          businessId: businessId || { $exists: true },
          status: 'blocked',
        }),
        OwnerGoal.countDocuments({
          userId,
          businessId: businessId || { $exists: true },
          createdAt: { $gte: dateRange.start },
        }),
        OwnerGoal.countDocuments({
          userId,
          businessId: businessId || { $exists: true },
          status: 'active',
        }),
        OwnerGoal.countDocuments({
          userId,
          businessId: businessId || { $exists: true },
          status: 'completed',
        }),
        OwnerReflection.countDocuments({
          userId,
          businessId: businessId || { $exists: true },
          date: { $gte: dateRange.start },
        }),
        this.calculateOwnerTaskCompletion(userId, businessId, dateRange.start),
        this.getTeamPerformance(userId, businessId),
      ]);

      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const analytics = {
        period,
        dateRange,
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          inProgress: inProgressTasks,
          blocked: blockedTasks,
          completionRate,
        },
        goals: {
          total: totalGoals,
          active: activeGoals,
          completed: completedGoals,
          completionRate: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0,
        },
        reflections: {
          total: reflectionsCount,
        },
        team: teamPerformance,
        insights: this.generateOwnerInsights(
          completionRate,
          blockedTasks,
          inProgressTasks,
          teamPerformance
        ),
      };

      console.log(`[AnalyticsService] Generated owner analytics for user ${userId}`);
      return analytics;
    } catch (error) {
      console.error('[AnalyticsService] getOwnerAnalytics error:', error.message);
      throw new Error(`Failed to generate analytics: ${error.message}`);
    }
  }

  /**
   * Get date range based on period
   * @param {string} period - Period (daily, weekly, monthly)
   * @returns {Object} Date range object
   */
  getDateRange(period) {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case 'daily':
        start.setDate(start.getDate() - 1);
        break;
      case 'weekly':
        start.setDate(start.getDate() - 7);
        break;
      case 'monthly':
        start.setMonth(start.getMonth() - 1);
        break;
      default:
        start.setDate(start.getDate() - 1);
    }

    return { start, end };
  }

  /**
   * Calculate task completion percentage
   * @param {string} userId - User ID
   * @param {Date} startDate - Start date
   * @returns {Promise<number>} Completion percentage
   */
  async calculateTaskCompletion(userId, startDate) {
    try {
      const total = await VisitorTask.countDocuments({
        userId,
        createdAt: { $gte: startDate },
      });

      const completed = await VisitorTask.countDocuments({
        userId,
        isCompleted: true,
        completedAt: { $gte: startDate },
      });

      return total > 0 ? Math.round((completed / total) * 100) : 0;
    } catch (error) {
      console.error('[AnalyticsService] calculateTaskCompletion error:', error.message);
      return 0;
    }
  }

  /**
   * Calculate owner task completion percentage
   * @param {string} userId - User ID
   * @param {string} businessId - Business ID
   * @param {Date} startDate - Start date
   * @returns {Promise<number>} Completion percentage
   */
  async calculateOwnerTaskCompletion(userId, businessId, startDate) {
    try {
      const query = { userId, createdAt: { $gte: startDate } };
      if (businessId) query.businessId = businessId;

      const total = await OwnerTask.countDocuments(query);

      const completedQuery = { ...query, status: 'completed' };
      const completed = await OwnerTask.countDocuments(completedQuery);

      return total > 0 ? Math.round((completed / total) * 100) : 0;
    } catch (error) {
      console.error('[AnalyticsService] calculateOwnerTaskCompletion error:', error.message);
      return 0;
    }
  }

  /**
   * Get mood trend for visitor
   * @param {string} userId - User ID
   * @param {Date} startDate - Start date
   * @returns {Promise<Object>} Mood trend data
   */
  async getMoodTrend(userId, startDate) {
    try {
      const reflections = await VisitorReflection.find({
        userId,
        date: { $gte: startDate },
      })
        .select('mood date')
        .sort({ date: 1 })
        .lean();

      const moodCounts = {};
      reflections.forEach((r) => {
        moodCounts[r.mood] = (moodCounts[r.mood] || 0) + 1;
      });

      return {
        distribution: moodCounts,
        average: reflections.length > 0 ? Math.round(reflections.length / 7) : 0, // Average per day
      };
    } catch (error) {
      console.error('[AnalyticsService] getMoodTrend error:', error.message);
      return { distribution: {}, average: 0 };
    }
  }

  /**
   * Get team performance metrics
   * @param {string} userId - User ID
   * @param {string} businessId - Business ID
   * @returns {Promise<Object>} Team performance data
   */
  async getTeamPerformance(userId, businessId) {
    try {
      const query = { userId };
      if (businessId) query.businessId = businessId;

      const teamTasks = await OwnerTask.find({ ...query, isTeamTask: true })
        .select('status assignedTo')
        .lean();

      const performanceByTeamMember = {};
      teamTasks.forEach((task) => {
        const memberId = task.assignedTo?.toString() || 'unassigned';
        if (!performanceByTeamMember[memberId]) {
          performanceByTeamMember[memberId] = {
            total: 0,
            completed: 0,
          };
        }
        performanceByTeamMember[memberId].total++;
        if (task.status === 'completed') {
          performanceByTeamMember[memberId].completed++;
        }
      });

      return {
        totalTeamTasks: teamTasks.length,
        memberPerformance: performanceByTeamMember,
      };
    } catch (error) {
      console.error('[AnalyticsService] getTeamPerformance error:', error.message);
      return { totalTeamTasks: 0, memberPerformance: {} };
    }
  }

  /**
   * Generate insights for visitor
   * @returns {Array<string>} Array of insight messages
   */
  generateVisitorInsights(completionRate, activeTasks, activeGoals, reflectionsCount) {
    const insights = [];

    if (completionRate >= 80) {
      insights.push('🎉 Excellent task completion rate! Keep up the momentum!');
    } else if (completionRate >= 50) {
      insights.push('💪 Good progress on your tasks. Try to complete more!');
    } else if (completionRate > 0) {
      insights.push('📈 Focus on completing pending tasks to boost your productivity.');
    }

    if (activeTasks > 10) {
      insights.push('⚠️  You have many active tasks. Consider prioritizing or delegating.');
    }

    if (activeGoals > 0) {
      insights.push('🎯 Great job working towards your goals!');
    }

    if (reflectionsCount > 0) {
      insights.push('📝 Reflections help with self-awareness and growth.');
    }

    return insights;
  }

  /**
   * Generate insights for owner
   * @returns {Array<string>} Array of insight messages
   */
  generateOwnerInsights(completionRate, blockedTasks, inProgressTasks, teamPerformance) {
    const insights = [];

    if (completionRate >= 75) {
      insights.push('🚀 Excellent business performance! Tasks are flowing smoothly.');
    } else if (completionRate >= 50) {
      insights.push('📊 Steady progress. Consider addressing bottlenecks to improve.');
    } else {
      insights.push('⚠️  Task completion is low. Review your workflow and priorities.');
    }

    if (blockedTasks > 0) {
      insights.push(`🚧 ${blockedTasks} tasks are blocked. Address these blockers.`);
    }

    if (inProgressTasks > 5) {
      insights.push('💼 Many tasks in progress. Ensure team is not overwhelmed.');
    }

    return insights;
  }
}

module.exports = new AnalyticsService();
