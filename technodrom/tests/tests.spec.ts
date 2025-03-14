import {test, expect, request} from '@playwright/test';


const locators = {
  productOfTheDayBlock: (page) => page.locator('.hp-main-desktop__banner-wrapper'),
  productLink: (page) => locators.productOfTheDayBlock(page).locator('a[href^="/catalog/detail/"]').first(),
  productImage: (page) => locators.productLink(page).locator('img[src^="/upload/iblock/"]').first(),
  cartItem: (page) => page.locator('.cart-goods__table-element').first(),
  nameInput: (page) => page.locator('.mof__personal-individual input[type="text"]').first(),
  phoneInput: (page) => page.locator('#phone-input'),
  emailInput: (page) => page.locator('div').filter({ hasText: /^Ваш email$/ }).getByPlaceholder(' '),
  completeOrderButton: (page) => page.getByRole('link', { name: 'Завершить оформление' }),
  orderNumberElement: (page) => page.locator('.sale_order_full_table tbody tr td p b'),
};

test('Проверка доступности сайта', async ({ page }) => {
  const response = await page.goto('');
  expect(response?.status(), `Сайт недоступен: получен статус ${response?.status()}`).toBe(200);
});


test('Проверка наличия блока "Товар дня" и элементов внутри', async ({ page }) => {
  await page.goto('');

  await expect(locators.productOfTheDayBlock(page), 'Блок "Товар дня" не найден на странице').toBeVisible();
  await expect(locators.productLink(page), 'Ссылка на товар в блоке "Товар дня" не найдена').toBeVisible();

  const productName = await locators.productLink(page).innerText();
  await expect(locators.productImage(page), 'Картинка товара в блоке "Товар дня" не найдена').toBeVisible();

  await locators.productLink(page).click({ force: true });
  //await page.waitForLoadState('load');

  //const productPageTitleText = await locators.productPageTitle(page).innerText();
  //await expect(locators.productPageTitle(page), 'Заголовок страницы товара не найден или некорректен').toBeVisible();
  //expect(productPageTitleText.toLowerCase(), `Заголовок страницы товара "${productPageTitleText}" не содержит ожидаемое название "${productName}"`)
  //    .toContain(productName.toLowerCase());
});

test('Проверка блока "Чаще всего ищут"', async ({ page }) => {
  await page.goto('');

  const searchTrack = page.locator('div.hp-top-search__track');
  const searchItems = searchTrack.locator('a.hp-top-search__element');
  await expect(searchItems, 'Количество элементов в блоке отличается от 8').toHaveCount(8);

  for (let i = 0; i < 8; i++) {
    const item = searchItems.nth(i);
    const categoryName = await item.locator('div.hp-top-search__name').innerText();

    await item.click();
    await page.waitForLoadState('load');

    const pageTitle = await page.locator('h1').innerText();
    if (categoryName.toLowerCase() === 'порядок в прихожей') {
      expect(pageTitle, 'Неверный заголовок для категории "порядок в прихожей"').toBe('Организация порядка в прихожей');
    } else if (categoryName.toLowerCase() === 'напольные покрытия, подложки') {
      expect(pageTitle, 'Неверный заголовок для категории "текстиль для столовой"').toBe('Напольные покрытия, подложка');
    } else if (categoryName.toLowerCase() === 'пена, герметики') {
      expect(pageTitle, 'Неверный заголовок для категории "текстиль для столовой"').toBe('Пены, герметики, клеи');
    } else {
      expect(pageTitle.toLowerCase()).toContain(categoryName.toLowerCase(), `Неверный заголовок на странице для категории ${categoryName}`);
    }

    if (i < 7) {
      await page.goBack();
    }
  }
});


