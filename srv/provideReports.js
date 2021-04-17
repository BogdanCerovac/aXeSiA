const Database = require('better-sqlite3');
const db = new Database('./out/audits.db', { /*verbose: console.log*/ });
const { cleanURL } = require('../util/helpers');

function groupCountArrayItems(array){
    let arrCount = {};
    let returned = [];
    array.map( item => {
        if(arrCount.hasOwnProperty(item)){
            arrCount[item]++
        }else{
            arrCount[item] = 1;
        }
        return;
    });
    for(let key in arrCount){
        const count = arrCount[key];
        returned.push(key + " : " + count)
    }
    return returned;

}

function getSumOfProp(arr, prop){
    //some may have NA as a result, so we must take them away to get the correct average
    let filtered = arr.filter( item => item[prop] !== "NA");
    const sum = filtered.reduce((total, next) => total + next[prop], 0)
    return sum;
}

function getAverageOfProp(arr, prop){
    //some may have NA as a result, so we must take them away to get the correct average
    let filtered = arr.filter( item => item[prop] !== "NA");
    let countAll = filtered.length;

    const average = filtered.reduce((total, next) => total + next[prop], 0) / countAll;
    return average;
}

function sortByProp(arr, prop, desc = true){
    //some may have NA as a result, so we must take them away to get the correct average
    let filtered = arr.filter( item => item[prop] !== "NA");
    if(desc){
        return filtered.sort((a, b) => (a[prop] < b[prop]) ? 1 : -1);
    }else{
        return filtered.sort((a, b) => (a[prop] > b[prop]) ? 1 : -1);
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

    let complexityStats = {};

    let totalStats = {
        a11y :{
            passes : 0,
            failures: 0,
            incomplete: 0,
        },
        SEO: 0,
        cpx: {
            avgElWeights: 0,
            avgEvents: 0
        }
    };

    let historicalSummariesFlatPerUrl = {};

    for(const url in summaryByUrl){
        
        const auditsPerURL = summaryByUrl[url];
        const auditsPerURL_len = auditsPerURL.length;
       

        if(auditsPerURL_len > 0){
            distinctUrlsCount++;

            for(let i = 0; i < auditsPerURL_len; i++){
                const audit = auditsPerURL[i];             

                const axe = audit.axe;
                const lh = audit.lh;
                const si = audit.si;
                const cpx = audit.cpx;

                if(!historicalSummariesFlatPerUrl.hasOwnProperty(url)){
                    historicalSummariesFlatPerUrl[url] = [];
                }
                historicalSummariesFlatPerUrl[url].push({
                    id: audit.id,
                    ts: audit.ts,
                    aXeTime: axe.time,
                    aXeViolations: axe.violations,
                    aXeViolationsImpacts: axe.violationsImpacts,
                    aXeViolationsTags: axe.violationsTags,
                    aXePasses: axe.passes,
                    aXeIncomplete: axe.incomplete,
                    siTime: si.time,
                    siViolations : si.violations,
                    siViolationsImpacts: si.violationsImpacts,
                    siViolationsTags: si.violationsTags,
                    siPasses : si.passes,
                    siIncomplete : si.incomplete,
                    lhTime: lh.time,
                    lhPerf : lh.Performance,
                    lhBestPrac: lh.BestPractices,
                    lhSEO: lh.SEO,
                    lhA11y: lh.A11y,
                    cpxElWeights: cpx.avgWeights,
                    cpxEvents: cpx.eventsCount,
                    cpxTime: cpx.timeSum
                });
            }

            const latest = auditsPerURL[(auditsPerURL_len - 1)];
            const axe = latest.axe;
            const lh = latest.lh;
            const si = latest.si;
            const cpx = latest.cpx;

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
                siTime: si.time,
                siViolations : si.violations,
                siViolationsImpacts: si.violationsImpacts,
                siViolationsTags: si.violationsTags,
                siPasses : si.passes,
                siIncomplete : si.incomplete,
                lhTime: lh.time,
                lhPerf : lh.Performance,
                lhBestPrac: lh.BestPractices,
                lhSEO: lh.SEO,
                lhA11y: lh.A11y,
                cpxElWeights: cpx.avgWeights,
                cpxEvents: cpx.eventsCount,
                cpxTime: cpx.timeSum

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

            // TODO complexityStats
        }
    }

    // how much items shall we show for most/least best/worst
    const numberOfItemsForStats = 5; 

    // axe
    axeStats.name = "aXe";
    axeStats.type = "aXe"; // same as start of prop names - "aXeViolations"
    axeStats.mostViolations = sortByProp(latestFlattened, "aXeViolations", true).slice(0, numberOfItemsForStats);
    axeStats.leastViolations = sortByProp(latestFlattened, "aXeViolations", false).slice(0, numberOfItemsForStats);
    axeStats.unclearViolations = latestFlattened.filter( all => all.aXeViolations === "NA");

    axeStats.mostPasses = sortByProp(latestFlattened, "aXePasses", true).slice(0, numberOfItemsForStats);
    axeStats.leastPasses = sortByProp(latestFlattened, "aXePasses", false).slice(0, numberOfItemsForStats);
    axeStats.unclearPasses = latestFlattened.filter( all => all.aXePasses === "NA");

    axeStats.mostIncompletes = sortByProp(latestFlattened, "aXeIncomplete", true).slice(0, numberOfItemsForStats);
    axeStats.leastIncompletes = sortByProp(latestFlattened, "aXeIncomplete", false).slice(0, numberOfItemsForStats);
    axeStats.unclearIncompletes = latestFlattened.filter( all => all.aXeIncomplete === "NA");

    axeStats.mostTime = sortByProp(latestFlattened, "aXeTime", true).slice(0, numberOfItemsForStats);
    axeStats.leastTime = sortByProp(latestFlattened, "aXeTime", false).slice(0, numberOfItemsForStats);

    axeStats.avgViolations = getAverageOfProp(latestFlattened, "aXeViolations");
    axeStats.avgPasses = getAverageOfProp(latestFlattened, "aXePasses");
    axeStats.avgIncompletes = getAverageOfProp(latestFlattened, "aXeIncomplete");
    axeStats.avgTime = getAverageOfProp(latestFlattened, "aXeTime");

    axeStats.latestViolations = [... latestAxeViolations];
    axeStats.overallImpacts = groupCountArrayItems(overallAxeImpacts);

    // lighthouse
    lighthouseStats.name = "Lighthouse";
    lighthouseStats.type = "lh"; // same as start of prop names - "lhA11y"
    lighthouseStats.bestA11y = sortByProp(latestFlattened, "lhA11y", true).slice(0, numberOfItemsForStats);
    lighthouseStats.worstA11y = sortByProp(latestFlattened, "lhA11y", false).slice(0, numberOfItemsForStats);

    lighthouseStats.bestSEO = sortByProp(latestFlattened, "lhSEO", true).slice(0, numberOfItemsForStats);
    lighthouseStats.worstSEO = sortByProp(latestFlattened, "lhSEO", false).slice(0, numberOfItemsForStats);

    lighthouseStats.bestPerf = sortByProp(latestFlattened, "lhPerf", true).slice(0, numberOfItemsForStats);
    lighthouseStats.worstPerf = sortByProp(latestFlattened, "lhPerf", false).slice(0, numberOfItemsForStats);

    lighthouseStats.bestBestPrac = sortByProp(latestFlattened, "lhBestPrac", true).slice(0, numberOfItemsForStats);
    lighthouseStats.worstBestPrac = sortByProp(latestFlattened, "lhBestPrac", false).slice(0, numberOfItemsForStats);

    lighthouseStats.bestTime = sortByProp(latestFlattened, "lhTime", false).slice(0, numberOfItemsForStats);
    lighthouseStats.worstTime = sortByProp(latestFlattened, "lhTime", true).slice(0, numberOfItemsForStats);   
    
    lighthouseStats.avgA11y = getAverageOfProp(latestFlattened, "lhA11y");
    lighthouseStats.avgSEO = getAverageOfProp(latestFlattened, "lhSEO");
    lighthouseStats.avgPerf = getAverageOfProp(latestFlattened, "lhPerf");
    lighthouseStats.avgBestPrac = getAverageOfProp(latestFlattened, "lhBestPrac");
    lighthouseStats.avgTime = getAverageOfProp(latestFlattened, "lhTime");

    //siteimprove
    siteimproveStats.name = "Siteimprove";
    siteimproveStats.type = "si"; // same as start of prop names - "siViolations"
    siteimproveStats.mostViolations = sortByProp(latestFlattened, "siViolations", true).slice(0, numberOfItemsForStats);
    siteimproveStats.leastViolations = sortByProp(latestFlattened, "siViolations", false).slice(0, numberOfItemsForStats);
    siteimproveStats.unclearViolations = latestFlattened.filter( all => all.siViolations === "NA");

    siteimproveStats.mostPasses = sortByProp(latestFlattened, "siPasses", true).slice(0, numberOfItemsForStats);
    siteimproveStats.leastPasses = sortByProp(latestFlattened, "siPasses", false).slice(0, numberOfItemsForStats);
    siteimproveStats.unclearPasses = latestFlattened.filter( all => all.siPasses === "NA");

    siteimproveStats.mostIncompletes = sortByProp(latestFlattened, "siIncomplete", true).slice(0, numberOfItemsForStats);
    siteimproveStats.leastIncompletes = sortByProp(latestFlattened, "siIncomplete", false).slice(0, numberOfItemsForStats);
    siteimproveStats.unclearIncompletes = latestFlattened.filter( all => all.siIncomplete === "NA");

    siteimproveStats.mostTime = sortByProp(latestFlattened, "siTime", true).slice(0, numberOfItemsForStats);
    siteimproveStats.leastTime = sortByProp(latestFlattened, "siTime", false).slice(0, numberOfItemsForStats);

    siteimproveStats.avgViolations = getAverageOfProp(latestFlattened, "siViolations");
    siteimproveStats.avgPasses = getAverageOfProp(latestFlattened, "siPasses");
    siteimproveStats.avgIncompletes = getAverageOfProp(latestFlattened, "siIncomplete");
    siteimproveStats.avgTime = getAverageOfProp(latestFlattened, "siTime");

    siteimproveStats.latestViolations = [... latestSiViolations];
    siteimproveStats.overallImpacts = groupCountArrayItems(overallSiImpacts);


    //complexitySummary

    complexityStats.name = "Complexity";
    complexityStats.type = "cpx"; // same as start of prop names - "siViolations"

    complexityStats.mostElWeights = sortByProp(latestFlattened, "cpxElWeights", true).slice(0, numberOfItemsForStats);
    complexityStats.leastElWeights = sortByProp(latestFlattened, "cpxElWeights", false).slice(0, numberOfItemsForStats);

    complexityStats.mostEvents = sortByProp(latestFlattened, "cpxEvents", true).slice(0, numberOfItemsForStats);
    complexityStats.leastEvents = sortByProp(latestFlattened, "cpxEvents", false).slice(0, numberOfItemsForStats);

    complexityStats.mostTime = sortByProp(latestFlattened, "cpxTime", true).slice(0, numberOfItemsForStats);
    complexityStats.leastTime = sortByProp(latestFlattened, "cpxTime", false).slice(0, numberOfItemsForStats);

    complexityStats.avgElWeights = getAverageOfProp(latestFlattened, "cpxElWeights");
    complexityStats.avgEvents = getAverageOfProp(latestFlattened, "cpxEvents");

    complexityStats.avgTime = getAverageOfProp(latestFlattened, "cpxTime");

    //total

    totalStats.a11y.passes = (getSumOfProp(latestFlattened, "siPasses") + getSumOfProp(latestFlattened, "aXePasses"));
    totalStats.a11y.failures = (getSumOfProp(latestFlattened, "siViolations") + getSumOfProp(latestFlattened, "aXeViolations"));
    totalStats.a11y.passesVsFailures = (totalStats.a11y.passes / totalStats.a11y.failures).toFixed(5);
    totalStats.a11y.passesAndFailures = ((totalStats.a11y.passes / (totalStats.a11y.passes + totalStats.a11y.failures)) * 100).toFixed(5) ;
    totalStats.a11y.incompletes = (getSumOfProp(latestFlattened, "siIncomplete") + getSumOfProp(latestFlattened, "aXeIncomplete"));

    totalStats.SEO = ((getSumOfProp(latestFlattened, "lhSEO")) / distinctUrlsCount).toFixed(5);
    totalStats.Performance = ((getSumOfProp(latestFlattened, "lhPerf")) / distinctUrlsCount).toFixed(5);
    totalStats.BestPractices = ((getSumOfProp(latestFlattened, "lhBestPrac")) / distinctUrlsCount).toFixed(5);
    
    const sumAllAudits = totalStats.a11y.passes + totalStats.a11y.failures + totalStats.a11y.incompletes;
    totalStats.a11y.passesProc = totalStats.a11y.passes / sumAllAudits;
    totalStats.a11y.failuresProc = totalStats.a11y.failures / sumAllAudits;
    totalStats.a11y.incompletesProc =  totalStats.a11y.incompletes / sumAllAudits;

    totalStats.cpx.avgElWeights = ((getSumOfProp(latestFlattened, "cpxElWeights")) / distinctUrlsCount).toFixed(5);
    totalStats.cpx.avgEvents = ((getSumOfProp(latestFlattened, "cpxEvents")) / distinctUrlsCount).toFixed(5);

    const dateTimeLatest = latestFlattened.sort( (a,b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())[0].ts;

    return {
        dateTimeLatest : dateTimeLatest,
        distinctUrlsCount: distinctUrlsCount,
        axeSummary: axeStats,
        siSummary: siteimproveStats,
        lhSummary: lighthouseStats,
        cpxSummary: complexityStats,
        totalStats: totalStats,
        historicalSummariesFlatPerUrl: historicalSummariesFlatPerUrl
    }
}

exports.getAllReports = function(domain = "all"){

    let selectedAll = [];
    try {

        let selectAll = db.prepare(
            `SELECT 
            audits.id,
            audits.ts, 
            audits.id_audit, 
            audits.domain, 
            url, 
            json_extract(audit, '$.aXeAudit') as aXeAudit, 
            json_extract(audit, '$.lighthouseAudit') as lighthouseAudit , 
            json_extract(audit, '$.siteimproveAudit') as siteimproveAudit, 
            json_extract(audit, '$.siteComplexityStats') as siteComplexityStats
        FROM audits
        LEFT JOIN audits_meta ON audits.id_audit = audits_meta.id_audit
        WHERE audit_ok = 1`,
        );

        if(domain !== "all"){

            selectAll = db.prepare(
                `SELECT 
                audits.id,
                audits.ts, 
                audits.id_audit, 
                audits.domain, 
                url, 
                json_extract(audit, '$.aXeAudit') as aXeAudit, 
                json_extract(audit, '$.lighthouseAudit') as lighthouseAudit , 
                json_extract(audit, '$.siteimproveAudit') as siteimproveAudit, 
                json_extract(audit, '$.siteComplexityStats') as siteComplexityStats
            FROM audits
            LEFT JOIN audits_meta ON audits.id_audit = audits_meta.id_audit
            WHERE audit_ok = 1
                AND audits.domain = '${domain}'`,
            );

        }
        
        selectedAll = selectAll.all();
    } catch (error) {
        console.error("Failed to run getAllReports: ", error);
    }

    const summaryByDomain = selectedAll.reduce((groups, item) => {
        const group = (groups[item.domain] || {});
        const itemTmp = {
            id: item.id,
            ts: item.ts,
            axe: JSON.parse(item.aXeAudit),
            si: JSON.parse(item.siteimproveAudit),
            lh: JSON.parse(item.lighthouseAudit),
            cpx: JSON.parse(item.siteComplexityStats)
        };
        
        if(!group[item.url]){
            group[item.url] = [];
        }
        group[item.url].push(itemTmp);

        groups[item.domain] = group;
        return groups;
      }, {});

    let returned = [];

    for(const domain in summaryByDomain){
        const summaries = generateSummaries(summaryByDomain[domain]);

        returned.push({
            uid: cleanURL(domain),
            domain: domain,
            dateTimeLatest: summaries.dateTimeLatest,
            distinctUrlsCount: summaries.distinctUrlsCount,
            axeSummary : summaries.axeSummary,
            siSummary : summaries.siSummary,
            lhSummary : summaries.lhSummary,
            cpxSummary: summaries.cpxSummary,
            totalStats : summaries.totalStats,
            summaryByDomain: summaryByDomain,
            historicalSummariesFlatPerUrl: summaries.historicalSummariesFlatPerUrl
            
        })
    }
    
    return returned;
    
}
