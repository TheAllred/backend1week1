// Needed Resources
const express = require('express');
const router = new express.Router();
const invController = require('../controllers/invController');
const utilities = require('../utilities');
const classValidate = require('../utilities/classification-validation');

router.get('/', utilities.handleErrors(invController.buildManagementPage));

// Route to build inventory by classification view
router.get(
  '/type/:classificationId',
  utilities.handleErrors(invController.buildByClassificationId)
);
//Route to build detail view
router.get(
  '/detail/:detailId',
  utilities.handleErrors(invController.buildByDetailId)
);

router.get(
  '/newclassification',
  utilities.handleErrors(invController.buildNewClassificationPage)
);
router.post(
  '/newclassification',
  classValidate.classificationRules(),
  classValidate.checkClassificationData,
  utilities.handleErrors(invController.createNewClassification)
);
router.get(
  '/newvehicle',
  utilities.handleErrors(invController.buildNewInventoryPage)
);
router.post(
  '/newvehicle',
  utilities.handleErrors(invController.createNewVehicle)
);
module.exports = router;
