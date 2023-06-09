// Needed Resources
const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const regValidate = require("../utilities/account-validation");
const messageValidate = require("../utilities/message-validation");

/* ********
 * Deliver Account Management View
 * Unit 5, JWT Authorization activity
 * ******************************** */

router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildManagement)
);

// Route to build inventory by classification view
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/register", accountController.buildRegister);
// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

router.get(
  "/update/:accountId",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdatePage)
);

router.post(
  "/update",
  regValidate.accountUpdateRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
);

router.post(
  "/updatePassword",
  regValidate.passwordUpdateRules(),
  regValidate.checkUpdatePassword,
  utilities.handleErrors(accountController.updatePassword)
);

router.get("/logout", utilities.handleErrors(accountController.logout));

module.exports = router;
