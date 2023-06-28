const invModel = require("../models/inventory-model");
const Util = {};
const jwt = require("jsonwebtoken");
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

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += '<div class="inv-item">';
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
      grid += "</div>";
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
  console.log(res.locals.accountData);
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

module.exports = Util;
