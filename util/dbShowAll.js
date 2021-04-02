const Database = require('better-sqlite3');
const db = new Database('./out/audits.db', { verbose: console.log });

const {stats} = require('./DB');

// JSON example: https://stackoverflow.com/questions/33432421/sqlite-json1-example-for-json-extract-set/33433552

const selectAll = db.prepare(
    `SELECT 
        id, ts, domain, url, json_extract(audit, '$.aXeAudit') as aXeAudit, json_extract(audit, '$.lighthouseAudit') as lighthouseAudit , json_extract(audit, '$.siteimproveAudit') as siteimproveAudit 
    FROM audits`,
);
let selectedAll = selectAll.all();

// console.log(selectedAll);

console.log('---------');
console.log('---------');
console.log('---------');
console.log('---------');

console.log(stats());

console.log('---------');

const summaryByDomain = selectedAll.reduce((groups, item) => {
    const group = (groups[item.domain] || []);
    group.push(item);
    groups[item.domain] = group;
    return groups;
  }, {});
 
//console.log("summaryByDomain"); 
//console.log(summaryByDomain);
