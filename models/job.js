"use strict";

const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');
const { sqlForPartialUpdate } = require('../helpers/sql');

/** Related functions for jobs */

class Job {
    /** Create a job listing (from data), update db, return new Job listing data.
     * 
     * data should be { title, salary, equity, company_handle }
     * 
     * returns { title, salary, equity, company_handle }
     * 
     * throws BadRequestError if missing information
     */

    static async create({ title, salary, equity, companyHandle }){
        const result = await db.query(
            `INSERT INTO jobs
            (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
            [
                title,
                salary,
                equity,
                companyHandle,
            ],
        );
        const job = result.rows[0];

        return job;
    }

    /** Find all jobs.
     * TO BE IMPLEMENTED
     * If a search query is present, filters job listings based on query.
     * 
     * searchFilters: 
     * - title
     * - minSalary
     * - hasEquity
     * 
     * Returns [{ id, title, salary, equity, company }]
     */
    static async findAll(searchFilters = {}) {
        let query = `SELECT id,
                            title, 
                            salary, 
                            equity, 
                            company_handle 
                        FROM jobs `

        let queryValues = [];
        let whereExpressions = [];

        const { title, minSalary, hasEquity } = searchFilters;

        if(minSalary !== undefined){
            queryValues.push(minSalary);
            whereExpressions.push(`salary >= $${queryValues.length}`)
        }
        
        if(hasEquity === true){
            whereExpressions.push(`equity > 0`)
        }

        if(title){
            queryValues.push(`%${title}%`)
            whereExpressions.push(`title ILIKE ${queryValues.length}`)
        }

        if(whereExpressions.length > 0){
            query += "WHERE " + whereExpressions.join(" AND ")
        }


        query += "ORDER BY title"
        const jobResults = await db.query(query, queryValues);
        return jobResults.rows;
    }

    /** Given a job ID, return data about the company
     * returns { ID, title, salary, equity, companyHandle}
     * 
     * throws a NotFoundError if not found
     */
    static async get(id){
        const jobResults = await db.query(
            ` SELECT id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle" 
                FROM jobs
                WHERE id = $1`,
                [id]);

        const job = jobResults.rows[0];

        if(!job) throw new NotFoundError(`No job title with ID${id}`)

        return job;
    }

    /** Update a job data with `data`
     *  
     * This is a partial update, it is fine if data doesnt conain all the fields, only changed provided fields.
     * 
     * Data can include: {title, salary, equity, companyHandle }
     * 
     * Returns { id, title, salary, equity, companyHandle}
     * 
     * throw NotFoundError if not found
     */
    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {
                companyHande: "company_handle"
            });
        const idVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE jobs
                            SET ${setCols}
                            WHERE id = ${idVarIdx}
                            RETURNING id,
                                        title, 
                                        salary,
                                        equity,
                                        company_handle AS "companyHandle"`;
        const result = await db.query(querySql, [...values, id]);
        const job = result.rows[0];

        if(!job) throw new NotFoundError(`No job at ID ${id}`);

        return job;
    }

    static async remove(id) {
        const result = await db.query(
            `DELETE
            FROM jobs
            WHERE id = $1
            RETURNING id, title`,
            [id]);
        const job = result.rows[0]

        if(!job) throw new NotFoundError(`No job ${id}`)
    }

    
}

module.exports = Job;