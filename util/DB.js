const Database = require('better-sqlite3');
const db = new Database('./out/audits.db', { /*verbose: console.log*/ });

// check to see if we already initialized this database
let stmt = db.prepare(`SELECT name
    FROM sqlite_master
    WHERE
        type='table' and name='audits'
    ;`);
let row = stmt.get();
if (row === undefined) {
  console.log('WARNING: audits database appears empty, initializing it.');
  const sqlInit = `
        CREATE TABLE audits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ts DEFAULT CURRENT_TIMESTAMP,
            url TEXT,
            audit_axe TEXT
        );
        `;
  db.exec(sqlInit);
}
console.log("audits database exists now, if it didn't already.");

const readAudits = db.prepare(
  'SELECT * FROM audits WHERE url IS $url',
);

const readAuditsAll = db.prepare(
  'SELECT * FROM audits',
);
const get = url => {
  let data = readAuditsAll.all();
  if(url !== "*"){
    data = readAudits.all({ url: url });
  }
  return data;
};

const insertAudit = db.prepare(
  'INSERT INTO audits (url, audit_axe) VALUES ($url, $audit_axe)',
);
const increase = (url, audit_axe) => {
  insertAudit.run({ url: url, audit_axe: audit_axe });
  return get(url);
};

module.exports = { get, increase };
