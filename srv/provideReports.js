const Database = require('better-sqlite3');
const db = new Database('./out/audits.db', /*{ verbose: console.log }*/);

function sortByProp(arr, prop, desc = true){
    if(desc){
        return arr.sort((a, b) => (a[prop] < b[prop]) ? 1 : -1);
    }else{
        return arr.sort((a, b) => (a[prop] > b[prop]) ? 1 : -1);
    }
}


function generateSummaries(summaryByUrl){

    let distinctUrlsCount = 0;
    let latestFlattened = [];
    let latestViolations = new Set();
    let overallAxeImpact = [];

    let axeStats = {
        mostViolations : [],
        mostPasses : [],
        mostTime: [],
        leastViolations : [],
        leastPasses : [],
        leastTime : [],
        allViolations: 0,
        allPasses: 0,
        allIncompletes: 0,
    }

    for(const url in summaryByUrl){
        distinctUrlsCount++;
        const auditsPerURL = summaryByUrl[url];
        const auditsPerURL_len = auditsPerURL.length;

        if(auditsPerURL_len > 0){
            const latest = auditsPerURL[(auditsPerURL_len - 1)];

            // axe
            const axe = latest.axe;
            latestFlattened.push({
                id: latest.id,
                ts: latest.ts,
                url: url,
                aXeTime: axe.time,
                aXeViolations: axe.violations,
                aXeViolationImpacts: axe.violationsImpacts,
                aXeViolationsTags: axe.violationsTags,
                aXePasses: axe.passes,
                aXeIncomplete: axe.incomplete
            });

            if(axe.violationsImpacts.length > 0){
                overallAxeImpact = [... axe.violationsImpacts];
            }
            
            axe.violationsTags.map( tag => latestViolations.add(tag));

           
            axeStats.allViolations += axe.violations;
            axeStats.allPasses += axe.passes;
            axeStats.allIncompletes += axe.incomplete;

        }

    }

    //console.log("latestFlattened")
    //console.log(latestFlattened)

    const numberOfItemsForStats = 3;

    axeStats.mostViolations = sortByProp(latestFlattened, "aXeViolations", true).slice(0, numberOfItemsForStats);
    axeStats.leastViolations = sortByProp(latestFlattened, "aXeViolations", false).slice(0, numberOfItemsForStats);

    axeStats.mostPasses = sortByProp(latestFlattened, "aXePasses", true).slice(0, numberOfItemsForStats);
    axeStats.leastPasses = sortByProp(latestFlattened, "aXePasses", false).slice(0, numberOfItemsForStats);

    axeStats.mostTime = sortByProp(latestFlattened, "aXeTime", true).slice(0, numberOfItemsForStats);
    axeStats.leastTime = sortByProp(latestFlattened, "aXeTime", false).slice(0, numberOfItemsForStats);

    /*console.log("latestViolations")
    console.log(latestViolations)

    console.log("overallAxeImpact")
    console.log(overallAxeImpact)*/

    //console.log("axeStats")
    //console.log(axeStats)

    return {
        axeSummary: axeStats,
        lighthouseSummary: "lighthouseSummary"
    }
}

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


    let axeSummary = generateSummaries(summaryByUrl).axeSummary;  
    let lighthouseSummary = generateSummaries(summaryByUrl).lighthouseSummary;
    
    return {
        axeSummary,
        lighthouseSummary,
        summaryByUrl
    };
    
}
