const router = require("express").Router();
const {
  reviewProductDetails,
} = require("../controllers/amazon/reviewProductDetails");
const { randomSearch } = require("../controllers/amazon/searchProducts");

router.get("/search", randomSearch);
router.get("/review/:product_id", reviewProductDetails);

module.exports = router;
