
/** Routes for job listings */
const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");
const { json } = require("body-parser");

const router = new express.Router();

/** POST / { job } => { job }
 * 
 * job should be { title, salary, equity, companyHandle }
 * 
 * returns { id, title, salary, equity, company } 
 * 
 * Authorization required: admin
 * 
 */

router.post("/", ensureLoggedIn, ensureAdmin, async function(req, res, next) {
    try {
        const job = await Job.create(req.body);
        return res.status(201).json({job});
    } catch(err){
        return next(err);
    }
})

/** Get / => 
 * { jobs [ {title, salary, equity, companyHandle }]}
 * 
 * Can filter based on provided search filters:
 * - title
 * - minSalary
 * - hasEquity
 * 
 * Authorization required: none
 */
router.get('/', async function(req, res, next){
    try{
        const query = req.query;

        if (query.minSalary !== undefined) query.minSalary = +query.minSalary;
        if (query.hasEquity !== undefined) query.hasEquity = +query.hasEquity;

        const jobs = await Job.findAll(query);
        return res.json({ jobs });
    } catch(err) {
        return next(err);
    }
})

/** GET /:ID => { job }
 * 
 * Job is { id, title, salary, equity, companyHandle}
 * 
 * authorization require: none;

 */
router.get("/:id", async function(req, res, next) {
    try {
        const job = await Job.get(req.params.id);

        return res.json({ job })
    } catch(err) {
        return next(err);
    }
})

/** PATCH /:id { val1, val2, ...} => { job }
 * 
 * patches job data.
 * fields can be { title, salary, equity, companyHandle }
 * 
 * returns { id, title, salary, equity, companyHandle }
 * 
 * Authorization required: login, admin
 * 
 */

router.patch('/:id', ensureLoggedIn, ensureAdmin, async function(req, res, next) {
    try {
        const job = await Job.update(req.params.id, req.body);
        return res.json({ job })
    } catch(err) {
        return next(err);
    }
})

/** DELETE /:id => { deleted: id }
 * 
 * Authorization: login, admin
 * 
 */
router.delete('/:id', ensureLoggedIn, ensureAdmin, async function(req, res, next) {
    try {
        await Job.remove(req.params.id);
        return res.json({ deleted: req.params.id})
    } catch(err){
        return next(err);
    }
})

module.exports = router;