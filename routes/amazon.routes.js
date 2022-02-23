const router = require("express").Router();
const amazon = require("../controllers/amazon");

router.get("/search", amazon.randomSearch);

module.exports = router;
