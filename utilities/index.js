const invModel = require("../models/inventory-model");
const accountModel = require("../models/account-model");
const messageModel = require("../models/message-model");
const Util = {};
const jwt = require("jsonwebtoken");
const { request } = require("express");
require("dotenv").config();

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

Util.buildClassificationSelect = async function (selected = 0) {
  let data = await invModel.getClassifications();
  let options = "";
  selected = parseInt(selected);
  options += "<option ";
  options += `value="" ${!selected ? "selected" : ""} disabled>`;
  options += `Select a classification</option>`;

  data.rows.forEach((row) => {
    options += "<option ";
    options += `value=${row.classification_id} ${
      selected === row.classification_id ? "selected" : ""
    }>`;
    options += row.classification_name + "</option>";
  });
  return options;
};

Util.buildUserSelect = async function (selected = 0) {
  let users = [];
  users = await accountModel.getAllAccounts();
  let select = "";
  select += `<label for="message_to">Recipient:</label>
  <select required id="message_to" name="message_to">
    <option disabled ${
      selected === 0 ? "selected" : ""
    } value=''>Choose a recipient</option>`;
  users.forEach((row) => {
    select += `<option ${
      parseInt(selected) === row.account_id ? "selected" : ""
    } value="${row.account_id}">${row.account_firstname} ${
      row.account_lastname
    }</option>`;
  });
  select += `</select><br/>`;
  return select;
};

Util.buildInboxRows = async function (messages) {
  let rows = "";

  messages.forEach(async (message) => {
    rows += `
    <tr>
      <td><a href="/inbox/${
        message.message_id
      }">${message.message_created.toLocaleString("en-US")}</a></td>
      <td><a href="/inbox/${message.message_id}">${
      message.message_subject
    }</a></td>
      <td><a href="/inbox/${message.message_id}">${message.account_firstname} ${
      message.account_lastname
    }</a></td>
      <td><a href="/inbox/${message.message_id}">${
      message.message_read
    }</a></td>
      <td><a href="/inbox/${message.message_id}">${
      message.message_archived
    }</a></td>
    </tr>
    `;
  });
  return rows;
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += '<li class="inv-item">';
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        'details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';

      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

Util.buildDetailedView = async function (data) {
  let view = "";

  if (data[0]) {
    view +=
      "<section><h1>" +
      data[0].inv_year +
      " " +
      data[0].inv_make +
      " " +
      data[0].inv_model +
      "</h1>";
    view += `<img src="${data[0].inv_image}" alt="${data[0].inv_make} ${data[0].inv_model}"/></section>`;
    view += `<section class="detail-desc">
    <h2>$${parseInt(data[0].inv_price).toLocaleString("en-US")}</h2>`;
    view += `<p>${data[0].inv_description}</p>`;
    view += `<p>${parseInt(data[0].inv_miles).toLocaleString(
      "en-US"
    )} Miles</p>`;
    view += `<p>Color: ${data[0].inv_color}</p></section>`;
  } else {
    view += "<p>Vehicle not Found</p>";
  }
  return view;
};

Util.causeError = function () {
  null.toLocaleString;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = 1;
        next();
      }
    );
  } else {
    next();
  }
};

Util.checkIfAuthorized = (req, res, next) => {
  if (
    res.locals.accountData?.account_type === "Admin" ||
    res.locals.accountData?.account_type === "Employee"
  ) {
    next();
  } else {
    req.flash("notice", "Unauthorized");
    return res.redirect("/");
  }
};

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

Util.checkMessageView = async (req, res, next) => {
  const message_id = req.params.messageId;
  const message = await messageModel.getMessageById(message_id);
  if (parseInt(res.locals.accountData.account_id) === message?.message_to) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

module.exports = Util;
