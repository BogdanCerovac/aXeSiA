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
    let latestAxeViolations = new Set();
    let overallAxeImpacts = [];
    let latestSiViolations = new Set();
    let overallSiImpacts = [];

    let axeStats = {};
    let lighthouseStats = {};
    let siteimproveStats = {};

    for(const url in summaryByUrl){
        
        const auditsPerURL = summaryByUrl[url];
        const auditsPerURL_len = auditsPerURL.length;

        if(auditsPerURL_len > 0){
            distinctUrlsCount++;

            const latest = auditsPerURL[(auditsPerURL_len - 1)];

            const axe = latest.axe;
            const lh = latest.lh;
            const si = latest.si;

            latestFlattened.push({
                id: latest.id,
                ts: latest.ts,
                url: url,
                aXeTime: axe.time,
                aXeViolations: axe.violations,
                aXeViolationsImpacts: axe.violationsImpacts,
                aXeViolationsTags: axe.violationsTags,
                aXePasses: axe.passes,
                aXeIncomplete: axe.incomplete,
                lhTime: lh.time,
                lhPerf : lh.Performance,
                lhBestPrac: lh.BestPractices,
                lhSEO: lh.SEO,
                lhA11y: lh.A11y,
                siTime: si.time,
                siViolations : si.violations === "NA" || isNaN(si.violations) ? 0 : si.violations,
                siViolationsImpacts: si.violationsImpacts,
                siViolationsTags: si.violationsTags,
                siPasses : si.passes === "NA" || isNaN(si.passes) ? 0 : si.passes,
                siIncomplete : si.incomplete === "NA" || isNaN(si.incomplete) ? 0 : si.incomplete,
            });

            // axe

            axe.violationsImpacts.map( impact => {
                overallAxeImpacts.push(impact)
            });

            axe.violationsTags.map( tag => {
                latestAxeViolations.add(tag)
            });

           
            if(!axeStats.allViolations){
                axeStats.allViolations = 0;
            }
            axeStats.allViolations += axe.violations;

            if(!axeStats.allPasses){
                axeStats.allPasses = 0;
            }
            axeStats.allPasses += axe.passes;

            if(!axeStats.allIncompletes){
                axeStats.allIncompletes = 0;
            }
            axeStats.allIncompletes += axe.incomplete;

            // si
            si.violationsImpacts.map( impact => {
                overallSiImpacts.push(impact)
            });

            si.violationsTags.map( tag => {
                latestSiViolations.add(tag)
            });

           
            if(!siteimproveStats.allViolations){
                siteimproveStats.allViolations = 0;
            }

            let siViolations_tmp = 0;
            if(si.violations !== "NA"){
                siViolations_tmp = si.violations;
            }
            siteimproveStats.allViolations += siViolations_tmp;

            if(!siteimproveStats.allPasses){
                siteimproveStats.allPasses = 0;
            }

            let siPasses_tmp = 0;
            if(si.passes !== "NA"){
                siPasses_tmp = si.passes;
            }
            siteimproveStats.allPasses += siPasses_tmp;

            if(!siteimproveStats.allIncompletes){
                siteimproveStats.allIncompletes = 0;
            }

            let siIncomplete_tmp = 0;
            if(si.incomplete !== "NA"){
                siIncomplete_tmp = si.incomplete;
            }
            siteimproveStats.allIncompletes += siIncomplete_tmp;
        }
    }

    // how much items shall we show for most/least best/worst
    const numberOfItemsForStats = 5; 

    // axe
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

    axeStats.latestAxeViolations = [... latestAxeViolations];
    axeStats.overallAxeImpacts = overallAxeImpacts;

    // lighthouse
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

    //siteimprove

    siteimproveStats.mostViolations = sortByProp(latestFlattened, "siViolations", true).slice(0, numberOfItemsForStats);
    siteimproveStats.leastViolations = sortByProp(latestFlattened, "siViolations", false).slice(0, numberOfItemsForStats);

    siteimproveStats.mostPasses = sortByProp(latestFlattened, "siPasses", true).slice(0, numberOfItemsForStats);
    siteimproveStats.leastPasses = sortByProp(latestFlattened, "siPasses", false).slice(0, numberOfItemsForStats);

    siteimproveStats.mostTime = sortByProp(latestFlattened, "siTime", true).slice(0, numberOfItemsForStats);
    siteimproveStats.leastTime = sortByProp(latestFlattened, "siTime", false).slice(0, numberOfItemsForStats);

    siteimproveStats.avgViolations = getAverageOfProp(latestFlattened, "siViolations");
    siteimproveStats.avgPasses = getAverageOfProp(latestFlattened, "siPasses");
    siteimproveStats.avgIncompletes = getAverageOfProp(latestFlattened, "siIncomplete");
    siteimproveStats.avgTime = getAverageOfProp(latestFlattened, "siTime");

    siteimproveStats.latestSiViolations = [... latestSiViolations];
    siteimproveStats.overallSiImpacts = overallSiImpacts;

    console.log(siteimproveStats)

    return {
        axeSummary: axeStats,
        lighthouseSummary: lighthouseStats,
        siteimproveSummary: siteimproveStats
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

    const summaries = generateSummaries(summaryByUrl);

    return {
        axeSummary : summaries.axeSummary,
        lighthouseSummary : summaries.lighthouseSummary,
        summaryByUrl
    };
    
}
