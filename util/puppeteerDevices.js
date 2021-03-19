const puppeteer = require("puppeteer");
/* https://github.com/puppeteer/puppeteer/blob/main/src/common/DeviceDescriptors.ts */

const iPhone4 = puppeteer.devices["iPhone 4"];
const iPhone4_land = puppeteer.devices["iPhone 4 landscape"];
const iPhone6 = puppeteer.devices["iPhone 6"];
const iPhone6_land = puppeteer.devices["iPhone 6 landscape"];
const iPhone8 = puppeteer.devices["iPhone 8"];
const iPhone8_land = puppeteer.devices["iPhone 8 landscape"];
const iPhoneX = puppeteer.devices["iPhone X"];
const iPhoneX_land = puppeteer.devices["iPhone X landscape"];

const iPad = puppeteer.devices["iPad"];
const iPad_land = puppeteer.devices["iPad landscape"];
const iPadPro = puppeteer.devices["iPad Pro"];
const iPadPro_land = puppeteer.devices["iPad Pro landscape"];

/* custom devices  */
const MacBook_Pro = {
    name: 'MacBook_Pro',
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
    viewport: {
      width: 2560,
      height: 1600,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: false,
    },
};

const PC_WIN_10_chrome = {
    name: 'PC_WIN_10_chrome',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.190 Safari/537.36',
    viewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: false,
    },
};

const PC_WIN_10_FF = {
    name: 'PC_WIN_10_FF',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:86.0) Gecko/20100101 Firefox/86.0',
    viewport: {
      width: 1366,
      height: 768,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: true,
    },
};

const PC_WIN_10_Opera = {
    name: 'PC_WIN_10_Opera',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36 OPR/74.0.3911.107',
    viewport: {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: true,
    },
};

const PC_WIN_10_Brave = {
    name: 'PC_WIN_10_Brave',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Brave Chrome/88.0.4324.192 Safari/537.36',
    viewport: {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      isLandscape: true,
    },
}

module.exports = {
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
}
