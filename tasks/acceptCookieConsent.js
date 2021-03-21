const {sleep} = require('../util/helpers');

module.exports = function(browserObj, url, cookieConsentObj) {

  return new Promise(async function(resolve, reject) {

        console.log("acceptCookieConsent on " + url);
        const page = await browserObj.newPage();
        // await page.setUserAgent("Custom User agent?");
        await page.setBypassCSP(true);
        await page.goto(url);
        await sleep(1000);
  
        const CSSselector = cookieConsentObj.selector;
        const waitForReload = cookieConsentObj.waitForReload;
        
        page.waitForSelector(CSSselector, {visible: true, timeout: 5000}).then( async () => {
          console.log("acceptCookieConsent - waitForSelector");
          
          let done = false;
          if(!waitForReload){
            done = await page.click(CSSselector);
          }else{
            console.log("acceptCookieConsent - waitForReload");
            done = await Promise.all([
              page.click(CSSselector),
              page.waitForNavigation({ waitUntil: 'networkidle0' }),
            ]);
          }

          await page.close();
          resolve(done);
          console.log("acceptCookieConsent - waitForSelector done");

        }).catch(e => {
          console.log('acceptCookieConsent - waitForSelector errored:', e);
          
          page.waitForFunction("document.querySelector('"+CSSselector+"')", {timeout: 5000}).then( async () => {
      
            console.log("acceptCookieConsent - waitForFunction started");
            let done = false;

            if(!waitForReload){
              done = await page.evaluate( (CSSselector) => {
                // this will be executed within the page, that was loaded before
                document.querySelector(CSSselector).click();
              });
            }else{
              console.log("acceptCookieConsent - waitForReload");
              done = await Promise.all([
                page.evaluate( (CSSselector) => {
                  // this will be executed within the page, that was loaded before
                  document.querySelector(CSSselector).click();
                }),
                page.waitForNavigation({ waitUntil: 'networkidle0' }),
              ]);
            }
            
            await page.close();
            resolve(done);
          }).catch(async (e) => {
            console.error("acceptCookieConsent - Failed to click, giving up with error:", e);
            await page.close();
            reject(true);
          });

        });

  });
}
