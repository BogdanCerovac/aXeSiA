const Database = require('better-sqlite3');
const db = new Database('./out/audits.db', { /*verbose: console.log*/ });

const {lastAuditMeta} = require('./DB');

//console.log(selectedAll);
console.log(lastAuditMeta());


process.exit();
