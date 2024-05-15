"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
          `SELECT handle
           FROM companies
           WHERE handle = $1`,
        [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
          `INSERT INTO companies
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
        [
          handle,
          name,
          description,
          numEmployees,
          logoUrl,
        ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   * 
   * If a search query is present, filters the list of companies based on the query.
   * 
   * searchFilters:
   * - minEmployees
   * - maxEmployees
   * - name
   * 
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * 
   * 
   * */

  static async findAll(searchFilters = {}) {
    let query = `SELECT handle,
                      name,
                      description,
                      num_employees AS "numEmployees",
                      logo_url AS "logoUrl"
                  FROM companies
                  `
                  // WHERE filterExpression is $queryValues[i]
                  // [queryValues]
    let queryValues = [];
    let whereExpressions = [];

  const { minEmployees, maxEmployees, name } = searchFilters;

  if(minEmployees >= maxEmployees){
    throw new BadRequestError(`Minimum employee value cannot be more than Maximum employee value`)
  }

  //if query values exist, add them to [queryValues], and add `filter $queryValueIndex` to filterExpressions
  if(minEmployees !== undefined){
    queryValues.push(minEmployees);
    whereExpressions.push(`num_employees >= $${queryValues.length}`)
  }
  if(maxEmployees !== undefined){
    queryValues.push(maxEmployees);
    whereExpressions.push(`num_employees <= $${queryValues.length}`)

  }
  if(name){
    queryValues.push(`%${name}%`);
    // ILIKE instead of LIKE to have case-insensitive pattern matching
    whereExpressions.push(`handle ILIKE $${queryValues.length}`)
  }

  // if there are extra queries, add them to the query string with WHERE and AND
  if(whereExpressions.length > 0){
    query += "WHERE " + whereExpressions.join(" AND ")
  }
//append ORDER BY after all WHERE clauses
    query += "ORDER BY name"
    const companiesRes = await db.query(query, queryValues);
    return companiesRes.rows;
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
          `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
        [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    let jobRes = await db.query(
        `SELECT id, 
                title, 
                salary, 
                equity, 
                company_handle AS "companyHandle"
          FROM jobs
          WHERE company_handle = $1
          ORDER BY id`,
        [handle])
    
  company.jobs = jobRes.rows;

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          numEmployees: "num_employees",
          logoUrl: "logo_url",
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE companies 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
          `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
        [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }


}


module.exports = Company;
