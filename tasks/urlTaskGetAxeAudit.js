const { AxePuppeteer } = require('@axe-core/puppeteer');
const {sleep} = require('../util/helpers');

async function getAXEreportForURL(browserObj, url){
  console.log('-- Trying to getAXEreportForURL for ' + url);
  return new Promise(async function(resolve, reject) {
      const t0 = new Date().getTime();
      const page = await browserObj.newPage();
      // await page.setUserAgent(ManualUA);
      await page.setBypassCSP(true);
      await page.goto(url);
      await sleep(500);
      //const results = await new AxePuppeteer(page).configure(aXeConfig).analyze();
      //const results = await new AxePuppeteer(page).withTags(aXeTags).analyze();
      const results = await new AxePuppeteer(page).analyze();
      //console.log(results);

      //summary
      let total = 0;

      if(results.violations && results.violations.length >= 0){
        total += results.violations.length;
      }

      if(results.passes && results.passes.length >= 0){
        total += results.passes.length;
      }

      if(results.incomplete && results.incomplete.length >= 0){
        total += results.incomplete.length;
      }

      if(results.inapplicable && results.inapplicable.length >= 0){
        total += results.inapplicable.length;
      }

      let violationsImpacts = [];
      let violationsTags = new Set(); //unique only
      if(results.violations && results.violations.length > 0){
        results.violations.map( (violation) => {
          if(violation.impact){
            violationsImpacts.push(violation.impact);
          }
          if(violation.tags){
            violation.tags.map( tag => {
              violationsTags.add(tag);
            })
          }
        })
      }

      let time = new Date().getTime() - t0;
      const summary = {
        time: time,
        violations: results.violations && results.violations.length >= 0 ? results.violations.length : "NA",
        violationsImpacts: violationsImpacts,
        violationsTags: Array.from(violationsTags),
        passes: results.passes && results.passes.length >= 0 ? results.passes.length : "NA",
        incomplete: results.incomplete && results.incomplete.length >= 0 ? results.incomplete.length : "NA",
        inapplicable: results.inapplicable && results.inapplicable.length >= 0 ? results.inapplicable.length : "NA",
        total: total
      }
      //console.log(summary);
      await page.close();
      resolve(summary);
  });
}

module.exports.getAXEreportForURL = getAXEreportForURL; 