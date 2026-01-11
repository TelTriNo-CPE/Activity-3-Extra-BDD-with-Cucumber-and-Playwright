const { setWorldConstructor } = require("@cucumber/cucumber");

class CustomWorld {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.baseUrl = process.env.BASE_URL || "https://www.saucedemo.com/";
    this.headless = process.env.HEADLESS === "1"; // default false (เปิด browser ให้เห็น)
  }
}

setWorldConstructor(CustomWorld);
