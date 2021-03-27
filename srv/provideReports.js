const Database = require('better-sqlite3');
const db = new Database('./out/audits.db', /*{ verbose: console.log }*/);

function getAverageOfProp(arr, prop){
    const average = arr.reduce((total, next) => total + next[prop], 0) / arr.length;
    return average;
}


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
        avgViolations: 0,
        avgPasses: 0,
        avgIncompletes : 0,
        avgTime : 0
    }

    let lighthouseStats = {
        bestA11y: [],
        bestSEO : [],
        bestPerf : [],
        bestBestPrac: [],
        bestTime : [],
        worstA11y: [],
        worstSEO : [],
        worstPerf : [],
        worstBestPrac: [],
        worstTime : [],
        avgA11y : 0,
        avgSEO : 0,
        avgPerf: 0,
        avgBestPrac: 0,
        avgTime : 0,
    }

    for(const url in summaryByUrl){
        
        const auditsPerURL = summaryByUrl[url];
        const auditsPerURL_len = auditsPerURL.length;

        if(auditsPerURL_len > 0){
            distinctUrlsCount++;

            const latest = auditsPerURL[(auditsPerURL_len - 1)];
            //console.log(latest)

            const axe = latest.axe;
            const lh = latest.lh;
            latestFlattened.push({
                id: latest.id,
                ts: latest.ts,
                url: url,
                aXeTime: axe.time,
                aXeViolations: axe.violations,
                aXeViolationImpacts: axe.violationsImpacts,
                aXeViolationsTags: axe.violationsTags,
                aXePasses: axe.passes,
                aXeIncomplete: axe.incomplete,
                lhTime: lh.time,
                lhPerf : lh.Performance,
                lhBestPrac: lh.BestPractices,
                lhSEO: lh.SEO,
                lhA11y: lh.A11y
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

    axeStats.avgViolations = getAverageOfProp(latestFlattened, "aXeViolations");
    axeStats.avgPasses = getAverageOfProp(latestFlattened, "aXePasses");
    axeStats.avgIncompletes = getAverageOfProp(latestFlattened, "aXeIncomplete");
    axeStats.avgTime = getAverageOfProp(latestFlattened, "aXeTime");

    
    lighthouseStats.bestA11y = sortByProp(latestFlattened, "lhA11y", true).slice(0, numberOfItemsForStats);
    lighthouseStats.worstA11y = sortByProp(latestFlattened, "lhA11y", false).slice(0, numberOfItemsForStats);

    lighthouseStats.bestSEO = sortByProp(latestFlattened, "lhSEO", true).slice(0, numberOfItemsForStats);
    lighthouseStats.worstSEO = sortByProp(latestFlattened, "lhSEO", false).slice(0, numberOfItemsForStats);

    lighthouseStats.bestPerf = sortByProp(latestFlattened, "lhPerf", true).slice(0, numberOfItemsForStats);
    lighthouseStats.worstPerf = sortByProp(latestFlattened, "lhPerf", false).slice(0, numberOfItemsForStats);

    lighthouseStats.bestBestPrac = sortByProp(latestFlattened, "lhBestPrac", true).slice(0, numberOfItemsForStats);
    lighthouseStats.worstBestPrac = sortByProp(latestFlattened, "lhBestPrac", false).slice(0, numberOfItemsForStats);

    lighthouseStats.bestTime = sortByProp(latestFlattened, "lhTime", true).slice(0, numberOfItemsForStats);
    lighthouseStats.worstTime = sortByProp(latestFlattened, "lhTime", false).slice(0, numberOfItemsForStats);   
    
    
    
    
    lighthouseStats.avgA11y = getAverageOfProp(latestFlattened, "lhA11y");
    lighthouseStats.avgSEO = getAverageOfProp(latestFlattened, "lhSEO");
    lighthouseStats.avgPerf = getAverageOfProp(latestFlattened, "lhPerf");
    lighthouseStats.avgBestPrac = getAverageOfProp(latestFlattened, "lhBestPrac");
    lighthouseStats.avgTime = getAverageOfProp(latestFlattened, "lhTime");

    

    return {
        axeSummary: axeStats,
        lighthouseSummary: lighthouseStats
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
