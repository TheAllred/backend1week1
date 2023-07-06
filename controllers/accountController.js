const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const messageModel = require("../models/message-model");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Util = require("../utilities");
require("dotenv").config();

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();

  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
}
/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();

  res.render("account/register", {
    title: "Register",
    nav,

    errors: null,
  });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();

  const account_firstname = req.body.account_firstname;
  const account_lastname = req.body.account_lastname;
  const account_email = req.body.account_email;
  const account_password = req.body.account_password;

  // Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    );
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      res.locals.accountData = accountData;
      return buildManagement(req, res);
    }
  } catch (error) {
    return new Error("Access Forbidden");
  }
}

async function buildManagement(req, res) {
  let nav = await utilities.getNav();
  let unreadMessages = await messageModel.getUnreadMessages(
    res.locals.accountData.account_id
  );
  let unread = unreadMessages;
  let fname = res.locals.accountData.account_firstname;
  return res.status(200).render("account/myaccount", {
    title: "Account Management",
    nav,
    fname,
    errors: null,
    unread,
  });
}

// INBOX PAGE
async function buildInboxPage(req, res) {
  let nav = await utilities.getNav();
  let unreadMessages = await messageModel.getUnreadMessages(
    res.locals.accountData.account_id
  );
  let allMessages = await messageModel.getMessages(
    res.locals.accountData.account_id
  );
  let inboxRows = await utilities.buildInboxRows(allMessages);
  let unread = unreadMessages;
  const fname = res.locals.accountData.account_firstname;
  return res.status(200).render("account/inbox", {
    title: "My Inbox",
    nav,
    errors: null,
    fname,
    unread,
    inboxRows,
  });
}
async function buildInboxArchivedPage(req, res) {
  let nav = await utilities.getNav();
  let unreadMessages = await messageModel.getUnreadMessages(
    res.locals.accountData.account_id
  );
  let allMessages = await messageModel.getArchivedMessages(
    res.locals.accountData.account_id
  );
  let inboxRows = await utilities.buildInboxRows(allMessages);
  let unread = unreadMessages;
  const fname = res.locals.accountData.account_firstname;
  return res.status(200).render("account/archive", {
    title: "My Archive",
    nav,
    errors: null,
    fname,
    unread,
    inboxRows,
  });
}

async function buildDetailMessageView(req, res) {
  let nav = await utilities.getNav();
  const message_id = req.params.messageId;
  const message = await messageModel.getMessageById(message_id);
  if (res.locals.accountData)
    return res.status(200).render("account/message", {
      title: `From ${message.account_firstname} ${message.account_lastname} `,
      nav,
      errors: null,
      message,
    });
}

async function buildReplyMessageView(req, res) {
  let nav = await utilities.getNav();
  const message_id = req.params.messageId;
  const message = await messageModel.getMessageById(message_id);
  let reply_subject = `RE: ${message.message_subject}`;
  let reply_body = "";
  if (res.locals.accountData)
    return res.status(200).render("account/reply", {
      title: `Reply to ${message.account_firstname} ${message.account_lastname} `,
      nav,
      errors: null,
      message,
      reply_subject,
      reply_body,
    });
}

async function markMessageAsArchived(req, res) {
  const message_id = req.params.messageId;
  const message = await messageModel.markMessageAsArchived(message_id);
  console.log(message);
  req.flash("notice", `Message was Archived.`);
  return res.status(200).redirect(`${message_id}`);
}

async function markMessageAsRead(req, res) {
  const message_id = req.params.messageId;
  const message = await messageModel.markMessageAsRead(message_id);
  console.log(message);
  req.flash("notice", `Message was marked read.`);
  return res.status(200).redirect(`${message_id}`);
}

// COMPOSE MESSAGE PAGE
async function buildNewMessagePage(req, res) {
  let nav = await utilities.getNav();
  let userSelect = await utilities.buildUserSelect();
  let subject = "";
  let message_body = "";
  const fname = res.locals.accountData.account_firstname;
  return res.status(200).render("account/newMessage", {
    title: "Compose New Message",
    nav,
    errors: null,
    fname,
    subject,
    message_body,
    userSelect,
  });
}

async function sendMessage(req, res) {
  let nav = await utilities.getNav();
  const messageObject = req.body;

  const sentMessage = await messageModel.sendMessage(
    messageObject.message_to,
    messageObject.subject,
    messageObject.body,
    res.locals.accountData.account_id
  );
  req.flash("notice", `Message was successfully sent.`);
  res.redirect("/account/inbox");
}

async function sendReply(req, res) {
  let nav = await utilities.getNav();
  const messageObject = req.body;

  const sentMessage = await messageModel.sendMessage(
    messageObject.message_to,
    messageObject.subject,
    messageObject.original_message +
      "\r\n////////////Start Reply//////////////\r\n" +
      messageObject.body,
    res.locals.accountData.account_id
  );
  req.flash("notice", `Message was successfully sent.`);
  res.redirect("/account/inbox");
}

async function buildUpdatePage(req, res) {
  let nav = await utilities.getNav();
  const account_firstname = res.locals.accountData.account_firstname;

  return res.status(200).render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
  });
}

async function updateAccount(req, res, next) {
  let nav = await utilities.getNav();
  const updated_user = req.body;
  const updateResult = await accountModel.updateAccount(
    updated_user.account_firstname,
    updated_user.account_lastname,
    updated_user.account_email,
    updated_user.account_id
  );
  if (updateResult) {
    const accountData = await accountModel.getAccountByEmail(
      updated_user.account_email
    );
    const firstName = updateResult.account_firstname;
    req.flash("notice", `${firstName} was successfully updated.`);

    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: 3600 * 1000,
    });
    res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
    res.redirect("/account");
  } else {
    req.flash("notice", "Sorry, updating user failed.");
    return res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
    });
  }
}

async function updatePassword(req, res, next) {
  let nav = await utilities.getNav();
  const updated_password = req.body;
  const accountData = res.locals.accountData;
  // Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(
      updated_password.account_password,
      10
    );
  } catch (error) {
    req.flash("notice", "Sorry, there was an error updating the password.");
    res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
    });
  }
  const updated = await accountModel.updatePassword(
    hashedPassword,
    accountData.account_id
  );
  if (updated.account_password) {
    req.flash("notice", `Password was successfully updated.`);
    res.redirect("/account");
  } else {
    req.flash("notice", "Sorry, updating password failed.");
    return res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
    });
  }
}

async function logout(req, res) {
  req.flash("notice", "Logged out");
  res.clearCookie("jwt");
  return res.redirect("/");
}

module.exports = {
  buildLogin,
  buildManagement,
  buildRegister,
  registerAccount,
  accountLogin,
  buildUpdatePage,
  updateAccount,
  updatePassword,
  logout,
  buildInboxPage,
  buildInboxArchivedPage,
  buildNewMessagePage,
  sendMessage,
  buildDetailMessageView,
  markMessageAsRead,
  buildReplyMessageView,
  sendReply,
  markMessageAsArchived,
};
