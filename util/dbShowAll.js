const Database = require('better-sqlite3');
const db = new Database('./out/audits.db', { verbose: console.log });

const {stats} = require('./DB');

const readAuditsDistinct = db.prepare(
    `SELECT COUNT ( DISTINCT url ) AS "Number of distinct urls"  FROM audits`,
);
let distinct = readAuditsDistinct.get();

console.log(stats());