const router = require("express").Router();
const { getReviewsById } = require("../controllers/amazon/getReviewsById");
const {
  reviewProductDetails,
} = require("../controllers/amazon/reviewProductDetails");
const { randomSearch } = require("../controllers/amazon/searchProducts");

router.get("/search", randomSearch);
router.get("/review/:product_id", reviewProductDetails);
router.get("/customerReviews/:product_id", getReviewsById);

module.exports = router;
