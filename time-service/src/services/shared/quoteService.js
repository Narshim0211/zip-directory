/**
 * Quote Service
 * Manages quotes for both Visitor and Owner users
 * Provides daily inspiration and motivation
 */
const Quote = require('../../models/shared/Quote');

class QuoteService {
  /**
   * Get random quote
   * @param {string} category - Optional category filter (motivation, productivity, health, etc)
   * @returns {Promise<Object>} Random quote
   */
  async getRandomQuote(category = null) {
    try {
      const query = {
        isActive: true,
        featured: true,
      };

      if (category) {
        query.category = category;
      }

      const count = await Quote.countDocuments(query);

      if (count === 0) {
        // Fallback: get any active quote
        const fallbackCount = await Quote.countDocuments({ isActive: true });
        if (fallbackCount === 0) {
          return this.getDefaultQuote();
        }

        const random = Math.floor(Math.random() * fallbackCount);
        const quote = await Quote.findOne({ isActive: true }).skip(random).lean();
        return quote || this.getDefaultQuote();
      }

      const random = Math.floor(Math.random() * count);
      const quote = await Quote.findOne(query).skip(random).lean();

      // Track usage
      if (quote) {
        await Quote.findByIdAndUpdate(quote._id, {
          $inc: { usageCount: 1 },
        });
      }

      console.log(`[QuoteService] Retrieved random quote: "${quote?.content.substring(0, 50)}..."`);
      return quote || this.getDefaultQuote();
    } catch (error) {
      console.error('[QuoteService] getRandomQuote error:', error.message);
      return this.getDefaultQuote();
    }
  }

  /**
   * Get featured quotes
   * @param {string} category - Optional category filter
   * @param {number} limit - Number of quotes to return
   * @returns {Promise<Array>} Array of featured quotes
   */
  async getFeaturedQuotes(category = null, limit = 10) {
    try {
      const query = {
        isActive: true,
        featured: true,
      };

      if (category) {
        query.category = category;
      }

      const quotes = await Quote.find(query)
        .sort({ rating: -1, usageCount: -1 })
        .limit(limit)
        .lean();

      console.log(`[QuoteService] Retrieved ${quotes.length} featured quotes`);
      return quotes;
    } catch (error) {
      console.error('[QuoteService] getFeaturedQuotes error:', error.message);
      return [];
    }
  }

  /**
   * Get quotes by category
   * @param {string} category - Category name
   * @param {number} limit - Number of quotes to return
   * @returns {Promise<Array>} Array of quotes in category
   */
  async getQuotesByCategory(category, limit = 20) {
    try {
      const quotes = await Quote.find({
        category,
        isActive: true,
      })
        .sort({ rating: -1 })
        .limit(limit)
        .lean();

      console.log(`[QuoteService] Retrieved ${quotes.length} quotes for category: ${category}`);
      return quotes;
    } catch (error) {
      console.error('[QuoteService] getQuotesByCategory error:', error.message);
      return [];
    }
  }

  /**
   * Get all categories
   * @returns {Promise<Array>} Array of available categories
   */
  async getCategories() {
    try {
      const categories = await Quote.distinct('category', { isActive: true });
      return categories;
    } catch (error) {
      console.error('[QuoteService] getCategories error:', error.message);
      return [];
    }
  }

  /**
   * Create new quote (admin only)
   * @param {object} quoteData - Quote data
   * @returns {Promise<Object>} Created quote
   */
  async createQuote(quoteData) {
    try {
      const quote = new Quote(quoteData);
      await quote.save();

      console.log(`[QuoteService] Created quote: "${quoteData.content.substring(0, 50)}..."`);
      return quote.toObject();
    } catch (error) {
      console.error('[QuoteService] createQuote error:', error.message);
      throw new Error(`Failed to create quote: ${error.message}`);
    }
  }

  /**
   * Update quote (admin only)
   * @param {string} quoteId - Quote ID
   * @param {object} updates - Updates to apply
   * @returns {Promise<Object>} Updated quote
   */
  async updateQuote(quoteId, updates) {
    try {
      const quote = await Quote.findByIdAndUpdate(quoteId, updates, {
        new: true,
        runValidators: true,
      });

      if (!quote) {
        throw new Error('Quote not found');
      }

      console.log(`[QuoteService] Updated quote ${quoteId}`);
      return quote.toObject();
    } catch (error) {
      console.error('[QuoteService] updateQuote error:', error.message);
      throw error;
    }
  }

  /**
   * Default quote (fallback)
   * @returns {Object} Default quote object
   */
  getDefaultQuote() {
    return {
      _id: 'default',
      content: 'Every moment is a fresh beginning. Embrace it with open arms and an open heart.',
      author: 'SalonHub',
      category: 'motivation',
      featured: true,
      isActive: true,
      usageCount: 0,
      rating: 5,
      tags: ['motivation', 'inspiration', 'new-beginnings'],
    };
  }
}

module.exports = new QuoteService();
