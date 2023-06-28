// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const classValidate = require("../utilities/classification-validation");
const invValidate = require("../utilities/inv-validation");

router.get(
  "/",
  utilities.checkJWTToken,
  utilities.checkIfAuthorized,
  utilities.handleErrors(invController.buildManagementPage)
);

// Route to get inventory in JSON
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

router.get(
  "/edit/:inventoryId",
  utilities.handleErrors(invController.buildInventoryManagementPage)
);
router.get(
  "/delete/:inventoryId",
  utilities.handleErrors(invController.buildDeleteConfirmationPage)
);

// Route to build inventory by classification view
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);
//Route to build detail view
router.get(
  "/detail/:detailId",
  utilities.handleErrors(invController.buildByDetailId)
);

router.get(
  "/newclassification",
  utilities.handleErrors(invController.buildNewClassificationPage)
);
router.post(
  "/newclassification",
  classValidate.classificationRules(),
  classValidate.checkClassificationData,
  utilities.handleErrors(invController.createNewClassification)
);
router.get(
  "/newvehicle",
  utilities.handleErrors(invController.buildNewInventoryPage)
);
router.post(
  "/newvehicle",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.createNewVehicle)
);

router.post(
  "/update",
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateVehicle)
);

router.post("/delete", utilities.handleErrors(invController.deleteVehicle));

module.exports = router;
