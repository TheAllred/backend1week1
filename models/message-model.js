const pool = require("../database");

async function getMessages(account_id) {
  const sql = String.raw;
  try {
    const result = await pool.query(
      sql`
      SELECT message.message_id,
       message.message_subject,
       message.message_body,
       message.message_created,
       message.message_to,
       message.message_from,
       message.message_read,
       message.message_archived,
       account.account_firstname,
       account.account_lastname 
       FROM message 
       JOIN account ON message.message_from = account.account_id 
       WHERE message.message_to = $1 AND message.message_archived = false;`,
      [account_id]
    );

    return result.rows;
  } catch (error) {
    return new Error("Could not get messages");
  }
}

async function getArchivedMessages(account_id) {
  const sql = String.raw;
  try {
    const result = await pool.query(
      sql`
      SELECT message.message_id,
       message.message_subject,
       message.message_body,
       message.message_created,
       message.message_to,
       message.message_from,
       message.message_read,
       message.message_archived,
       account.account_firstname,
       account.account_lastname 
       FROM message 
       JOIN account ON message.message_from = account.account_id 
       WHERE message.message_to = $1 AND message.message_archived = true;`,
      [account_id]
    );

    return result.rows;
  } catch (error) {
    return new Error("Could not get messages");
  }
}

async function getMessageById(message_id) {
  const sql = String.raw;
  try {
    const result = await pool.query(
      sql`SELECT
        message.message_id,
        message.message_subject,
        message.message_body,
        message.message_created,
        message.message_to,
        message.message_from,
        message.message_read,
        message.message_archived,
        account.account_firstname,
        account.account_lastname 
      FROM message 
      JOIN account ON message.message_from = account.account_id 
      WHERE message.message_id = $1;`,
      [message_id]
    );

    return result.rows[0];
  } catch (error) {
    return new Error("Could not get message");
  }
}

async function markMessageAsRead(message_id) {
  try {
    const result = await pool.query(
      "UPDATE message SET message_read = true where message_id = $1 RETURNING *",
      [message_id]
    );

    return result.rows[0];
  } catch (error) {
    return new Error("Could not get message");
  }
}

async function markMessageAsArchived(message_id) {
  try {
    const result = await pool.query(
      "UPDATE message SET message_archived = true where message_id = $1 RETURNING *",
      [message_id]
    );

    return result.rows[0];
  } catch (error) {
    return new Error("Could not get message");
  }
}

async function getUnreadMessages(account_id) {
  try {
    const result = await pool.query(
      "SELECT * FROM message WHERE message_to = $1 AND message_read = 'false' ",
      [account_id]
    );

    return result.rowCount;
  } catch (error) {
    return new Error("Could not count unread messages");
  }
}

async function sendMessage(message_to, subject, body, message_from) {
  try {
    const result = await pool.query(
      `INSERT INTO message (message_subject, message_body, message_to, message_from) VALUES ($1, $2, $3, $4) returning *`,
      [subject, body, message_to, message_from]
    );
    return result;
  } catch (error) {
    return new Error("Could not send message");
  }
}
module.exports = {
  getMessages,
  getUnreadMessages,
  getArchivedMessages,
  sendMessage,
  getMessageById,
  markMessageAsRead,
  markMessageAsArchived,
};
