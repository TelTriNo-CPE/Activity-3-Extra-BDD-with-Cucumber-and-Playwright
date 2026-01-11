const { Given, When, Then } = require("@cucumber/cucumber");
const { expect } = require("@playwright/test");


// mapping ชื่อสินค้า -> product id ของ SauceDemo (ใช้กับ data-test)
const PRODUCT_IDS = {
  "Sauce Labs Backpack": "sauce-labs-backpack",
  "Sauce Labs Bike Light": "sauce-labs-bike-light",
  "Sauce Labs Bolt T-Shirt": "sauce-labs-bolt-t-shirt",
  "Sauce Labs Fleece Jacket": "sauce-labs-fleece-jacket",
  "Sauce Labs Onesie": "sauce-labs-onesie",
  'Test.allTheThings() T-Shirt (Red)': "test.allthethings-t-shirt-red",
};

function productId(name) {
  return PRODUCT_IDS[name] || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

async function ensureOnProductsPage(page) {
  await expect(page).toHaveURL(/.*inventory\.html$/);
  await expect(page.locator(".title")).toHaveText("Products");
}

async function openCart(page) {
  await page.locator(".shopping_cart_link").click();
  await expect(page).toHaveURL(/.*cart\.html$/);
}

// ---------- GIVEN ----------
Given('the user is logged in as "{word}"', async function (username) {
  const page = this.page;

  await page.goto(this.baseUrl);

  // SauceDemo ใช้รหัสผ่านนี้เสมอใน demo
  const password = "secret_sauce";

  await page.locator('[data-test="username"]').fill(username);
  await page.locator('[data-test="password"]').fill(password);
  await page.locator('[data-test="login-button"]').click();

  await ensureOnProductsPage(page);
});

Given("the user is on the product page", async function () {
  await ensureOnProductsPage(this.page);
});

// ---------- WHEN ----------
When('the user adds "{string}" to the cart', async function (productName) {
  const pid = productId(productName);
  await this.page.locator(`[data-test="add-to-cart-${pid}"]`).click();
});

When('the user removes "{string}" from the cart', async function (productName) {
  const pid = productId(productName);
  await this.page.locator(`[data-test="remove-${pid}"]`).click();
});

When('the user tries to remove "{string}" from the cart', async function (productName) {
  // กรณีไม่ได้อยู่ใน cart: ปุ่ม remove อาจไม่มี ให้ “พยายาม” แล้วไม่พัง
  const pid = productId(productName);
  const removeBtn = this.page.locator(`[data-test="remove-${pid}"]`);
  if (await removeBtn.count()) {
    await removeBtn.click();
  }
});

When("the user opens the cart", async function () {
  await openCart(this.page);
});

When("the user continues shopping", async function () {
  await this.page.locator('[data-test="continue-shopping"]').click();
  await ensureOnProductsPage(this.page);
});

// ---------- THEN ----------
Then("the cart should show {int} item(s)", async function (count) {
  const badge = this.page.locator("span.shopping_cart_badge");

  if (count === 0) {
    await expect(badge).toHaveCount(0);
  } else {
    await expect(badge).toHaveText(String(count));
  }
});

Then('"{string}" should be shown in the cart', async function (productName) {
  // เพื่อให้ไม่ผูกกับ UI มากใน feature: step นี้จะเปิด cart ให้เองถ้ายังไม่ได้เปิด
  if (!this.page.url().includes("cart.html")) {
    await openCart(this.page);
  }
  const item = this.page.locator(".cart_item .inventory_item_name", { hasText: productName });
  await expect(item).toHaveCount(1);
});

Then('"{string}" should not be shown in the cart', async function (productName) {
  if (!this.page.url().includes("cart.html")) {
    await openCart(this.page);
  }
  const item = this.page.locator(".cart_item .inventory_item_name", { hasText: productName });
  await expect(item).toHaveCount(0);
});

Then("the cart should still show {int} item(s)", async function (count) {
  // เหมือนข้อ “should show” แต่ใช้คำใน feature ให้ match
  const badge = this.page.locator("span.shopping_cart_badge");
  if (count === 0) {
    await expect(badge).toHaveCount(0);
  } else {
    await expect(badge).toHaveText(String(count));
  }
});

Then("the cart should be empty", async function () {
  const badge = this.page.locator("span.shopping_cart_badge");
  await expect(badge).toHaveCount(0);

  // ถ้าอยู่ใน cart page ให้เช็ค item = 0 ด้วย
  if (!this.page.url().includes("cart.html")) {
    await openCart(this.page);
  }
  await expect(this.page.locator(".cart_item")).toHaveCount(0);
});

Then("the product page should be displayed", async function () {
  await ensureOnProductsPage(this.page);
});

Then('the user should be able to add "{string}" to the cart again', async function (productName) {
  // assert ว่า add button กลับมา และลองกดเพิ่มให้เห็นว่า “เพิ่มได้จริง”
  const pid = productId(productName);
  const addBtn = this.page.locator(`[data-test="add-to-cart-${pid}"]`);
  await expect(addBtn).toBeVisible();

  await addBtn.click();
  await expect(this.page.locator("span.shopping_cart_badge")).toHaveText("1");
});

// ✅ Add to cart
When('the user adds {string} to the cart', async function (productName) {
  const pid = productId(productName);
  await this.page.locator(`[data-test="add-to-cart-${pid}"]`).click();
});

// ✅ Remove from cart (ปกติ)
When('the user removes {string} from the cart', async function (productName) {
  const pid = productId(productName);
  await this.page.locator(`[data-test="remove-${pid}"]`).click();
});

// ✅ Try remove (กรณีปุ่มไม่มี ไม่ให้พัง)
When('the user tries to remove {string} from the cart', async function (productName) {
  const pid = productId(productName);
  const removeBtn = this.page.locator(`[data-test="remove-${pid}"]`);
  if (await removeBtn.count()) {
    await removeBtn.click();
  }
});

// ✅ Shown / Not shown in cart
Then('{string} should be shown in the cart', async function (productName) {
  if (!this.page.url().includes("cart.html")) {
    await openCart(this.page);
  }
  const item = this.page.locator(".cart_item .inventory_item_name", { hasText: productName });
  await expect(item).toHaveCount(1);
});

Then('{string} should not be shown in the cart', async function (productName) {
  if (!this.page.url().includes("cart.html")) {
    await openCart(this.page);
  }
  const item = this.page.locator(".cart_item .inventory_item_name", { hasText: productName });
  await expect(item).toHaveCount(0);
});

// ✅ Add again
Then('the user should be able to add {string} to the cart again', async function (productName) {
  const pid = productId(productName);
  const addBtn = this.page.locator(`[data-test="add-to-cart-${pid}"]`);
  await expect(addBtn).toBeVisible();

  await addBtn.click();
  await expect(this.page.locator("span.shopping_cart_badge")).toHaveText("1");
});