test('Добавление товара в корзину', async ({ page }) => {
    const salfetkiUrl = process.env.SALFETKI_TECHNODROM
    await page.goto(salfetkiUrl);
    await page.waitForLoadState('load');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000)
    await page.reload()
    await page.waitForTimeout(2000)

    await page.locator("//a[@class='button button-default add2cart']").first().click();
    await page.waitForTimeout(2000)
    await page.getByRole('link', { name: '25 руб.' }).click();
    await page.waitForLoadState('load');
  await expect(page.locator('#cart-app')).toContainText('Салфетки влажные Эконом 15 шт');
});


test.describe.serial('Оформление заказа и получение емейла', ()=>{
  let orderNumberCleaned: string;

    test('Создание заказа через интерфейс', async ({ page }) => {
    const salfetkiUrl = process.env.SALFETKI_TECHNODROM
    await page.goto(salfetkiUrl);
    await page.waitForLoadState('load');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000)
    await page.reload()
    await page.waitForTimeout(2000)

    await page.locator("//a[@class='button button-default add2cart']").first().click();
    await page.waitForTimeout(2000)
    await page.getByRole('link', { name: '25 руб.' }).click();
    await page.waitForLoadState('load');
    await page.getByRole('link', { name: 'Завершить оформление' })
    const placeOrderButton = page.getByRole('link', { name: 'Оформить заказ' })
    await placeOrderButton.click();

    await locators.nameInput(page).fill(process.env.TEST_NAME);
    const phoneCheckResponse = page.waitForResponse('/ajax/v4/phone-check/');
    await locators.phoneInput(page).pressSequentially(process.env.TEST_PHONE_NUMBER);
    await phoneCheckResponse;
    await locators.emailInput(page).fill(process.env.TEST_EMAIL);

    const pickupOptionButton = page.getByText('Самовывоз');
    await pickupOptionButton.click();

    const storePickup = page.getByText(process.env.STORE_NAME_FOR_DELIVERY_OPTION_TECHNODROM);
    console.log(storePickup)
    await storePickup.click();

    const responsePromise = page.waitForResponse('/_apps/zakaz/place/');
    await locators.completeOrderButton(page).click();

    const response = await responsePromise;
    const responseBody = await response.json();
    const orderId = responseBody.order_id;

    await page.waitForLoadState('domcontentloaded');
    const orderNumberElement = await locators.orderNumberElement(page).innerText();
    orderNumberCleaned = orderNumberElement.replace('№', '').trim();

    expect(orderNumberCleaned, `Неверный номер заказа. Ожидаемый: ${orderId}, Полученный: ${orderNumberCleaned}`).toBe(orderId.toString());
  });
  
  test('Проверка письма с подтверждением заказа на почте', async ({ page }) => { //этот тест не будет работать, если запустить его отдельно от набора тестов
    test.setTimeout(180000); // ожидание емейла максимум 3 минуты
    const requestContext = await request.newContext();
    const mailsacEndpoint = `https://mailsac.com/api/addresses/${process.env.TEST_EMAIL}/messages`;

    let emailData;
    let foundOrderEmail = false;

    for (let i = 0; i < 15; i++) { // ждем нужный емейл около 75 секунд
      const emailResponse = await requestContext.get(mailsacEndpoint, {
        headers: {
          'Mailsac-Key': process.env.MAILSAC_API_KEY,
        },
      });

      const emailList = await emailResponse.json();

      if (emailList.length > 0) {
        for (const email of emailList) {
          const emailSubject = email.subject;
          if (emailSubject.includes(orderNumberCleaned)) {
            emailData = email;
            foundOrderEmail = true;
            break;
          }
        }
      }
      if (foundOrderEmail) {
        break;
      }

      await page.waitForTimeout(5000);
    }

    expect(emailData, 'Письмо с подтверждением заказа не получено').toBeTruthy();
    const emailSubject = emailData.subject;
    expect(emailSubject, `Заголовок письма "${emailSubject}" не содержит номер заказа "${orderNumberCleaned}"`).toContain(orderNumberCleaned);

    await requestContext.dispose();
  });
})
