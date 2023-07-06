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

router.get(
  "/inbox",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildInboxPage)
);
router.get(
  "/inbox/archive",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildInboxArchivedPage)
);

router.get(
  "/inbox/newMessage",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildNewMessagePage)
);

router.post(
  "/inbox/newMessage",
  utilities.checkLogin,
  messageValidate.messageRules(),
  messageValidate.checkNewMessage,
  utilities.handleErrors(accountController.sendMessage)
);

router.get(
  "/inbox/:messageId",
  utilities.checkLogin,
  utilities.checkMessageView,
  utilities.handleErrors(accountController.buildDetailMessageView)
);

router.post(
  "/inbox/:messageId",
  utilities.checkLogin,
  utilities.checkMessageView,
  utilities.handleErrors(accountController.markMessageAsRead)
);
router.post(
  "/inbox/archive/:messageId",
  utilities.checkLogin,
  utilities.checkMessageView,
  utilities.handleErrors(accountController.markMessageAsArchived)
);

router.get(
  "/inbox/archive/:messageId",
  utilities.checkLogin,
  utilities.checkMessageView,
  utilities.handleErrors(accountController.buildDetailMessageView)
);
router.get(
  "/inbox/reply/:messageId",
  utilities.checkLogin,
  utilities.checkMessageView,
  utilities.handleErrors(accountController.buildReplyMessageView)
);

router.post(
  "/inbox/reply/:messageId",
  utilities.checkLogin,
  messageValidate.replyRules(),
  messageValidate.checkNewReply,
  utilities.handleErrors(accountController.sendReply)
);

module.exports = router;
