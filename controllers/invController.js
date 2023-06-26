const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  let grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  let className = "";
  console.log(data);
  console.log(data.length);
  if (data.length > 0) {
    className = data[0].classification_name;
  } else {
    className = "Missing";
  }
  res.render("./inventory/classification", {
    title: ` ${className} vehicles`,
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
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
  });
};

invCont.buildNewClassificationPage = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/newClassification", {
    title: "New Classification",
    nav,
  });
};

invCont.buildNewInventoryPage = async function (req, res, next) {
  let nav = await utilities.getNav();
  let options = await utilities.buildClassificationSelect();
  res.render("inventory/newInventoryItem", {
    title: "New Inventory Item",
    nav,
    options,
    errors: null,
  });
};

invCont.createNewClassification = async function (req, res, next) {
  const new_classification_name = req.body.classification;

  const classResult = await invModel.newClassification(new_classification_name);
  if (classResult) {
    let nav = await utilities.getNav();
    req.flash(
      "notice",
      `New classification ${new_classification_name} created!`
    );
    res.status(201).render("inventory/newClassification", {
      title: "New Classification",
      nav,
    });
  } else {
    req.flash("notice", "Sorry, creating a new classificaton failed.");
    res.status(501).render("inventory/newClassification", {
      title: "New Classification",
      nav,
    });
  }
};

invCont.createNewVehicle = async function (req, res, next) {
  let nav = await utilities.getNav();
  const new_vehicle = req.body;
  let options = await utilities.buildClassificationSelect();

  const vehicleResult = await invModel.newVehicle(
    new_vehicle.make,
    new_vehicle.model,
    new_vehicle.year,
    new_vehicle.description,
    new_vehicle.imagePath,
    new_vehicle.thumbnailPath,
    new_vehicle.price,
    new_vehicle.mileage,
    new_vehicle.color,
    new_vehicle.classification
  );
  if (vehicleResult) {
    req.flash(
      "notice",
      `New vehicle ${new_vehicle.make + " " + new_vehicle.model} created!`
    );
    res.status(201).render("inventory/newInventoryItem", {
      title: "New Vehicle",
      nav,
      options,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, creating a new vehicle failed.");
    res.status(501).render("inventory/newInventoryItem", {
      title: "New Vehicle",
      nav,
      options,
      errors: null,
    });
  }
};

module.exports = invCont;
