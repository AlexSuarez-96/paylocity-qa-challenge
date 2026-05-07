import { test, expect } from "@playwright/test";

const columns = {
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
  ID: "5666feba-60e7-4bb4-8dfb-f649c4f886ed",
  LastName: "Rogers",
  FirstName: "Steve",
  Dependants: 1,
};

test.describe(`Test Suite for Paylocity Benefits Dashboard`, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(
      `https://wmxrwq14uc.execute-api.us-east-1.amazonaws.com/Prod/Account/LogIn`,
    );

    await page.getByLabel(`Username`).fill(`TestUser961`);
    await page.getByLabel(`Password`).fill(`O0^G]9Cd8N|k`);

    await page.getByRole(`button`, { name: `Log In` }).click();
    await expect(page).toHaveURL(
      `https://wmxrwq14uc.execute-api.us-east-1.amazonaws.com/Prod/Benefits`,
    );
  });

  test(`B-001 UI - Inverted data display in the columns First Name and Last Name`, async ({
    page,
  }) => {
    const row = page.getByRole(`row`, {
      name: expectedData.ID,
    });

    const cells = row.getByRole(`cell`);

    const lastNameColumnValue = await cells.nth(columns.LastName).textContent();
    const firstNameColumnValue = await cells
      .nth(columns.FirstName)
      .textContent();

    await expect(lastNameColumnValue).toBe(expectedData.LastName);
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
    await expect(page).not.toHaveURL(
      `https://wmxrwq14uc.execute-api.us-east-1.amazonaws.com/Prod/Benefits`,
    );
  });

  test(`B-003 UI - Duplicate records in the Benefits Dashboard`, async ({
    page,
  }) => {
    const firstNameOriginal = "Frank";
    const secondNameOriginal = "Castle";
    const dependantsOriginal = "0";

    await expect(page.locator(`table tbody`).first()).toBeVisible();

    const duplicateRows = page
      .getByRole(`row`)
      .filter({ hasText: firstNameOriginal })
      .filter({ hasText: secondNameOriginal })
      .filter({ hasText: dependantsOriginal });
    const rowCounter = await duplicateRows.count();

    if (rowCounter > 1) {
      console.log(
        `Duplicate register found, data duplicated: ${rowCounter} times`,
      );
    }

    await expect(rowCounter).toBe(1);
  });

  test(`B-004 UI - Missing error message / alert in First Name / Last Name fields`, async ({
    page,
  }) => {
    await page.getByRole(`button`, { name: `Add Employee` }).click();

    const longFirstName =
      "Diego María de la Concepción Juan Nepomuceno Estanislao";
    const longLastName = "de la Rivera y Barrientos Acosta y Rodríguez";
    const dependantsOfLongName = "4";

    await page
      .locator(`input[name="firstName"]`)
      .pressSequentially(longFirstName); // substitution of ".fill" for ".pressSequentially"
    await page
      .locator(`input[name="lastName"]`)
      .pressSequentially(longLastName);
    await page
      .locator(`input[name="dependants"]`)
      .pressSequentially(dependantsOfLongName);
    await page.locator(`#addEmployee`).click();

    await expect(page.getByRole(`row`, { name: longFirstName })).toBeVisible();
  });

  test(`B-005 UI - The system blocks the input without validating it or indicating the allowed limit to the user in Dependants fields`, async ({
    page,
  }) => {
    await page.getByRole(`button`, { name: `Add Employee` }).click();

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

    await expect(
      page.getByRole(`row`, { name: bigDependantFirstName }),
    ).toBeVisible();
  });

  test(`B-006 UI - Session Management Timeout Blocker`, async ({
    page,
    context,
  }) => {
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
    await page.locator(`#addEmployee`).click({ force: true });

    await expect(page.locator(".modal-content")).not.toBeVisible(); // line added to allow the process to finish before clearing cookies
    await page.waitForTimeout(5 * 60 * 1000);
    await page.waitForLoadState("networkidle");

    await expect(addButton).toBeVisible({ timeout: 10000 });
    await expect(addButton).toBeEnabled({ timeout: 10000 });

    await page
      .getByRole(`button`, { name: `Add Employee` })
      .click({ force: true });

    await page
      .locator(`input[name="firstName"]`)
      .pressSequentially(secondSMFirstName);
    await page
      .locator(`input[name="lastName"]`)
      .pressSequentially(secondSMLastName);
    await page
      .locator(`input[name="dependants"]`)
      .pressSequentially(secondDependantsSM);
    await page.locator(`#addEmployee`).click({ force: true });

    await expect(
      page.getByRole(`row`, { name: secondSMFirstName }),
    ).toBeVisible();
  });
});
