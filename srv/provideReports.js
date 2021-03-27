const Database = require('better-sqlite3');
const db = new Database('./out/audits.db', { verbose: console.log });


exports.aXeReports = function(){
    
    const selectAll = db.prepare(
        `SELECT 
            id, ts, url, json_extract(audit, '$.aXeAudit') as aXeAudit, json_extract(audit, '$.lighthouseAudit') as lighthouseAudit , json_extract(audit, '$.siteimproveAudit') as siteimproveAudit 
        FROM audits`,
    );
    let selectedAll = selectAll.all();

    const summaryByUrl = selectedAll.reduce((groups, item) => {
        const group = (groups[item.url] || []);
        group.push(item);
        groups[item.url] = group;
        return groups;
      }, {});
     
    let distinctUrlsCount = 0;
    let aXeFlattenedLatest = [];
    let aXeTrendsOverall = [];
    
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
    
    return {
        aXeFlattenedLatest,
        aXeTrendsOverall
    }


}
