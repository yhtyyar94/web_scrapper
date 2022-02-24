const cheerio = require("cheerio");
const request = require("request");

exports.reviewProductDetails = (req, res) => {
  const { product_id } = req.params;

  request(
    `https://www.amazon.com/dp/${product_id}`,
    (error, response, html) => {
      if (response.statusCode == 404) {
        res
          .status(404)
          .json({ message: `Sorry we didn't find this item... :(` });
      }
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
        const result = {};

        //remove all hidden spans
        $("span").each((i, el) => {
          if ($(el).attr("aria-hidden")) {
            $(el).remove();
          }
        });

        //product title
        const product_title = $("#productTitle").text();
        result.product_title = product_title?.trim();

        const rating = $(
          "a .a-icon.a-icon-star.a-star-4-5 span.a-icon-alt"
        ).text();
        result.rating =
          rating?.length > 18 ? rating.substring(0, rating.length / 2) : rating;

        //price info
        const priceInfo = $(
          "div.a-section.a-spacing-small table.a-lineitem.a-align-top tbody"
        );
        const texts = [];
        priceInfo.children().each((i, el) => {
          $(el)
            .children()
            .each((index, element) => {
              texts.push($(element).text().trim());
            });
        });
        result.priceInfo = {};
        texts.forEach((item, index) => {
          if (index % 2 === 0) {
            result.priceInfo[item] = texts[index + 1];
          }
        });

        //product features
        const features = $(
          "div.a-section.a-spacing-small.a-spacing-top-small table.a-normal.a-spacing-micro tbody"
        );
        const featureTexts = [];
        features.children().each((i, el) => {
          $(el)
            .children()
            .each((index, element) => {
              featureTexts.push($(element).text().trim());
            });
        });
        featureTexts.length != 0 ? (result.productFeatures = {}) : null;
        featureTexts.forEach((item, index) => {
          if (index % 2 === 0) {
            result.productFeatures[item] = featureTexts[index + 1];
          }
        });

        //about item
        const aboutItem = $("div#feature-bullets ul li");
        aboutItem ? (result.itemInfo = []) : null;
        aboutItem.each((i, el) => {
          result.itemInfo.push($(el).text().trim());
        });

        //images
        const images = $("div#imgTagWrapperId img");
        images.each((i, el) => {
          result.imageUrl = $(el).attr("data-old-hires");
        });

        res.json(result);
      }
    }
  );
};
