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
  const classificationSelectOptions =
    await utilities.buildClassificationSelect();
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    classificationSelectOptions,
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(
    classification_id
  );
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

invCont.buildInventoryManagementPage = async function (req, res, next) {
  const inventoryId = parseInt(req.params.inventoryId);
  let nav = await utilities.getNav();
  const inventoryData = await invModel.getInventoryByDetailId(inventoryId);
  const name = inventoryData[0].inv_make + " " + inventoryData[0].inv_model;
  let options = await utilities.buildClassificationSelect(
    inventoryData[0].classification_id
  );
  res.render("inventory/editInventoryItem", {
    title: "Edit " + name,
    nav,
    options,
    errors: null,
    inv_id: inventoryData[0].inv_id,
    inv_make: inventoryData[0].inv_make,
    inv_model: inventoryData[0].inv_model,
    inv_year: inventoryData[0].inv_year,
    inv_description: inventoryData[0].inv_description,
    inv_image: inventoryData[0].inv_image,
    inv_thumbnail: inventoryData[0].inv_thumbnail,
    inv_price: inventoryData[0].inv_price,
    inv_miles: inventoryData[0].inv_miles,
    inv_color: inventoryData[0].inv_color,
    classification_id: inventoryData[0].classification_id,
  });
};

invCont.buildInventoryManagementPage = async function (req, res, next) {
  const inventoryId = parseInt(req.params.inventoryId);
  let nav = await utilities.getNav();
  const inventoryData = await invModel.getInventoryByDetailId(inventoryId);
  const name = inventoryData[0].inv_make + " " + inventoryData[0].inv_model;
  let options = await utilities.buildClassificationSelect(
    inventoryData[0].classification_id
  );
  res.render("inventory/editInventoryItem", {
    title: "Edit " + name,
    nav,
    options,
    errors: null,
    inv_id: inventoryData[0].inv_id,
    inv_make: inventoryData[0].inv_make,
    inv_model: inventoryData[0].inv_model,
    inv_year: inventoryData[0].inv_year,
    inv_description: inventoryData[0].inv_description,
    inv_image: inventoryData[0].inv_image,
    inv_thumbnail: inventoryData[0].inv_thumbnail,
    inv_price: inventoryData[0].inv_price,
    inv_miles: inventoryData[0].inv_miles,
    inv_color: inventoryData[0].inv_color,
    classification_id: inventoryData[0].classification_id,
  });
};

// Update vehicle
invCont.updateVehicle = async function (req, res, next) {
  let nav = await utilities.getNav();
  const updated_vehicle = req.body;
  const updateResult = await invModel.updateVehicle(
    updated_vehicle.make,
    updated_vehicle.model,
    updated_vehicle.year,
    updated_vehicle.description,
    updated_vehicle.imagePath,
    updated_vehicle.thumbnailPath,
    updated_vehicle.price,
    updated_vehicle.mileage,
    updated_vehicle.color,
    updated_vehicle.classification,
    updated_vehicle.inv_id
  );
  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model;
    req.flash("notice", `The ${itemName} was successfully updated.`);
    res.redirect("/inv/");
  } else {
    req.flash("notice", "Sorry, creating a new vehicle failed.");
    const itemName = updated_vehicle.inv_make + " " + updated_vehicle.inv_model;
    let options = await utilities.buildClassificationSelect(
      updated_vehicle.classification
    );
    res.render("inventory/editInventoryItem", {
      title: "Edit " + itemName,
      nav,
      options,
      errors: null,
      inv_id: updated_vehicle.inv_id,
      inv_make: updated_vehicle.inv_make,
      inv_model: updated_vehicle.inv_model,
      inv_year: updated_vehicle.inv_year,
      inv_description: updated_vehicle.inv_description,
      inv_image: updated_vehicle.inv_image,
      inv_thumbnail: updated_vehicle.inv_thumbnail,
      inv_price: updated_vehicle.inv_price,
      inv_miles: updated_vehicle.inv_miles,
      inv_color: updated_vehicle.inv_color,
      classification_id: updated_vehicle.classification_id,
    });
  }
};

invCont.buildDeleteConfirmationPage = async function (req, res, next) {
  const inventoryId = parseInt(req.params.inventoryId);
  let nav = await utilities.getNav();
  const inventoryData = await invModel.getInventoryByDetailId(inventoryId);
  const name = inventoryData[0].inv_make + " " + inventoryData[0].inv_model;
  let options = await utilities.buildClassificationSelect(
    inventoryData[0].classification_id
  );
  res.render("inventory/delete-confirm", {
    title: "Confirm Deletion of " + name,
    nav,
    options,
    errors: null,
    inv_id: inventoryData[0].inv_id,
    inv_make: inventoryData[0].inv_make,
    inv_model: inventoryData[0].inv_model,
    inv_year: inventoryData[0].inv_year,
    inv_price: inventoryData[0].inv_price,
    classification_id: inventoryData[0].classification_id,
  });
};

// Delete vehicle
invCont.deleteVehicle = async function (req, res, next) {
  let nav = await utilities.getNav();
  const deleted_vehicle = req.body;
  const deleteResult = await invModel.deleteVehicle(deleted_vehicle.inv_id);
  if (deleteResult) {
    req.flash("notice", `The vehicle was successfully deleted.`);
    res.redirect("/inv/");
  } else {
    req.flash("notice", "Sorry, deleting vehicle failed.");
    res.redirect(`/inv/delete/${deleted_vehicle.inv_id}}`);
  }
};

module.exports = invCont;
