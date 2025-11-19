const ProfileInsight = require('./profileInsight.model');
const logger = require('../../../utils/logger');

/**
 * Profile Analytics Service
 * Handles business logic for owner profile visit tracking
 * NO duplication - single source of truth for profile analytics
 */
class ProfileInsightService {
  
  /**
   * Record a profile view
   * Called when ANY user (visitor/owner) views a business listing
   */
  async recordView(ownerId) {
    try {
      if (!ownerId) {
        throw new Error('Owner ID is required');
      }
      
      const insight = await ProfileInsight.incrementViews(ownerId);
      
      logger.info(`Profile view recorded for owner: ${ownerId}`);
      
      return {
        success: true,
        data: {
          today: insight.todayViews,
          last7Days: insight.last7DaysViews,
          total: insight.totalViews
        }
      };
    } catch (error) {
      logger.error(`Error recording profile view: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get profile analytics for an owner
   * Returns current metrics for display
   */
  async getInsights(ownerId) {
    try {
      if (!ownerId) {
        throw new Error('Owner ID is required');
      }
      
      let insight = await ProfileInsight.findOne({ ownerId });
      
      // If no analytics exist yet, return zeros
      if (!insight) {
        return {
          success: true,
          data: {
            today: 0,
            last7Days: 0,
            total: 0
          }
        };
      }
      
      // Check if we need to reset counters
      const now = new Date();
      const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      
      let needsSave = false;
      
      if (insight.lastDailyReset < oneDayAgo) {
        insight.todayViews = 0;
        insight.lastDailyReset = now;
        needsSave = true;
      }
      
      if (insight.lastWeeklyReset < sevenDaysAgo) {
        insight.last7DaysViews = 0;
        insight.lastWeeklyReset = now;
        needsSave = true;
      }
      
      if (needsSave) {
        await insight.save();
      }
      
      return {
        success: true,
        data: {
          today: insight.todayViews,
          last7Days: insight.last7DaysViews,
          total: insight.totalViews
        }
      };
    } catch (error) {
      logger.error(`Error fetching profile insights: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new ProfileInsightService();
