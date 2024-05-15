const { BadRequestError } = require("../expressError");

/** A helper for making SQL update queries. 
 * Takes JS data and changes it to SQL syntax, for use in SET updating an instance of a model.
 * @param dataToUpdate: an { Object } containing the data you plan on updating. 
 *  { firstName: newFirstName, lastName: newLastName }
 * @param jsToSql: an { Object } to inform the mapping of JS to SQL database column names. 
 *  {firstName: "first_name", lastName: "last_name" }
 * 
 * @returns {Object} { sqlSetCols, dataToUpdate }
 * 
 * @example sqlForPartialUpdate({firstName: "New Name", lastName: "New Last Name"}, {firstName: "first_name", lastName: "last_name" }) => 
 * {setCols: "first_name" = $1, "last_name" = $2,
 * values: ['New Name', 'New Last Name]}

*/
function sqlForPartialUpdate(dataToUpdate, jsToSql) {

  // create keys out of given data
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  // map keys with the adjusted column names and an index
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  //returns an object with SQL syntax to be used in updating a DB
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
