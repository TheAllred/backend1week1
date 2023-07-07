// Needed Resources
const express = require("express");
const router = new express.Router();
const messageController = require("../controllers/messageController");
const utilities = require("../utilities");
const regValidate = require("../utilities/account-validation");
const messageValidate = require("../utilities/message-validation");

// Deliver all routes dealing with messages
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(messageController.buildInboxPage)
);
router.get(
  "/archive",
  utilities.checkLogin,
  utilities.handleErrors(messageController.buildInboxArchivedPage)
);

router.get(
  "/newMessage",
  utilities.checkLogin,
  utilities.handleErrors(messageController.buildNewMessagePage)
);

router.post(
  "/newMessage",
  utilities.checkLogin,
  messageValidate.messageRules(),
  messageValidate.checkNewMessage,
  utilities.handleErrors(messageController.sendMessage)
);

router.get(
  "/:messageId",
  utilities.checkLogin,
  utilities.checkMessageView,
  utilities.handleErrors(messageController.buildDetailMessageView)
);

router.post(
  "/:messageId",
  utilities.checkLogin,
  utilities.checkMessageView,
  utilities.handleErrors(messageController.markMessageAsRead)
);
router.post(
  "/archive/:messageId",
  utilities.checkLogin,
  utilities.checkMessageView,
  utilities.handleErrors(messageController.markMessageAsArchived)
);

router.post(
  "/delete/:messageId",
  utilities.checkLogin,
  utilities.checkMessageView,
  utilities.handleErrors(messageController.deleteMessage)
);

router.get(
  "/archive/:messageId",
  utilities.checkLogin,
  utilities.checkMessageView,
  utilities.handleErrors(messageController.buildDetailMessageView)
);
router.get(
  "/reply/:messageId",
  utilities.checkLogin,
  utilities.checkMessageView,
  utilities.handleErrors(messageController.buildReplyMessageView)
);

router.post(
  "/reply/:messageId",
  utilities.checkLogin,
  messageValidate.replyRules(),
  messageValidate.checkNewReply,
  utilities.handleErrors(messageController.sendReply)
);

module.exports = router;
