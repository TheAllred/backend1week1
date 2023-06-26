const utilities = require('.');
const { body, validationResult } = require('express-validator');
const Model = require('../models/inventory-model');
const validate = {};

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.classificationRules = () => {
  return [
    // firstname is required and must be string
    body('classification')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Please provide a classification name.') // on error this message is sent.
      .custom(async (classification) => {
        const classificationExists = await Model.checkExistingClassification(
          classification
        );
        if (classificationExists) {
          throw new Error('Classification already exists.');
        }
      }),
  ];
};

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
  const { classification } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render('inventory/newClassification', {
      errors,
      title: 'Create New Classification',
      nav,
      classification,
    });
    return;
  }
  next();
};

module.exports = validate;
