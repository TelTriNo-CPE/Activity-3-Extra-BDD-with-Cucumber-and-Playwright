const { Before, After, setDefaultTimeout } = require("@cucumber/cucumber");
const { chromium } = require("playwright");

setDefaultTimeout(60 * 1000);

Before(async function () {
  this.browser = await chromium.launch({ headless: this.headless });
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
  this.page.setDefaultTimeout(10_000);
});

After(async function (scenario) {
  // เก็บหลักฐานเมื่อ fail
  if (scenario.result?.status === "FAILED") {
    try {
      await this.page.screenshot({ path: `evidence/${Date.now()}_failed.png`, fullPage: true });
    } catch (e) { }
  }

  await this.context?.close();
  await this.browser?.close();
});
