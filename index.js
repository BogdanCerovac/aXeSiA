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

const testTask = require('./tasks/urlTestTask');
const acceptCookieConsent = require('./tasks/acceptCookieConsent');

/****************/

const mainCFG = {
  mainURL: 'https://www.cookiebot.com/sitemap.xml',
  cookieConsent: {
    selector: '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
    waitForReload: false
  }
};

/****************/


const started = new Date();

(async () => {
    console.log("Started @ ", started);
    const SitemapURLs = new Sitemapper({
      url: mainCFG.mainURL,
      timeout: 15000, // 15 seconds
    });
  
    try {
      const { sites } = await SitemapURLs.fetch();
      // console.log(sites);
      const sitesNum = sites.length;
  
      if(sitesNum === 0){
        console.error("No sites to process. Please check if sitemap.xml is working etc.")
        process.exit(1);
      }
  
      console.log(sitesNum + " sites to be processed.");

      // manage cookies with Puppeteer
      const browserObj = await puppeteer.launch({
        headless: false
      });

      // accept cookie consent
      if(mainCFG.cookieConsent !== false){
        const randUrl = sites[0];
        console.log("acceptCookieConsent on URL: ", randUrl);
        await acceptCookieConsent(browserObj, randUrl, mainCFG.cookieConsent);
      }
      
      // main loop
      let counter = 0;
      for (const i in sites) {
        let url = sites[i];
        const res = await testTask(url, i);
        console.log(res);
        counter++;
      }

    }catch (error) {
        console.log("Main errored: ", error);
        console.log("Ended @ ", new Date());
        process.exit(1);
      }
})();

