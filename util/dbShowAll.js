const Database = require('better-sqlite3');
const db = new Database('./out/audits.db', { /*verbose: console.log*/ });

const readAuditsAll = db.prepare(
    'SELECT * FROM audits',
  );

let data = readAuditsAll.all();
console.log(data);