"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
  jobIds
} = require("./_testCommon");


beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


describe("POST /jobs", function() {
    console.log(jobIds)
    const newJob = {
        title: "new",
        companyHandle: "c1",
        equity: "0",
        salary: 100
    }
    test("works for admin", async function() {
        const resp = await request(app)
        .post('/jobs')
        .send(newJob)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
        job: {
            id: expect.any(Number),
            title: "new",
            companyHandle: "c1",
            equity: "0",
            salary: 100
        }
    })
    })
    
    test("doesn't work for non-admin", async function() {
        const resp = await request(app)
        .post('/jobs')
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.status).toBe(401);
    })

    test("bad request with missing data", async function() {
        const resp = await request(app)
        .post('/jobs')
        .send({
            title: "new",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(500)
    expect(resp.body).toEqual({
        "error":  {"message": "null value in column \"company_handle\" of relation \"jobs\" violates not-null constraint",
        "status": 500}
    });
    })

    test("Bad reqeust with invalid data", async function() {
        const resp = await request(app)
        .post('/jobs')
        .send({
            title: "new",
            companyHandle: "c1",
            equity: "0",
            salary: "none"
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(500)
    
    })

})
describe("GET /jobs", function() {
    test("works for anon", async function() {
        const resp = await request(app)
        .get('/jobs');
        expect(resp.body).toEqual({
            jobs:[
                {
                    id: expect.any(Number),
                    title: "Test Title",
                    company_handle: "c1",
                    equity: "0",
                    salary: 100,
                    
                },
                {   
                    id: expect.any(Number),
                    title: "Test Title2",
                    company_handle: "c2",
                    equity: "0",
                    salary: 200
                }
            ]
        })
    })
})

describe("GET /jobs/:id", function() {
    test("works for anon", async function() {
        const resp = await request(app).get(`/jobs/${jobIds[0]}`);
        expect(resp.body).toEqual({
            job: {
                id: expect.any(Number),
                title: "Test Title",
                companyHandle: "c1",
                equity: "0",
                salary: 100,
                
            }
        })
    })

    test("not found for nonexistent job", async function() {
        const resp = await request(app).get(`/jobs/1`);
        expect(resp.statusCode).toEqual(404);
    })
})

describe(" PATCH /jobs/:id ", function () {
    test("works for admins", async function() {
        const resp = await request(app)
        .patch(`/jobs/${jobIds[0]}`)
        .send({
            title: "Rose Eater"
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
        job: {
            "id": expect.any(Number),
            "title": "Rose Eater",
            "companyHandle": "c1",
            "equity": "0",
            "salary": 100,
            

        }
    })
    })
})

describe("DELETE /jobs/:id", function() {
    test("Works for admins", async function() {
        const resp = await request(app)
        .delete(`/jobs/${jobIds[0]}`)
        .set("authorization", `Bearer ${adminToken}`)
        expect(resp.body).toEqual({ deleted: `${jobIds[0]}` })
    })

    test("doesn't work for non-admin users", async function() {
        const resp = await request(app)
        .delete(`/jobs/${jobIds[0]}`)
        .set("authorization", `Bearer ${u1Token}`)
        expect(resp.body).toEqual({
            "error": {
                "message": "Unauthorized",
                "status": 401
              }
        })
    })
    test("doesnt work for anon", async function() {
        const resp = await request(app)
        .delete(`/jobs/${jobIds[0]}`)
        expect(resp.body).toEqual({
            "error": {
                "message": "Unauthorized",
                "status": 401
              }});


})
    test("not found for no such job", async function() {
        const resp = await request(app)
        .delete(`/jobs/1`)
        .set("authorization", `Bearer ${adminToken}`)
    expect(resp.statusCode).toEqual(404)
    })

});