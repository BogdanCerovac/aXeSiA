const lighthouse = require('lighthouse');
const {sleep} = require('../util/helpers');

async function getLighthouseReportForURL(browserObj, url, ManualUA, timeout){
    console.log('-- getLighthouseReportForURL for ' + url);

    return new Promise(async function(resolve, reject) {
        const t0 = new Date().getTime();

        // close all pages before - https://github.com/puppeteer/puppeteer/issues/3250
        // trying to prevent 'You probably have multiple tabs open to the same origin.' error
        /*const openPages = await browserObj.pages();
        for (const openPage of openPages) {
          if (!await openPage.isClosed()) {
              console.log(openPage.url());
              await openPage.close();
              console.log("Lighthouse closed a page")
          }
        }*/


        const page = await browserObj.newPage();
        // await page._client.send('ServiceWorker.disable');
        await page.setDefaultNavigationTimeout(timeout);
        await page.setUserAgent(ManualUA);
        await page.setBypassCSP(true);
        await sleep(500);
        await page.goto(url);
        await sleep(500);
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
