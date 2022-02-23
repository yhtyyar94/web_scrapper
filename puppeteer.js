const puppeteer = require("puppeteer");
const url = "https://www.amazon.com";

const search = async (item) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  await page.focus("#twotabsearchtextbox");
  await page.type("#twotabsearchtextbox", item);
  await page.click("input[type='submit']");
  await page.waitForNavigation();
  const pageUrl = await page.url();
  await browser.close();
};
