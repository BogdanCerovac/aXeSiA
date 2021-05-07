/****************************************************************
        __   __       _____  _           
        \ \ / /      / ____|(_)    /\    
   __ _  \ V /  ___ | (___   _    /  \   
  / _` |  > <  / _ \ \___ \ | |  / /\ \  
 | (_| | / . \|  __/ ____) || | / ____ \ 
  \__,_|/_/ \_\\___||_____/ |_|/_/    \_\
                                         
                                         
 
 aXeSia - open source automated accessibility analyze tool 
 that can process, audit and evaluate multiple URLs in sequence.
 
 https://github.com/BogdanCerovac/aXeSiA 
 
******************************************************************/

const Sitemapper = require('sitemapper');
const puppeteer = require('puppeteer');
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv
let db = require('./util/DB');
const {todaysDate} = require('./util/helpers');

 
const {
  iPhone4,
  iPhone4_land,
  iPhone6,
  iPhone6_land,
  iPhone8,
  iPhone8_land,
  iPhoneX,
  iPhoneX_land,
  iPad,
  iPad_land,
  iPadPro,
  iPadPro_land,
  MacBook_Pro,
  PC_WIN_10_chrome,
  PC_WIN_10_FF,
  PC_WIN_10_Opera,
  PC_WIN_10_Brave
} = require('./util/puppeteerDevices');

/* TASKS */
const acceptCookieConsent = require('./tasks/acceptCookieConsent');
const {getScreenShotsForAllDevices} = require('./tasks/urlTaskGetScreenshots');
const {getAXEreportForURL} = require('./tasks/urlTaskGetAxeAudit');
const {getLighthouseReportForURL} = require('./tasks/urlTaskGetLighthouse');
const {getSiteimproveAlphaReportForURL} = require('./tasks/urlTaskGetSiteimproveAudit');
const urlResponseChecker = require('./tasks/urlResponseChecker');
const urlTaskGetSiteComplexity = require('./tasks/urlTaskGetSiteComplexity');
const urlTaskGetSiteEvents = require('./tasks/urlTaskGetSiteEvents');

/******************* CONFIG *********************/

const ManualUA = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4496.0 Safari/537.36 - AXS1'; // custom user agent
const PageTimeoutMS = 1000 * 60 * 5; // maximum time that we wait for page to be rendered

let mainCFG = {
  mainURL: 'https://cerovac.com/a11y/sitemap.xml',
  cookieConsent: false,
  pathForScreenshots : './out/screens/test/'
};

/*
let mainCFG = {
  mainURL: 'https://www.itumx.no/sitemap.xml',
  cookieConsent: {
    selector: '#onetrust-accept-btn-handler',
    waitForReload: false
  },
  pathForScreenshots : './out/screens/test/'
};
*/

/***********************************************/

// example:  node index.js --mainURL=https://www.example.com/sitemap.xml --cookieConsent.selector=[data-js-kb-cc-btn-accept=\"1\"] --cookieConsent.waitForReload=true

if(process.argv && argv){
  console.log('Received arguments from command line: ', argv);

  if(!argv.mainURL){
    throw new Error("mainURL argument is required minimum!");
  }
  mainCFG.mainURL = argv.mainURL;

  if(argv.cookieConsent && argv.cookieConsent.selector && argv.cookieConsent.waitForReload){
    mainCFG.cookieConsent = {};
    mainCFG.cookieConsent.selector = argv.cookieConsent.selector;
    mainCFG.cookieConsent.waitForReload = argv.cookieConsent.waitForReload;
  }

  console.log('mainCFG set via command line to: ', mainCFG);

}

/***********************************************/

const devicesForScreenshots = [
  iPhone4,
  iPhone4_land,
  /*iPhone6,
  iPhone6_land,
  iPhone8,
  iPhone8_land,
  iPhoneX,
  iPhoneX_land,
  iPad,
  iPad_land,*/
  iPadPro,
  iPadPro_land,
  MacBook_Pro,
  PC_WIN_10_chrome,
  PC_WIN_10_FF,/*
  PC_WIN_10_Opera,
  PC_WIN_10_Brave*/
];

/******* /CONFIG *********/

const started = new Date();

