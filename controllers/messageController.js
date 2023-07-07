const utilities = require("../utilities");
const messageModel = require("../models/message-model");

// INBOX PAGE
async function buildInboxPage(req, res) {
  let nav = await utilities.getNav();
  let unreadMessages = await messageModel.getUnreadMessages(
    res.locals.accountData.account_id
  );
  let archivedMessages = await messageModel.getArchivedMessageCount(
    res.locals.accountData.account_id
  );
  let allMessages = await messageModel.getMessages(
    res.locals.accountData.account_id
  );
  let inboxRows = await utilities.buildInboxRows(allMessages);
  let unread = unreadMessages;
  const fname = res.locals.accountData.account_firstname;
  return res.status(200).render("inbox/inbox", {
    title: "My Inbox",
    nav,
    errors: null,
    fname,
    unread,
    archivedMessages,
    inboxRows,
  });
}
// NEEDS ERROR HANDLING
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
  return res.status(200).render("inbox/archive", {
    title: "My Archive",
    nav,
    errors: null,
    fname,
    unread,
    inboxRows,
  });
}
// NEEDS ERROR HANDLING
async function buildDetailMessageView(req, res) {
  let nav = await utilities.getNav();
  const message_id = req.params.messageId;
  const message = await messageModel.getMessageById(message_id);
  if (res.locals.accountData)
    return res.status(200).render("inbox/message", {
      title: `From ${message.account_firstname} ${message.account_lastname} `,
      nav,
      errors: null,
      message,
    });
}
// NEEDS ERROR HANDLING
async function buildReplyMessageView(req, res) {
  let nav = await utilities.getNav();
  const message_id = req.params.messageId;
  const message = await messageModel.getMessageById(message_id);
  let reply_subject = `RE: ${message.message_subject}`;
  let reply_body = "";
  if (res.locals.accountData)
    return res.status(200).render("inbox/reply", {
      title: `Reply to ${message.account_firstname} ${message.account_lastname} `,
      nav,
      errors: null,
      message,
      reply_subject,
      reply_body,
    });
}
// NEEDS ERROR HANDLING
async function markMessageAsArchived(req, res) {
  const message_id = req.params.messageId;
  try {
    const message = await messageModel.markMessageAsArchived(message_id);
    req.flash("notice", `Message was Archived.`);
    return res.status(200).redirect(`/inbox`);
  } catch (error) {
    req.flash("notice", `Error occured when archiving message.`);
    return res.status(200).redirect(`${message_id}`);
  }
}

async function deleteMessage(req, res) {
  const message_id = req.params.messageId;
  try {
    const message = await messageModel.deleteMessage(message_id);
    req.flash("notice", `Message was deleted.`);
    return res.status(200).redirect(`/inbox`);
  } catch (error) {
    req.flash("notice", `Error occured when deleting message.`);
    return res.status(200).redirect(`${message_id}`);
  }
}

async function markMessageAsRead(req, res) {
  const message_id = req.params.messageId;
  try {
    const message = await messageModel.markMessageAsRead(message_id);
    req.flash("notice", `Message was marked read.`);
    return res.status(200).redirect(`/inbox`);
  } catch (error) {
    req.flash("notice", `Message could not be marked read.`);
    return res.status(500).redirect(`${message_id}`);
  }
}

async function buildNewMessagePage(req, res) {
  let nav = await utilities.getNav();
  let userSelect = await utilities.buildUserSelect();
  let subject = "";
  let message_body = "";
  const fname = res.locals.accountData.account_firstname;
  return res.status(200).render("inbox/newMessage", {
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
  try {
    const sentMessage = await messageModel.sendMessage(
      messageObject.message_to,
      messageObject.subject,
      messageObject.body,
      res.locals.accountData.account_id
    );
    req.flash("notice", `Message was successfully sent.`);
    res.redirect("/inbox");
  } catch (error) {
    req.flash("notice", `Error Occurred.`);
  }
}
// NEEDS ERROR HANDLING
async function sendReply(req, res) {
  let nav = await utilities.getNav();
  const messageObject = req.body;
  try {
    const sentMessage = await messageModel.sendMessage(
      messageObject.message_to,
      messageObject.subject,
      messageObject.original_message +
        "\r\n////////////Start Reply//////////////\r\n" +
        messageObject.body,
      res.locals.accountData.account_id
    );
    req.flash("notice", `Message was successfully sent.`);
    res.redirect("/inbox");
  } catch (error) {
    req.flash("notice", `Message was unsuccessfully sent.`);
  }
}

module.exports = {
  buildInboxPage,
  buildInboxArchivedPage,
  buildNewMessagePage,
  sendMessage,
  buildDetailMessageView,
  markMessageAsRead,
  buildReplyMessageView,
  sendReply,
  markMessageAsArchived,
  deleteMessage,
};
