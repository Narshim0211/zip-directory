const axios = require("axios");
const News = require("../models/News");

const NEWS_API_URL = "https://newsapi.org/v2/everything";
const NEWS_FETCH_LIMIT = 50;
const CACHE_LIMIT = 250;

const buildQueryParams = () => ({
  q: "hair salon OR beauty OR skincare OR spa OR fashion OR makeup OR cosmetics OR stylist",
  language: "en",
  sortBy: "publishedAt",
  pageSize: NEWS_FETCH_LIMIT,
  apiKey: process.env.NEWS_API_KEY,
});

const fetchBeautyNews = async () => {
  if (!process.env.NEWS_API_KEY) {
    throw new Error("NEWS_API_KEY is missing in the environment");
  }

  const response = await axios.get(NEWS_API_URL, { params: buildQueryParams() });
  const articles = Array.isArray(response.data?.articles) ? response.data.articles : [];

  if (!articles.length) {
    return { added: 0, rotated: 0 };
  }

  const existingUrls = new Set(await News.distinct("url"));
  const unique = articles
    .map((article) => ({
      title: article.title || "Untitled",
      description: article.description || article.content || "",
      url: article.url,
      imageUrl: article.urlToImage || "",
      source: article.source?.name || "SalonHub",
      publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
      category: "beauty",
      fetchedAt: new Date(),
    }))
    .filter((item) => item.url && !existingUrls.has(item.url));

  let added = 0;
  if (unique.length) {
    try {
      await News.insertMany(unique, { ordered: false });
      added = unique.length;
    } catch (insertError) {
      // ignore duplicate key errors if another process inserted
      if (insertError.code !== 11000) {
        throw insertError;
      }
    }
  }

  const total = await News.countDocuments();
  let rotated = 0;
  if (total > CACHE_LIMIT) {
    const excess = total - CACHE_LIMIT;
    const oldest = await News.find()
      .sort({ publishedAt: 1, createdAt: 1 })
      .limit(excess)
      .select("_id");
    const ids = oldest.map((doc) => doc._id);
    const result = await News.deleteMany({ _id: { $in: ids } });
    rotated = result.deletedCount || excess;
  }

  return { added, rotated };
};

const getTrendingNews = async (limit = 6) => {
  return News.find({})
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean();
};

module.exports = {
  fetchBeautyNews,
  getTrendingNews,
};