(async () => {
    console.log("Started @ ", started);
    const SitemapURLs = new Sitemapper({
      url: mainCFG.mainURL,
      timeout: 15000, //miliseconds
    });

    try {
      const domain = mainCFG.mainURL.split('https://')[1].split('/sitemap.xml')[0];
      const { sites } = await SitemapURLs.fetch();
      let sitesUnique = [...new Set(sites)];
      const sitesNum = sitesUnique.length;
      if(sitesNum === 0){
        console.error("No sites to process. Please check if sitemap.xml is working etc.")
        process.exit(1);
      }
      console.log(sitesNum + " unique URLs to be processed.");

      // Puppeteer browser object
      const browserObj = await puppeteer.launch({
        headless: true,
        ignoreHTTPSErrors: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
      });

      // accept cookie consent
      if(mainCFG.cookieConsent !== false){
        const randUrl = sitesUnique[0];
        await acceptCookieConsent(browserObj, randUrl, mainCFG.cookieConsent);
      }

      //db stats before loop
      console.log(db.stats());

      //set unique id for whole audit
      const id_audit = todaysDate() + "--" + new Date().getTime();

      // main loop
      let counterAll = 0;

      let urls_processed_ok = [];
      let urls_processed_error = [];
      let urls_not_reachable = [];

      let auditsDoneSuccessfully = 0;

      for (const i in sitesUnique) {
        let url = sitesUnique[i];
        //console.log(url)
        console.log("Running tasks for URL nr. " + (counterAll + 1) + " of " + sitesNum);
        
        // check if url works at all
        const urlResponseCheck = await urlResponseChecker(url);
        if(urlResponseCheck === true){

          // some tasks may cause exceptions, let's handle them
          try {

            //const screens = await getScreenShotsForAllDevices(browserObj, devicesForScreenshots, url, mainCFG.pathForScreenshots, PageTimeoutMS);
            const aXeAudit = await getAXEreportForURL(browserObj, url, ManualUA, PageTimeoutMS);
            const lighthouseAudit = await getLighthouseReportForURL(browserObj, url, ManualUA, PageTimeoutMS);
            const siteimproveAudit = await getSiteimproveAlphaReportForURL(browserObj, url, ManualUA, PageTimeoutMS);
            
            const siteComplexity = await urlTaskGetSiteComplexity(browserObj, url, ManualUA, PageTimeoutMS);
            const siteEvents = await urlTaskGetSiteEvents(browserObj, url, ManualUA, PageTimeoutMS);
            
            let siteComplexityStats = {...siteComplexity, ...siteEvents };
            siteComplexityStats.timeSum = siteComplexity.timeEls + siteEvents.timeEvents;

            const dbRes = db.insert(id_audit, domain, url, JSON.stringify({aXeAudit , lighthouseAudit, siteimproveAudit, siteComplexityStats}));

            if(dbRes.changes === 1 && dbRes.lastInsertRowid > 0){
              urls_processed_ok.push(url);
            }else{
              console.error(url + " failed to save audit in the DataBase ! DB responded: ", dbRes)
              urls_processed_error.push(url);
            }

          } catch (error) {
            console.error(url + " audit not completed OK! Error: ", error)
            urls_processed_error.push(url);
          }
 

        }else{
          console.warn(url + " response was not OK, skipping in audits count. Response check: ", urlResponseCheck);
          urls_not_reachable.push(url);
        }

        counterAll++;
      }

      let num_urls_processed_ok = urls_processed_ok.length;
      let num_urls_processed_error = urls_processed_error.length;
      let num_urls_not_reachable = urls_not_reachable.length;

      // check overall status
      if(sitesNum === counterAll && sitesNum === num_urls_processed_ok){

        console.log("All " + counterAll + " URLs working OK and processed OK");
        auditsDoneSuccessfully = 1;

      }else{

        if(num_urls_processed_error === 0){

          auditsDoneSuccessfully = 1;

          console.log(num_urls_processed_ok + " of " + sitesNum + " URLs was processed OK. ");


        }else{

          console.error(num_urls_processed_error + " of " + sitesNum + " URLs FAILED, these audits can therefore not represent correct status and will be excluded!");

        }
      }

      if(num_urls_not_reachable > 0){

        console.warn(num_urls_not_reachable + " URLs was not reachable and should be investigated manually and ideally removed from sitemap.xml if they are not relevant");
      }

      // add to audit meta
      // (id_audit, domain, urls_all_num, urls_all, urls_ok_num, urls_ok, urls_err_num, urls_err, urls_na_num, urls_na, audit_ok)
      const metaAuditInsert = db.insertMeta(
        id_audit, domain, 
        sitesUnique.length, JSON.stringify(sitesUnique), 
        num_urls_processed_ok, JSON.stringify(urls_processed_ok), 
        num_urls_processed_error, JSON.stringify(urls_processed_error),
        num_urls_not_reachable, JSON.stringify(urls_not_reachable),
        auditsDoneSuccessfully
      );
      
      // db stats after
      console.log(db.stats());

      console.log("Main ended");
      console.log("Ended @ ", new Date());

      await browserObj.close();
    }catch (error) {
        console.log("Main errored: ", error);
        console.log("Ended @ ", new Date());
        process.exit(1);
    }
})();
