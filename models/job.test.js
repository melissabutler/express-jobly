"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const db = require("../db.js");
const Job = require("./job.js");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  jobIds,
} = require("./_testCommon");
const { beforeJobs } = require("../routes/_testCommon.js");


beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


describe("create", function() {
    const newJob = {
        title: "testJob",
        salary: 100,
        equity: "0",
        companyHandle: "c1"
    }
    test("works", async function() {
        let job = await Job.create(newJob);
        expect(job).toEqual({
            title: "testJob",
            salary: 100,
            equity: "0",
            companyHandle: "c1",
        id: expect.any(Number)
        })
    })
});

describe("findAll", function() {
    test("works", async function() {
        const jobs = await Job.findAll();
        expect(jobs).toEqual([
            {
                "jobs": [
                    {
                        title: "Test Title",
                        salary: 100,
                        equity: "0",
                        companyHandle: "c1"
                    },
                    {
                        title: "Test Title2",
                        salary: 200,
                        equity: "0",
                        companyHandle: "c2",
                    }
                ]
            }]
    );
    });
});

describe("GET", function() {
    test("works", async function() {
        let job = await Job.get(jobIds[0]);
        expect(job).toEqual({
            id: expect.any(Number),
            title: "Test Title",
            salary: 100,
            equity: "0",
            companyHandle: "c1"
        })
    })
});