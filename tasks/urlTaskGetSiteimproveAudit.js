const { Puppeteer } = require("@siteimprove/alfa-puppeteer");
const { Audit } = require("@siteimprove/alfa-act");
const { default: rules } = require("@siteimprove/alfa-rules");
const {sleep} = require('../util/helpers');

async function getSiteimproveAlphaReportForURL(browserObj, url, ManualUA, timeout){
    console.log('-- getSiteimproveAlphaReportForURL for ' + url);
    return new Promise(async function(resolve, reject) {
        const t0 = new Date().getTime();
        const page = await browserObj.newPage();
        await page.setDefaultNavigationTimeout(timeout);
        await page.setUserAgent(ManualUA);
        await page.setBypassCSP(true);
        await sleep(250);
        await page.goto(url);
        await sleep(250);
  
        let SI = [];
        let rawResults = {};
        let catsTempRes = {};
        let counter = 0;
       
        try {
  
          const handle = await page.evaluateHandle(() => window.document);
          const outcomes = await Audit.of(await Puppeteer.toPage(handle), rules).evaluate();
          // console.log(outcomes);
        
          let result = outcomes.next();
          while (!result.done) {
            counter++;
            //console.log(result.value);
  
            const val = result.value;
            const outcome = val.constructor.name;
            const res = {
              outcome: outcome,
              rule: val.rule ? val.rule : "NA",
              target: (val.target ? (
                {
                  type : val.target.type ? val.target.type : "NA",
                  name : val.target.name ? val.target.name : "NA",
                  id : val.target.id ? val.target.id : "NA",
                  classes: val.target.classes ? val.target.classes : "NA",
                  attributes: val.target.attributes ? val.target.attributes : "NA",
                  style: val.target.style ? val.target.style : "NA",
                  shadow: val.target.shadow ? val.target.shadow : "NA"
                }
              ) : "NA"),
              expectations: val.expectations ? val.expectations : "NA"
            } 
            SI.push(res);
  
            if(catsTempRes[outcome]){
              catsTempRes[outcome]++;
            }else{
              catsTempRes[outcome] = 1;
            }
  
            if(!rawResults[outcome]){
              rawResults[outcome] = [];
            }
            rawResults[outcome].push(result.value);
            
            result = outcomes.next();
          }
  
          
        } catch (error) {
          console.error("getSiteimproveAlphaReportForURL failed with error:", error);
        }
        /*console.log("Loop counter: ", counter);
        console.log("All results : ", SI.length);
        console.log(catsTempRes);*/
        
       
        let violationsImpacts = [];
        let violationsTags = new Set(); //unique only
        if(rawResults.Failed && rawResults.Failed.length > 0){
          rawResults.Failed.map( (violation) => {
            //console.log(violation)
            //console.log(violation.rule._tags)
            //console.log(JSON.stringify(violation.rule._tags))
            if(violation.rule){
  
              try {
                let json = violation.rule.toJSON();
                //console.log("violation.rule json:", json)
  
                let reqs = json.requirements;
                // console.log("requirements : ", reqs);
                reqs.forEach( (req) => {
                  
                  //TODO map A, AA and AAA to SC and then give back impact?
  
                  // looks like we can use this as tags
                  if(req.chapter){
                    //console.log("req.chapter", req.chapter);
                    violationsTags.add(req.chapter);
                  }
  
                  if(req.name){
                    //console.log("req.name", req.name);
                    //console.log(req);
                    violationsTags.add(req.name);
                  }
  
                })
               
                let tags = json.tags;
                // console.log("tags : ", tags);
                tags.forEach( (tag) => {
                  violationsTags.add(tag);
                })
  
              } catch (error) {
                console.error("Can not parse requirements, check! Err:", error);
              }
              
            }
          })
        }
  
        // console.log(violationsImpacts)
        // console.log(violationsTags)
        
        let time = new Date().getTime() - t0;
        const summary = {
          time: time,
          violations: catsTempRes.Failed && catsTempRes.Failed  >= 0 ? catsTempRes.Failed  : "NA",
          violationsImpacts: violationsImpacts,
          violationsTags: Array.from(violationsTags),
          passes: catsTempRes.Passed && catsTempRes.Passed >= 0 ? catsTempRes.Passed : "NA",
          incomplete: catsTempRes.CantTell && catsTempRes.CantTell >= 0 ? catsTempRes.CantTell : "NA",
          inapplicable: catsTempRes.Inapplicable && catsTempRes.Inapplicable >= 0 ? catsTempRes.Inapplicable : "NA",
        }
        
        await page.close();
        resolve(summary);
    });
}

module.exports.getSiteimproveAlphaReportForURL = getSiteimproveAlphaReportForURL;  