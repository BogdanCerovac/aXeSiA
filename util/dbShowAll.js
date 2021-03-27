const Database = require('better-sqlite3');
const db = new Database('./out/audits.db', { verbose: console.log });

const {stats} = require('./DB');

// JSON example: https://stackoverflow.com/questions/33432421/sqlite-json1-example-for-json-extract-set/33433552

const selectAll = db.prepare(
    `SELECT 
        id, ts, url, json_extract(audit, '$.aXeAudit') as aXeAudit, json_extract(audit, '$.lighthouseAudit') as lighthouseAudit , json_extract(audit, '$.siteimproveAudit') as siteimproveAudit 
    FROM audits`,
);
let selectedAll = selectAll.all();

// console.log(selectedAll);

console.log('---------');

console.log(stats());

console.log('---------');

const summaryByUrl = selectedAll.reduce((groups, item) => {
    const group = (groups[item.url] || []);
    group.push(item);
    groups[item.url] = group;
    return groups;
  }, {});
 
//console.log("summaryByUrl"); 
//console.log(summaryByUrl);

let distinctUrlsCount = 0;
let aXeFlattenedLatest = [];
let aXeTrendsLatestVsPrevious = [];

for(const url in summaryByUrl){
    distinctUrlsCount++;
    const auditsPerURL = summaryByUrl[url];
    const auditsPerURL_len = auditsPerURL.length;
    
    let overallSummary = [];

    for(let i = 0; i < auditsPerURL_len; i++){
        const singleItem = auditsPerURL[i];
        const singleAudit = JSON.parse(singleItem.aXeAudit);

        overallSummary.push({
            ts: singleItem.ts,
            time: singleItem.time,
            violations: singleAudit.violations,
            violationImpacts: singleAudit.violationImpact,
            violationsTags: singleAudit.violationsTags,
            passes: singleAudit.passes,
            incomplete: singleAudit.incomplete

        })
    }

    aXeTrendsOverall.push({
        url: url,
        results : overallSummary
    })

    const latest = auditsPerURL[(auditsPerURL_len - 1)];
    const latestAxe = JSON.parse(latest.aXeAudit);

    aXeFlattenedLatest.push({
        ts: latest.ts,
        url: latest.url,
        time: latestAxe.time,
        violations: latestAxe.violations,
        passes: latestAxe.passes,
        incomplete: latestAxe.incomplete
    });

}


console.log("distinctUrlsCount :", distinctUrlsCount)

const aXeViolationsLatestDesc = aXeFlattenedLatest.sort((a, b) => (a.violations < b.violations) ? 1 : -1);
console.log("aXeViolationsLatestDesc")
console.log(aXeViolationsLatestDesc)

const aXeViolationsLatestAsc = aXeFlattenedLatest.sort((a, b) => (a.violations > b.violations) ? 1 : -1)
console.log("aXeViolationsLatestAsc")
console.log(aXeViolationsLatestAsc)

const aXePassesLatestDesc = aXeFlattenedLatest.sort((a, b) => (a.passes < b.passes) ? 1 : -1)
console.log("aXePassesLatestDesc")
console.log(aXePassesLatestDesc)

const aXePassesLatestAsc = aXeFlattenedLatest.sort((a, b) => (a.passes > b.passes) ? 1 : -1)
console.log("aXePassesLatestAsc")
console.log(aXePassesLatestAsc)

const aXeIncompleteLatestDesc = aXeFlattenedLatest.sort((a, b) => (a.incomplete < b.incomplete) ? 1 : -1)
console.log("aXeIncompleteLatestDesc")
console.log(aXeIncompleteLatestDesc)

const aXeIncompleteLatestAsc = aXeFlattenedLatest.sort((a, b) => (a.incomplete > b.incomplete) ? 1 : -1)
console.log("aXeIncompleteLatestAsc")
console.log(aXeIncompleteLatestAsc)


/*

overall score violations, passed, incomplete
top 10 violations
top 10 passed
top 10 incomplete

top 10 trending violations
top 10 trending passes
top 10 trending incomplete

top 10 that took most time to evaluate



*/