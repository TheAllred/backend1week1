const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  );
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      "SELECT * FROM public.inventory AS i JOIN public.classification AS c ON i.classification_id = c.classification_id WHERE i.classification_id = $1",
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getclassificationsbyid error " + error);
  }
}

/* ***************************
 *  Get all inventory items and detail_name by detail_id
 * ************************** */
async function getInventoryByDetailId(detail_id) {
  try {
    const data = await pool.query(
      "SELECT * FROM public.inventory AS i WHERE i.inv_id = $1",
      [detail_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getdetailbyid error " + error);
  }
}

/* ***************************
 *  Create new classification data
 * ************************** */
async function newClassification(classification) {
  try {
    const sql = `INSERT INTO classification (classification_name) VALUES ($1) RETURNING *`;
    return await pool.query(sql, [classification]);
  } catch (error) {
    return error.message;
  }
}

async function newVehicle(
  make,
  model,
  year,
  desc,
  image,
  thumbnail,
  price,
  miles,
  color,
  classId
) {
  try {
    const sql = `INSERT INTO public.inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id ) VALUES ($1, $2, $3, $4, $5,$6,$7,$8,$9,$10 ) RETURNING *`;
    return await pool.query(sql, [
      make,
      model,
      year,
      desc,
      image,
      thumbnail,
      price,
      miles,
      color,
      classId,
    ]);
  } catch (error) {
    return error.message;
  }
}

async function checkExistingClassification(classification_name) {
  try {
    const sql = "SELECT * FROM classification WHERE classification_name = $1";
    const classification = await pool.query(sql, [classification_name]);
    return classification.rowCount;
  } catch (error) {
    return error.message;
  }
}

async function updateVehicle(
  make,
  model,
  year,
  desc,
  image,
  thumbnail,
  price,
  miles,
  color,
  classId,
  inv_id
) {
  try {
    const sql = `UPDATE public.inventory set inv_make = $1, inv_model = $2, inv_year = $3, inv_description = $4, inv_image = $5, inv_thumbnail = $6, inv_price = $7, inv_miles = $8, inv_color = $9, classification_id = $10 where inv_id = $11 RETURNING *`;
    const data = await pool.query(sql, [
      make,
      model,
      year,
      desc,
      image,
      thumbnail,
      price,
      miles,
      color,
      classId,
      inv_id,
    ]);

    return data.rows[0];
  } catch (error) {
    return error.message;
  }
}

async function deleteVehicle(inv_id) {
  try {
    const sql = `DELETE FROM inventory WHERE inv_id = $1`;
    const data = await pool.query(sql, [inv_id]);
    return data;
  } catch (error) {
    return error.message;
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryByDetailId,
  newClassification,
  checkExistingClassification,
  newVehicle,
  updateVehicle,
  deleteVehicle,
};
