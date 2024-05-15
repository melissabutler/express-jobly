// "use strict";
// /** Database setup for jobly. */
// const { Client } = require("pg");
// const { getDatabaseUri } = require("./config");

// let db;

// if (process.env.NODE_ENV === "production") {
//   db = new Client({
//     connectionString: getDatabaseUri(),
//     ssl: {
//       rejectUnauthorized: false
//     }
//   });
// } else {
//   db = new Client({
//     connectionString: getDatabaseUri()
//   });
// }

// db.connect();

// module.exports = db;

const { Client } = require("pg")

let DB_URI;

if(process.env.NODE_ENV === "test") {
  DB_URI = "jobly_test";
} else {
  DB_URI = "jobly"
}

const db = new Client({
  host: "/var/run/postgresql",
  database: DB_URI })

db.connect();

module.exports = db;
