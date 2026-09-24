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

  eleventyConfig.addPassthroughCopy("src/gallery");
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