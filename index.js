/**
        __   __       _____  _           
        \ \ / /      / ____|(_)    /\    
   __ _  \ V /  ___ | (___   _    /  \   
  / _` |  > <  / _ \ \___ \ | |  / /\ \  
 | (_| | / . \|  __/ ____) || | / ____ \ 
  \__,_|/_/ \_\\___||_____/ |_|/_/    \_\
                                         
                                         
 
 aXeSia - open source automated accessibility analyze tool that can evaluate multiple sites at once
 
 https://github.com/BogdanCerovac/aXeSiA 
 
 */

const Sitemapper = require('sitemapper');
const puppeteer = require('puppeteer');
let db = require('./util/DB');

const { sleep } = require('./util/helpers');

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

/******************* CONFIG *********************/

let mainCFG = {
  mainURL: 'https://cerovac.com/a11y/sitemap.xml',
  cookieConsent: false,
  pathForScreenshots : './out/screens/test/'
};

/*
mainCFG = {
  mainURL: 'https://www.itumx.no/sitemap.xml',
  cookieConsent: {
    selector: '#onetrust-accept-btn-handler',
    waitForReload: false
  },
  pathForScreenshots : './out/screens/test/'
};
*/

/***********************************************/

if(process.argv && process.argv.slice(2)){
  const cliArguments = process.argv.slice(2);
  console.log('Received arguments from command line: ', cliArguments);

  cliArguments.forEach( (arg) => {
      const splitted = arg.split("=");
      if(splitted[0] === "mainURL"){
        mainCFG.mainURL = splitted[1];
      }
      if(splitted[0] === "cookieConsent"){
        mainCFG.cookieConsent = splitted[1];
      }
      if(splitted[0] === "pathForScreenshots"){
        mainCFG.pathForScreenshots = splitted[1];
      }

  })

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
  iPad_land,
  /*iPadPro,
  iPadPro_land,
  MacBook_Pro,
  PC_WIN_10_chrome,
  /*PC_WIN_10_FF,
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
      console.log(sitesNum + " unique sites to be processed.");

      // Puppeteer browser object
      const browserObj = await puppeteer.launch({
        headless: false
      });

      // accept cookie consent
      if(mainCFG.cookieConsent !== false){
        const randUrl = sitesUnique[0];
        await acceptCookieConsent(browserObj, randUrl, mainCFG.cookieConsent);
      }

      //db stats before loop
      console.log(db.stats());

      // main loop
      let counter = 0;
      for (const i in sitesUnique) {
        let url = sitesUnique[i];
        //console.log(url)
        console.log("Running tasks for url " + (counter + 1) + " of " + sitesNum);
        // const screens = await getScreenShotsForAllDevices(browserObj, devicesForScreenshots, url, mainCFG.pathForScreenshots);
        const aXeAudit = await getAXEreportForURL(browserObj, url);
        const lighthouseAudit = await getLighthouseReportForURL(browserObj, url);
        const siteimproveAudit = await getSiteimproveAlphaReportForURL(browserObj, url);
        const dbRes = db.insert(domain, url, JSON.stringify({aXeAudit , lighthouseAudit, siteimproveAudit}));
        //console.log(dbRes);
        counter++;
      }

      // check overall status
      if(sitesNum === counter){
        console.log("All " + counter + " urls processed OK");
      }else{
        console.warn("Only " + counter + " of " + sitesNum + " urls processed");
      }
      
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
