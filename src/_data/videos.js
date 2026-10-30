const path = require("path");

const MIME_BY_EXT = {
  ".mp4": "video/mp4",
  ".m4v": "video/mp4",
  ".webm": "video/webm",
  ".ogv": "video/ogg",
  ".ogg": "video/ogg",
  ".mov": "video/quicktime",
};

function fileNameFor(file) {
  return String(file || "").replace(/^\.?\/?(videos\/)?/, "");
}

module.exports = function () {
  const { videos = [] } = require("./videos-manifest.json");

  return videos
    .map((item) => {
      const file = fileNameFor(item.file);
      if (!file) return null;

      const ext = path.extname(file).toLowerCase();
      const poster = fileNameFor(item.poster);

      return {
        src: `./videos/${file}`,
        type: MIME_BY_EXT[ext] || "video/mp4",
        title: item.title || "",
        poster: poster ? `./videos/${poster}` : "",
      };
    })
    .filter(Boolean);
};
