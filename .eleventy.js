module.exports = function (eleventyConfig) {
  eleventyConfig.setInputDirectory("src");
  eleventyConfig.setOutputDirectory("_site");

  const monthAbbrs = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

  eleventyConfig.addFilter("diaMes", (dateISO) => {
    if (!dateISO) return "";
    const [, month, day] = String(dateISO).split("-").map((part) => Number(part));
    if (!month) return dateISO;
    return `${day} ${monthAbbrs[month - 1]}`;
  });

  const todayISO = () => {
    const now = new Date();
    return [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");
  };

  eleventyConfig.addFilter("isToday", (dateISO) => {
    if (!dateISO) return false;
    return String(dateISO) === todayISO();
  });

  eleventyConfig.addFilter("upcoming", (shows) => {
    if (!Array.isArray(shows)) return [];
    const today = todayISO();
    return shows.filter((show) => show && String(show.date) >= today);
  });

  eleventyConfig.addPassthroughCopy("src/gallery");
  eleventyConfig.addPassthroughCopy("src/optimized");
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy({ "src/css/site.css": "css/site.css" });
  eleventyConfig.addPassthroughCopy("src/admin/config.yml");
  eleventyConfig.addPassthroughCopy("src/admin/preview.js");

  const rootAssets = [
    "apple-touch-icon.png",
    "android-chrome-192x192.png",
    "android-chrome-512x512.png",
    "bg.webp",
    "CNAME",
    "favicon.png",
    "favico.png",
    "logo.jpeg",
    "logo.png",
    "site.webmanifest",
    "youtube-poster.webp",
  ];
  rootAssets.forEach((file) => eleventyConfig.addPassthroughCopy(`src/${file}`));

  return {
    templateFormats: ["njk", "html", "md"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dir: {
      includes: "_includes",
      data: "_data",
    },
  };
};