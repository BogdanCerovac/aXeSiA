const Database = require('better-sqlite3');
const db = new Database('./out/audits.db', /*{ verbose: console.log }*/);


exports.getAllReports = function(){

    let selectedAll = [];
    try {
        const selectAll = db.prepare(
            `SELECT 
                id, ts, url, json_extract(audit, '$.aXeAudit') as aXeAudit, json_extract(audit, '$.lighthouseAudit') as lighthouseAudit , json_extract(audit, '$.siteimproveAudit') as siteimproveAudit 
            FROM audits`,
        );
        selectedAll = selectAll.all();
    } catch (error) {
        console.error("Failed to run getAllReports: ", error);
    }
    
    const summaryByUrl = selectedAll.reduce((groups, item) => {
        const group = (groups[item.url] || []);
        const itemTmp = {
            id: item.id,
            ts: item.ts,
            axe: JSON.parse(item.aXeAudit),
            lh: JSON.parse(item.lighthouseAudit),
            si: JSON.parse(item.siteimproveAudit),
        };
        group.push(itemTmp);
        groups[item.url] = group;
        return groups;
      }, {});


    let axeSummary = "axeSummary";  
    let lighthouseSummary = "lighthouseSummary";
    
    return {
        axeSummary,
        lighthouseSummary,
        summaryByUrl
    };
    
}
