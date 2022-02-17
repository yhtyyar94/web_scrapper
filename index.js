const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const PORT = process.env.PORT || 5000;
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

// amazon web scrapper
const { search } = require("./amazon");

app.get("/", (req, res) => {
  res.send("Hello World!!!");
});

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
