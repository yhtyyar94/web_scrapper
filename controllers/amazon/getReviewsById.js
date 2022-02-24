const cheerio = require("cheerio");
const request = require("request");

exports.getReviewsById = (req, res) => {
  const { product_id } = req.params;
  const { page = 1 } = req.query;

  request(
    `https://www.amazon.com/product-reviews/${product_id}?pageNumber=${page}`,
    (error, response, html) => {
      if (response.statusCode == 404) {
        res
          .status(404)
          .json({ message: `Sorry we didn't find this item... :(` });
      }

      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
        const result = {
          numberOfRatings: "",
          reviews: [],
        };
        const numberOfRatings = $(
          "div#filter-info-section div.a-row.a-spacing-base.a-size-base"
        )
          .text()
          ?.trim();
        result.numberOfRatings = numberOfRatings;
        const reviews = $(
          "div#cm_cr-review_list div.a-section.review.aok-relative"
        );
        reviews.each((i, el) => {
          const authorImage = $(el)
            .find(".a-profile-avatar")
            .find("img")
            .attr("data-src");
          const authorName = $(el).find(".a-profile-name").text();
          const rating = $(el).find(".a-icon-alt").text(); // check length
          const reviewTitle = $(el).find("a.review-title").text()?.trim();
          const reviewdate = $(el)
            .find(".a-size-base.a-color-secondary.review-date")
            .text()
            ?.trim();
          const reviewBody = $(el)
            .find(".a-row.a-spacing-small.review-data")
            .text()
            ?.trim();
          result.reviews.push({
            authorImage,
            authorName,
            rating:
              rating?.length > 18
                ? rating.substring(0, rating.length / 2)
                : rating,
            reviewTitle,
            reviewdate,
            reviewBody,
          });
        });

        res.json(result);
      }
    }
  );
};
