const axios = require("axios");
const cheerio = require("cheerio");

const searchUrl = "https://www.bing.com/images/search?q=";

exports.getImage = (name) => {
  const searchTerm = searchUrl + encodeURI(name.replace(/\s/g, "+"));
  console.log("[image-search]: ", searchTerm);

  return axios
    .get(searchTerm)
    .then((response) => {
      // Cheerio
      // attribs: attributes
      // text: text
      const $ = cheerio.load(response.data);
      const resultChoice = Math.floor(Math.random() * Math.floor(10));

      let results = [];
      $("img").each(function (i, el) {
        let source = $(this).attr().src;
        if (source && source.includes("https://")) {
          const url = new URL(source);
          const w = parseInt(url.searchParams.get("w")) || 0;
          const h = parseInt(url.searchParams.get("h")) || 0;
          if (w >= 100 && h >= 100) {
            results.push(source);
          }
        }
      });

      return results[resultChoice];
    })
    .catch((e) => {
      console.log(new Date(), "[image-search]: ERROR: ", e);
    });
};
