const cron = require("node-cron");
const { fetchBeautyNews } = require("../services/newsService");

cron.schedule("0 */3 * * *", async () => {
  console.log("🕒 [newsCron] Refreshing beauty news...");
  try {
    const { added, rotated } = await fetchBeautyNews();
    console.log(`📰 newsCron added ${added} items, rotated ${rotated} items.`);
  } catch (error) {
    console.error("🛑 newsCron error:", error.message);
  }
});
