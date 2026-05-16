import { test, expect } from "@playwright/test";

const columns = {
  // Column Mapping
  ID: 0,
  LastName: 1,
  FirstName: 2,
  Dependants: 3,
  Salary: 4,
  GrossPay: 5,
  BenefitsCost: 6,
  NetPay: 7,
  Actions: 8,
};

const expectedData = {
  //Reference Dataset to validate against the UI//
  ID: "5666feba-60e7-4bb4-8dfb-f649c4f886ed",
  LastName: "Rogers",
  FirstName: "Steve",
  Dependants: 1,
};

test.describe(`Test Suite for Paylocity Benefits Dashboard`, () => {
  test.beforeEach(async ({ page }) => {
    // LOG IN located in Before Each to avoid hard code in every test
    await page.goto(
      "https://wmxrwq14uc.execute-api.us-east-1.amazonaws.com/Prod/Account/LogIn",
    );

    await expect(page.getByLabel("Username")).toBeVisible({ timeout: 10000 }); // expects and timeouts used to
    // allow resources be fully loaded

    await expect(page.getByLabel("Password")).toBeVisible({ timeout: 10000 });

    await page.getByLabel("Username").fill("TestUser961");
    await page.getByLabel("Password").fill("O0^G]9Cd8N|k");

    await expect(page.getByLabel("Username")).toHaveValue("TestUser961", {
      // Verify inputs are correctly filled before clicking login
      timeout: 15000,
    });
    await expect(page.getByLabel("Password")).toHaveValue("O0^G]9Cd8N|k", {
      timeout: 15000,
    });

    await page.getByRole("button", { name: "Log In" }).click();

    await expect(page.getByLabel("Username")).toBeHidden({ timeout: 10000 }); // Assertions/timeouts made to confirm
    await expect(page.getByLabel("Password")).toBeHidden({ timeout: 10000 }); // correct Log In and handle potential slow connection

    await expect(page).toHaveURL(
      "https://wmxrwq14uc.execute-api.us-east-1.amazonaws.com/Prod/Benefits",
    );

    await page.waitForLoadState("networkidle"); // Ensure page stability and that all resources are loaded

    await page.waitForSelector("#employeesTable tbody", {
      //Wait for the table to be visible and stable
      state: "visible",
      timeout: 20000,
    });

    await page.waitForSelector("#employeesTable tbody tr", {
      //Waiting to content of the table to be visible, avoid empty table
      state: "visible",
      timeout: 20000,
    });
  });

  test(`B-001 UI - Inverted data display in the columns First Name and Last Name`, async ({
    page,
  }) => {
    const row = page.getByRole(`row`, {
      //Locate the specific row using the unique ID from expected dataset
      name: expectedData.ID,
    });

    const cells = row.getByRole(`cell`); //Divide the rows by cells

    const lastNameColumnValue = await cells.nth(columns.LastName).textContent(); //Save the data storaged in the cells of lastName
    const firstNameColumnValue = await cells //and FirstName columns of expectedData
      .nth(columns.FirstName)
      .textContent();

    await expect(lastNameColumnValue).toBe(expectedData.LastName); //Compare the values to see if the UI values match against our dataset
    await expect(firstNameColumnValue).toBe(expectedData.FirstName);

    console.log(
      `The value of the Column Last Name in the Dashboard is: ${lastNameColumnValue}`,
    );
    console.log(
      `The value of the Column Fast Name in the Dashboard is: ${firstNameColumnValue}`,
    );
  });

  test(`B-002 Security - Authentication bypass via Paylocity Benefits Dashboard link in Login Page`, async ({
    page,
  }) => {
    await page.goto(
      `https://wmxrwq14uc.execute-api.us-east-1.amazonaws.com/Prod/Account/LogIn`,
    );

    await page
      .getByRole(`link`, { name: `Paylocity Benefits Dashboard` })
      .click();

    //Check if we can get unauthorized access to the table
    await expect(page).not.toHaveURL(
      `https://wmxrwq14uc.execute-api.us-east-1.amazonaws.com/Prod/Benefits`,
    );
  });

  //Precondition: created a Frank Castle employee before, we are gonna create a new Frank with the same charcateristics
  test(`B-003 UI - Duplicate records in the Benefits Dashboard`, async ({
    page,
  }) => {
    const firstNameOriginal = "Frank";
    const secondNameOriginal = "Castle";
    const dependantsOriginal = "0";

    await expect(page.locator(`table tbody`).first()).toBeVisible();

    // Filtering the table to find all rows that match this specific employee
    const duplicateRows = page
      .getByRole(`row`)
      .filter({ hasText: firstNameOriginal })
      .filter({ hasText: secondNameOriginal })
      .filter({ hasText: dependantsOriginal });

    // Getting the total count of matching records
    const rowCounter = await duplicateRows.count();

    if (rowCounter > 1) {
      console.log(
        `Duplicate register found, data duplicated: ${rowCounter} times`,
      );
    }

    await expect(rowCounter).toBe(1); //Verify it only exist one record for the specified employee
  });

  test(`B-004 UI - Missing error message / alert in First Name / Last Name fields`, async ({
    page,
  }) => {
    await page.getByRole(`button`, { name: `Add Employee` }).click();

    //Boundary Value Test: Testing the UI with a long name
    const longFirstName =
      "Pablo Diego José Francisco de Paula Juan Nepomuceno Crispín Crispiniano María Remedios de la Santísima Trinidad";
    const longLastName = "Ruiz y Picasso";
    const dependantsOfLongName = "4";

    await page
      .locator(`input[name="firstName"]`)
      .pressSequentially(longFirstName); // substitution of ".fill" for ".pressSequentially" to simulate human interaction
    await page
      .locator(`input[name="lastName"]`)
      .pressSequentially(longLastName);
    await page
      .locator(`input[name="dependants"]`)
      .pressSequentially(dependantsOfLongName);
    await page.locator(`#addEmployee`).click();

    //Test to see if the employee was correctly added to our table
    // Test expected to fail due to the API Contract maxLength = 50 and UI fails to show an error message
    await expect(page.getByRole(`row`, { name: longFirstName })).toBeVisible();
  });

  test(`B-005 UI - The system blocks the input without validating it or indicating the allowed limit to the user in Dependants fields`, async ({
    page,
  }) => {
    await page.getByRole(`button`, { name: `Add Employee` }).click();

    //Boundary Value Test: Testing the UI with big quantity of dependants
    const bigDependantFirstName = "Valentina";
    const bigDependantLastName = "Vassilyeva";
    const bigDependant = "69";

    await page
      .locator(`input[name="firstName"]`)
      .pressSequentially(bigDependantFirstName);
    await page
      .locator(`input[name="lastName"]`)
      .pressSequentially(bigDependantLastName);
    await page
      .locator(`input[name="dependants"]`)
      .pressSequentially(bigDependant);
    await page.locator(`#addEmployee`).click();

    // Test expected to fail due to the API Contract dependants maximum = 32 and UI fails to show an error message
    await expect(
      page.getByRole(`row`, { name: bigDependantFirstName }),
    ).toBeVisible();
  });

  // Test to simulate user away from keyboard, set a Timeout to simulate that condition
  test(`B-006 UI - Session Management Timeout Blocker`, async ({ page }) => {
    test.setTimeout(15 * 60 * 1000); // Set a timeout margin of 15 min to interact with UI and simulate afk of 12 min

    await page.getByRole(`button`, { name: `Add Employee` }).click();

    const firstSMFirstName = "Bruce";
    const firstSMLastName = "Wayne";
    const firstDependantsSM = "5";

    const secondSMFirstName = "Talia";
    const secondSMLastName = "AL Ghul";
    const secondDependantSM = "1";

    await page
      .locator(`input[name="firstName"]`)
      .pressSequentially(firstSMFirstName);
    await page
      .locator(`input[name="lastName"]`)
      .pressSequentially(firstSMLastName);
    await page
      .locator(`input[name="dependants"]`)
      .pressSequentially(firstDependantsSM);
    await page.locator(`#addEmployee`).click();

    await page.waitForTimeout(12 * 60 * 1000); //Simulation of user being away 12 min.
    //deleting cookies would prevent UI interaction for the subsequent steps
    //12 min because idk the exact session timeout and i test it with black box method

    const addEmployeeBtn = page.getByRole(`button`, { name: `Add Employee` });
    await expect(addEmployeeBtn).toBeVisible({ timeout: 10000 });
    await expect(addEmployeeBtn).toBeEnabled({ timeout: 10000 });

    await addEmployeeBtn.click();

    await page
      .locator(`input[name="firstName"]`)
      .pressSequentially(secondSMFirstName);
    await page
      .locator(`input[name="lastName"]`)
      .pressSequentially(secondSMLastName);
    await page
      .locator(`input[name="dependants"]`)
      .pressSequentially(secondDependantSM);

    await page.locator(`#addEmployee`).click({ force: true }); //Force the click to test the UI response

    //Test expected to fail due to new data doesnt get show in the table
    await expect(page.getByRole(`row`, { name: `Talia` })).toBeVisible({
      timeout: 5000,
    });
  });

  test(`Happy Path: Add Employee`, async ({ page }) => {
    await page.getByRole(`button`, { name: `Add Employee` }).click();

    const happyFirstNameAdd = "Diana";
    const happyLastNameAdd = "Prince";
    const happyDependantsAdd = "2";

    const firstNameInput = page.locator('input[name="firstName"]');
    await firstNameInput.pressSequentially(happyFirstNameAdd);

    const lastNameInput = page.locator('input[name="lastName"]');
    await lastNameInput.pressSequentially(happyLastNameAdd);

    const dependantsInput = page.locator('input[name="dependants"]');
    await dependantsInput.pressSequentially(happyDependantsAdd);
    await page.locator("#addEmployee").click();

    await expect(page.locator(`#employeesTable tbody`)).toContainText(`Diana`);
  });

  test(`Happy Path: Edit Employee`, async ({ page }) => {
    await page.getByRole(`button`, { name: `Add Employee` }).click();

    const firstNameEditEmployee = "Thor";
    const lastNameEditEmployee = "Odinson";
    const dependantEditEmployee = "0";
    const firstNameUnmasked = "Loki";

    const firstNameInput = page.locator('input[name="firstName"]');
    await firstNameInput.pressSequentially(firstNameEditEmployee);

    const lastNameInput = page.locator('input[name="lastName"]');
    await lastNameInput.pressSequentially(lastNameEditEmployee);

    const dependantsInput = page.locator('input[name="dependants"]');
    await dependantsInput.pressSequentially(dependantEditEmployee);
    await page.locator("#addEmployee").click();

    await expect(page.locator(`#employeesTable tbody`)).toContainText(
      firstNameEditEmployee,
    );

    const row = page
      .locator("#employeesTable tbody tr")
      .filter({ hasText: firstNameEditEmployee });
    await expect(row).toBeVisible({ timeout: 10000 });
    await expect(row).toContainText(firstNameEditEmployee);

    await row.locator(".fa-edit").click();

    const editFirstNameInput = page.locator('input[name="firstName"]');
    await editFirstNameInput.clear();
    await editFirstNameInput.pressSequentially(firstNameUnmasked);
    await page.locator("#updateEmployee").click();

    await expect(page.locator(`#employeesTable tbody`)).toContainText(
      firstNameUnmasked,
    );
  });

  test(`Happy Path: Delete Employee`, async ({ page }) => {
    // Precondition: Be sure to have run first the Test of Edit Employee
    const deleteEmployee = "Loki";
    const row = page
      .locator("#employeesTable tbody tr")
      .filter({ hasText: deleteEmployee });
    await row.locator(".fa-times").click();
    const deleteConfirmBtn = page.locator("#deleteEmployee");
    await deleteConfirmBtn.click();
    await expect(page.locator("#employeesTable tbody")).not.toContainText(
      deleteEmployee,
    );
  });
});
