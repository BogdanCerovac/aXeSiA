// drop still leaves data, best to just delete the whole DB
//const Database = require('better-sqlite3');
//const db = new Database('./out/audits.db', { /*verbose: console.log*/ });
/*
const dropAudit = 'DROP TABLE audits';
const drop = () => {
    db.exec(dropAudit);
    return true;
};

console.log("DB dropped: ", drop());*/

// delete DB:

const fs = require('fs');
const path = './out/audits.db';
try {
  fs.unlinkSync(path)
  console.log("DB removed OK");
} catch(err) {
  console.error("DB removal failed: ", err)
}