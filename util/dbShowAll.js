const Database = require('better-sqlite3');
const db = new Database('./out/audits.db', { verbose: console.log });

const {stats} = require('./DB');

// JSON example: https://stackoverflow.com/questions/33432421/sqlite-json1-example-for-json-extract-set/33433552

const selectAll = db.prepare(
    `SELECT id, ts, url, json_extract(audit, '$.aXeAudit') as aXeAudit  FROM audits`,
);
let selectedAll = selectAll.all();

console.log('---------');

console.log(stats());

console.log('---------');

console.log(selectedAll)