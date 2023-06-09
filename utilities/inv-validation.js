const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.inventoryRules = () => {
  return [
    body("classification")
      .trim()
      .notEmpty()
      .isNumeric()
      .withMessage("Must select a valid classification"),

    body("make")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a make."), // on error this message is sent.

    body("model")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Please provide a model."), // on error this message is sent.

    body("year")
      .trim()
      .isInt()
      .isLength({ min: 4, max: 4 })
      .withMessage("Year must be valid 4 digit integer."),

    body("color")
      .trim()
      .isAlphanumeric()
      .isLength({ min: 3 })
      .withMessage("Please provide a color."),

    body("mileage")
      .trim()
      .isInt()
      .withMessage("Only whole integers for mileage."),

    body("description")
      .trim()
      .notEmpty()
      .withMessage("Please provide a description of the vehicle."),

    body("price").trim().isInt().withMessage("Only whole integers for price."),

    body("imagePath")
      .trim()
      .notEmpty()
      .withMessage("Please provide a path to the product image."),

    body("thumbnailPath")
      .trim()
      .notEmpty()
      .withMessage("Please provide a path to the product thumbnail."),
  ];
};

/* ******************************
 * Check data and return errors or continue
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
  const {
    classification,
    make,
    model,
    year,
    color,
    mileage,
    description,
    price,
    imagePath,
    thumbnailPath,
  } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let options = await utilities.buildClassificationSelect(classification);
    res.status(201).render("inventory/newInventoryItem", {
      title: "New Vehicle",
      errors,
      nav,
      options,
      make,
      model,
      year,
      color,
      mileage,
      description,
      price,
      imagePath,
      thumbnailPath,
    });
    return;
  }
  next();
};

/* ******************************
 * Check data and return errors or continue to update vehicle
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const {
    classification,
    make,
    model,
    year,
    color,
    mileage,
    description,
    price,
    imagePath,
    thumbnailPath,
    inv_id,
  } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    let name = make + " " + model;
    let options = await utilities.buildClassificationSelect(classification);
    res.status(201).render("inventory/editInventoryItem", {
      title: "Edit " + name,
      errors,
      nav,
      options,
      inv_id: inv_id,
      inv_make: make,
      inv_model: model,
      inv_year: year,
      inv_description: description,
      inv_image: imagePath,
      inv_thumbnail: thumbnailPath,
      inv_price: price,
      inv_miles: mileage,
      inv_color: color,
      classification_id: classification,
    });
    return;
  }
  next();
};

module.exports = validate;
