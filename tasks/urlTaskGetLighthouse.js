const lighthouse = require('lighthouse');
const {sleep} = require('../util/helpers');

async function getLighthouseReportForURL(browserObj, url, ManualUA, timeout){
    console.log('-- getLighthouseReportForURL for ' + url);
    return new Promise(async function(resolve, reject) {
        const t0 = new Date().getTime();
        const page = await browserObj.newPage();
        await page.setDefaultNavigationTimeout(timeout);
        await page.setUserAgent(ManualUA);
        await page.setBypassCSP(true);
        await sleep(500);
        await page.goto(url);
        await sleep(300);
        const {lhr} = await lighthouse(url, {
          port: (new URL(browserObj.wsEndpoint())).port,
          output: 'json',
          logLevel: 'error',
        });
        
        let time = new Date().getTime() - t0;
        let catsTempRes = {
          time: time,
          Performance : lhr.categories["performance"].score,
          BestPractices : lhr.categories["best-practices"].score,
          SEO: lhr.categories["seo"].score,
          A11y : lhr.categories["accessibility"].score
        };
  
        await sleep(250);
        await page.close();
  
        resolve(catsTempRes);
    });
}

module.exports.getLighthouseReportForURL = getLighthouseReportForURL;
