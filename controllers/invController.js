const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByDetailId = async function (req, res, next) {
  const detail_id = req.params.detailId;
  const data = await invModel.getInventoryByDetailId(detail_id);
  let nav = await utilities.getNav();
  if (data[0]) {
    const view = await utilities.buildDetailedView(data);
    const make = data[0].inv_make;
    const model = data[0].inv_model;
    res.render("./inventory/detail", {
      title: make + " " + model,
      nav,
      view,
    });
  } else {
    message = "Car not found";
    res.render("errors/error", {
      title: "Car not found",
      message,
      nav,
    });
  }
};

invCont.buildManagementPage = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("./inventory/management", {
    title: make + " " + model,
    nav,
  });
};

module.exports = invCont;
