const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const request = require("request");

const getInfo = (url, res) => {
  request(url, (error, response, html) => {
    if (!error && response.statusCode == 200) {
      const $ = cheerio.load(html);
      const arr = [];

      const src = $(".s-image");
      src.each((i, el) => {
        const src = $(el).attr("src");
        arr[i] = {
          src,
        };
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

      const price = $("div a span span.a-offscreen");
      price.each((i, el) => {
        const url = $(el).parent().parent().attr("href");
        const price = $(el).text();
        for (let index = 0; index < arr.length; index++) {
          if (arr[index].url == "https://www.amazon.com" + url) {
            arr[index] = {
              ...arr[index],
              price,
            };
          }
        }
      });
      const amazonId = $("div.s-result-item");
      amazonId.each((i, el) => {
        const amazonId = $(el).attr("data-uuid");
        arr[i] = {
          ...arr[i],
          amazonId,
        };
      });

      res.json(arr);
    }
  });
};

const url = "https://www.amazon.com";

const search = async (item, res) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  await page.focus("#twotabsearchtextbox");
  await page.type("#twotabsearchtextbox", item);
  await page.click("input[type='submit']");
  await page.waitForNavigation();
  const pageUrl = await page.url();
  await browser.close();
  return getInfo(pageUrl, res);
};

module.exports = { search };
