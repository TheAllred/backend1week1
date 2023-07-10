const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};
const messageModel = require("../models/message-model");

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.messageRules = () => {
  return [
    body("message_to")
      .trim()
      .notEmpty()
      .isNumeric()
      .withMessage("Must select a valid recipient"),

    body("subject")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a subject."), // on error this message is sent.

    body("body")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Please provide message content."), // on error this message is sent.
  ];
};

/* ******************************
 * Check data and return errors or continue
 * ***************************** */
validate.checkNewMessage = async (req, res, next) => {
  let { message_to, subject, body } = req.body;

  const message_body = body;
  let errors = [];
  if (message_to === "") {
    message_to = 0;
  }
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let userSelect = await utilities.buildUserSelect(message_to);
    const fname = res.locals.accountData.account_firstname;
    res.status(201).render("inbox/newMessage", {
      title: "Compose New Message",
      nav,
      errors,
      fname,
      userSelect,
      subject,
      message_body,
    });
    return;
  }
  next();
};

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.replyRules = () => {
  return [
    body("message_to")
      .trim()
      .notEmpty()
      .isNumeric()
      .withMessage("Must select a valid recipient"),

    body("subject")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a subject."), // on error this message is sent.

    body("body")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Please provide message content."), // on error this message is sent.
  ];
};

/* ******************************
 * Check data and return errors or continue
 * ***************************** */
validate.checkNewReply = async (req, res, next) => {
  let { message_to, subject, body } = req.body;
  const message_id = req.params.messageId;
  const reply_body = body;
  const reply_subject = subject;
  const message = await messageModel.getMessageById(message_id);
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.status(200).render("inbox/reply", {
      title: `Reply to ${message.account_firstname} ${message.account_lastname} `,
      nav,
      errors,
      message,
      reply_subject,
      reply_body,
    });
    return;
  }
  next();
};

module.exports = validate;
