const {sleep, createFolderIfNotFound, cleanURL, todaysDate} = require('../util/helpers');

async function getScreenShotWithDevice(browserObj, device, url, pathForScreenshots){
    // console.log(device)
    console.log('-- getScreenShot as ' + device.name + ' for ' + url);
    return new Promise(async function(resolve, reject) {
      try{
        const page = await browserObj.newPage();
        await page.emulate(device);
        await sleep(500);
        await page.goto(url);
        await sleep(750);
        const todaysFolder = pathForScreenshots + "/" + todaysDate();
        createFolderIfNotFound(todaysFolder);
        const screenshot = await page.screenshot({path: todaysFolder + '/'+ cleanURL(url) + '__' + device.name + '_' + new Date().getTime() + '.png', fullPage: true });
        await sleep(250);
        await page.close();
        resolve(screenshot);
      }catch(err){
        reject(err)
      }
    });
}

async function getScreenShotsForAllDevices(browserObj, devices, url, pathForScreenshots){
    console.log('-- Trying to getScreenShotsForAllDevices for ' + url);
    let promises = [];
    for(let device of devices){
      promises.push(await getScreenShotWithDevice(browserObj, device, url, pathForScreenshots));
    }
    return await Promise.all(promises);
  
}

module.exports.getScreenShotsForAllDevices = getScreenShotsForAllDevices;
