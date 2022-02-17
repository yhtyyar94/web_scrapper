const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const app = express();

// Middlewares
app.use(cors({ origin: true }));
app.use(express.json());

// amazon web scrapper
const { search } = require("./amazon");

app.post("/amazon", async (req, res) => {
  const { title } = req.query;
  await search(title, res);
});

app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Server running on port ${PORT}`);
  }
});
