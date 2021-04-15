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
            id_audit TEXT,
            ts DEFAULT CURRENT_TIMESTAMP,
            domain TEXT,
            url TEXT,
            audit JSON
        );
        `;
  db.exec(sqlInit);
}else{
  // console.log("audits database exists");
}

// check to see if we already initialized this database
let stmt_meta = db.prepare(`SELECT name
    FROM sqlite_master
    WHERE
        type='table' and name='audits_meta'
    ;`);
let row_meta = stmt_meta.get();
if (row_meta === undefined) {
  console.log('WARNING: audits_meta database appears empty, initializing it.');
  const sqlInit_meta = `
        CREATE TABLE audits_meta (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            id_audit TEXT,
            ts DEFAULT CURRENT_TIMESTAMP,
            domain TEXT,
            urls_all_num INTEGER,
            urls_all JSON,
            urls_ok_num INTEGER,
            urls_ok JSON,
            urls_err_num INTEGER,
            urls_err JSON,
            urls_na_num INTEGER,
            urls_na JSON,
            audit_ok INTEGER
        );
        `;
  db.exec(sqlInit_meta);
}else{
  // console.log("audits database exists");
}



/*******************************************/


const readAudits = db.prepare(
  'SELECT * FROM audits LEFT JOIN audits_meta ON audits.id_audit = audits_meta.id_audit WHERE audit_ok = 1  AND url IS $url',
);

const readAuditsAll = db.prepare(
  'SELECT * FROM audits LEFT JOIN audits_meta ON audits.id_audit = audits_meta.id_audit WHERE audit_ok = 1',
);
const get = url => {
  let data = readAuditsAll.all();
  if(url !== "*"){
    data = readAudits.all({ url: url });
  }
  return data;
};

const insertAudit = db.prepare(
  'INSERT INTO audits (id_audit, domain, url, audit) VALUES ($id_audit, $domain, $url, json($audit))',
);
const insert = (id_audit, domain, url, audit) => {
  insertAudit.run({id_audit:id_audit, domain:domain, url: url, audit: audit });
  return get(url);
};


const stats = () => {

  const readDomainsDistinct = db.prepare(
    `SELECT COUNT ( DISTINCT domain ) AS "Distinct"  FROM audits`,
  );
  let distinctDomains = readDomainsDistinct.get();

  const readAuditsDistinct = db.prepare(
    `SELECT COUNT ( DISTINCT url ) AS "Distinct"  FROM audits`,
  );
  let distinct = readAuditsDistinct.get();

  const readAuditsAll = db.prepare(
    `SELECT COUNT ( id ) AS "All"  FROM audits`,
  );
  let all = readAuditsAll.get();

  const distinctDatesAll = db.prepare(
    `SELECT COUNT ( DISTINCT DATE(ts) ) AS "Distinct"  FROM audits`,
  );
  let distinctDates = distinctDatesAll.get();

  const distinctAuditsAll = db.prepare(
    `SELECT COUNT ( DISTINCT id_audit ) AS "Distinct"  FROM audits`,
  );
  let distinctAudits = distinctAuditsAll.get();

  const distinctAuditsAllValid = db.prepare(
    `SELECT COUNT ( DISTINCT id_audit ) AS "Distinct"  FROM audits_meta WHERE audit_ok = 1`,
  );
  let distinctAuditsValid = distinctAuditsAllValid.get();

  return `DB stats: ${distinctDomains["Distinct"]} domains, ${distinctAudits["Distinct"]} distinct audits (${distinctAuditsValid["Distinct"]} valid), ${distinctDates["Distinct"]} distinct dates, ${distinct["Distinct"]} distinct urls, ${all["All"]} all urls`;

}

const statsForFile = () => {
  return stats().replaceAll(" ", "_").replaceAll(":", "-");
}


const insertAuditMeta = db.prepare(
  `INSERT INTO audits_meta 
    (id_audit, domain, urls_all_num, urls_all, urls_ok_num, urls_ok, urls_err_num, urls_err, urls_na_num, urls_na, audit_ok) 
    VALUES 
    ($id_audit, $domain,  $urls_all_num, json($urls_all), $urls_ok_num, json($urls_ok), $urls_err_num, json($urls_err), $urls_na_num, json($urls_na), $audit_ok)`,
);
const insertMeta = (id_audit, domain, urls_all_num, urls_all, urls_ok_num, urls_ok, urls_err_num, urls_err, urls_na_num, urls_na, audit_ok) => {
  insertAuditMeta.run({id_audit, domain, urls_all_num, urls_all, urls_ok_num, urls_ok, urls_err_num, urls_err, urls_na_num, urls_na, audit_ok});
  return insertAuditMeta;
};

module.exports = { get, insert, insertMeta, stats, statsForFile };
