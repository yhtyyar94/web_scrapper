const cheerio = require("cheerio");
const request = require("request");

exports.randomSearch = (req, res) => {
  const { title } = req.query;
  const { page } = req.query;
  console.log(page);
  request(
    `https://www.amazon.com/s?k=${title?.split(" ").join("+")}${
      page ? "&page=" + page : ""
    }`,
    (error, response, html) => {
      if (response.statusCode == 404) {
        res
          .status(404)
          .json({ message: `Sorry we didn't find this item... :(` });
      }

      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
        const result = [];

        const src = $(".s-image");
        src.each((i, el) => {
          const imageSrc = $(el).attr("src");
          result[i] = {
            imageSrc,
          };
          $(el).parent().parent().removeAttr("href");
        });

        const title = $("div h2 a span");
        title.each((i, el) => {
          const title = $(el).text();
          result[i] = {
            ...result[i],
            title,
          };
        });

        const url = $("div h2 a span");
        url.each((i, el) => {
          const url = $(el).parent().attr("href");
          result[i] = {
            ...result[i],
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
          result[i] = {
            ...result[i],
            rating,
          };
        });

        const originalPrice = $("span.a-price.a-text-price");
        originalPrice.each((i, el) => {
          const url = $(el).parent().attr("href");
          const originalPrice = $(el).text();
          for (let index = 0; index < result.length; index++) {
            if (result[index].url == "https://www.amazon.com" + url) {
              result[index] = {
                ...result[index],
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
          for (let index = 0; index < result.length; index++) {
            if (result[index].url == "https://www.amazon.com" + url) {
              result[index] = {
                ...result[index],
                salesPrice: salesPrice?.substring(1, salesPrice.length / 2),
                currency: salesPrice?.substring(0, 1),
              };
            }
          }
        });

        res.status(200).json(result.filter((item) => item.title && item.url));
      } else {
        res.json(error ? error.message : error);
      }
    }
  );
};
