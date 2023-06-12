const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");

let loginForm = `
      <form id="loginForm" action="/account/login" method="post">
      <label for="email">Email</label>
      <input type="email" id="email" name="email" placeholder="Enter your email" required>
      <label for="password">Password</label>
      <input type="password" id="password" name="password" placeholder="Enter your password" pattern="(?=.*\\d)(?=.*[A-Z])(?=.*\\W).{12,}" title="Password must be 12 characters long, containing at least 1 number, 1 capital letter, and 1 special character." required>
      <button type="submit">Login</button>
      </form>
      <p class="signup">Don't have an account? <a href="/account/register">Sign up</a></p>`;
/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();

  res.render("account/login", {
    title: "Login",
    nav,
    loginForm,
  });
}
/* ****************************************
 *  Deliver login view
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

  const account_firstname = req.body.firstname;
  const account_lastname = req.body.lastname;
  const account_email = req.body.email;
  const account_password = req.body.password;

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
      loginForm,
      nav,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    });
  }
}

module.exports = { buildLogin, buildRegister, registerAccount };
