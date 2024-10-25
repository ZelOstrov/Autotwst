# Playwright Test Run Guide for Windows

## 1. Installing Node.js (if not already installed)
1. Check if Node.js is already installed:
   ```bash
   node -v
   npm -v
   ````
2. Visit the official Node.js website [Node.js](https://nodejs.org/en/) and download the LTS version (recommended). 
3. Run the installer and follow the instructions.
4. After installation, open the command prompt (cmd) or PowerShell and verify Node.js is installed correctly by running:

   ```bash
   node -v
   npm -v

## 2. Setting Up the Project

1. Unzip the project folder zelenyjostrov to a convenient location on your computer.
2. Open the command prompt or PowerShell and navigate to the project folder:

   ```bash
   cd path_to_project_folder/zelenyjostrov

3. Install all necessary dependencies listed in the package.json file by running:

   ```bash
   npm install  
   ```

## 3. Installing Browsers for Playwright:
   
For Playwright to run the tests correctly, you need to install the required browsers. Execute the following command:

```bash
  npx playwright install chromium
```

## 4. Setting Up Environment Variables (env)

   Fill the .env file with the required variables:
   ```
   ENDPOINT_FOR_REPORT=
   MAILSAC_API_KEY=
   TEST_NAME=
   TEST_EMAIL=
   TEST_PHONE_NUMBER=
   STORE_NAME_FOR_DELIVERY_OPTION=
   ```
   1. ENDPOINT_FOR_REPORT - specify the endpoint to which the test results will be sent.
   2. MAILSAC_API_KEY - generate it here: https://mailsac.com/v2/credentials
   3. TEST_NAME - specify the name that will be used when placing an order.
   4. TEST_EMAIL - specify the email that will be used when placing an order. This should be any email from https://mailsac.com/.
   5. TEST_PHONE_NUMBER - specify the phone number that will be used when placing an order.
   6. STORE_NAME_FOR_DELIVERY_OPTION - specify the store name that will be selected as the pickup point for the order. Important: Enter the store name exactly as it appears on the store selection button during the checkout process, or the test will fail to click the button.
      
   These variables are required for the tests to run correctly and for reports to be sent.

## 3. Running the Tests

After all dependencies are installed, run the tests with the following command:

```bash
   npx playwright test
```
## 4. Opening the HTML Report After Tests (Optional)

After the tests are executed, you can open the test report by running:
```bash
npx playwright show-report
```

## 5. Playwright Configuration Description

The project uses a Playwright configuration file (playwright.config.ts) which manages settings for running tests. Below are the key parameters:

### 5.1 fullyParallel

  `fullyParallel: true` — this setting allows running tests in fully parallel mode. This means all tests will run simultaneously in separate threads. If you want to run tests sequentially, set `true` to `false`.

### 5.2 baseURL
  `baseURL` — this is the base URL used for all tests. It defines which environment the tests will run on. Ensure the URL does not end with a `/`, as it can cause test failures. The URL should look like: `http://127.0.0.1:3000` or  `https://www.test.com`

### 5.3 headless
`headless` — this setting determines whether the browser should run in headless mode (without a graphical interface). If `headless: true`, the browser will run without a GUI, which can speed up test execution by reducing system load. Set `false` if you need to visually observe the tests.
