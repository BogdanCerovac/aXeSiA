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
            audit JSON
        );
        `;
  db.exec(sqlInit);
}else{
  console.log("audits database exists");
}


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
  'INSERT INTO audits (url, audit) VALUES ($url, json($audit))',
);
const insert = (url, audit) => {
  insertAudit.run({ url: url, audit: audit });
  return get(url);
};


const stats = () => {

  const readAuditsDistinct = db.prepare(
    `SELECT COUNT ( DISTINCT url ) AS "Distinct"  FROM audits`,
  );
  let distinct = readAuditsDistinct.get();

  const readAuditsAll = db.prepare(
    `SELECT COUNT ( id ) AS "All"  FROM audits`,
  );
  let all = readAuditsAll.get();

  return `DB stats: ${all["All"]} all urls,  ${distinct["Distinct"]} distinct`;

}

module.exports = { get, insert, stats };
