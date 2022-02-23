const cheerio = require("cheerio");
const request = require("request");

exports.randomSearch = (req, res) => {
  const { title } = req.query;
  const { page = 1 } = req.query;

  request(
    `https://www.amazon.com/s?k=${title?.split(" ").join("+")}${
      page > 1 && "&page=" + page
    }`,
    (error, response, html) => {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
        const arr = [];

        const src = $(".s-image");
        src.each((i, el) => {
          const imageSrc = $(el).attr("src");
          arr[i] = {
            imageSrc,
          };
          $(el).parent().parent().removeAttr("href");
        });

        const title = $("div h2 a span");
        title.each((i, el) => {
          const title = $(el).text();
          arr[i] = {
            ...arr[i],
            title,
          };
        });

        const url = $("div h2 a span");
        url.each((i, el) => {
          const url = $(el).parent().attr("href");
          arr[i] = {
            ...arr[i],
            url: "https://www.amazon.com" + url,
            id: url.includes("dp/")
              ? url.substring(url.indexOf("dp/") + 3, url.indexOf("dp/") + 13)
              : url.includes("slredirect")
              ? url.substring(url.indexOf("%2FB") + 3, url.indexOf("%2FB") + 13)
              : undefined,
          };
          $(el).parent().removeClass();
        });

        const rating = $("a i span");
        rating.each((i, el) => {
          const rating = $(el).text();
          arr[i] = {
            ...arr[i],
            rating,
          };
        });

        const originalPrice = $("span.a-price.a-text-price");
        originalPrice.each((i, el) => {
          const url = $(el).parent().attr("href");
          const originalPrice = $(el).text();
          for (let index = 0; index < arr.length; index++) {
            if (arr[index].url == "https://www.amazon.com" + url) {
              arr[index] = {
                ...arr[index],
                originalPrice: originalPrice?.substring(
                  1,
                  originalPrice.length / 2
                ),
              };
            }
          }
          $(el).removeClass();
        });

        const salesPrice = $("span.a-price");
        salesPrice.each((i, el) => {
          const url = $(el).parent().attr("href");
          const salesPrice = $(el).text();
          for (let index = 0; index < arr.length; index++) {
            if (arr[index].url == "https://www.amazon.com" + url) {
              arr[index] = {
                ...arr[index],
                salesPrice: salesPrice?.substring(1, salesPrice.length / 2),
                currency: salesPrice?.substring(0, 1),
              };
            }
          }
        });

        res.json(arr.filter((item) => item.title && item.url));
      } else {
        res.json(error ? error.message : error);
      }
    }
  );
};
