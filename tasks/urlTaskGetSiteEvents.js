const {sleep} = require('../util/helpers');

//const a11y_relevant_tags = ["aria", "role", "data"];
const a11y_relevant_tags = ["aria", "role"];

async function evalCDPresults (session, selector = '*') {
  // Unique id for resource clean-up
  const objectGroup = 'cd42b1c4-e3ec-4273-a5c8-1459b5c78ca0';
  // Eval query selector in the browser
  const { result: { objectId } } = await session.send('Runtime.evaluate', {
    expression: `document.querySelectorAll("${selector}")`,
    objectGroup
  }); 

  // returned remote object ID will get the list of descriptors
  const { result } = await session.send('Runtime.getProperties', { objectId }); 

  // Filter out functions and anything that isn't a node
  const descriptors = result
    .filter(x => x.value !== undefined)
    .filter(x => x.value.objectId !== undefined)
    .filter(x => x.value.className !== 'Function');

  let elements = []; 
  for (const descriptor of descriptors) {
    const objectId = descriptor.value.objectId;
    // Add event listeners &description of the node (for attributes)
    Object.assign(descriptor, await session.send('DOMDebugger.getEventListeners', { objectId }));
    Object.assign(descriptor, await session.send('DOM.describeNode', { objectId }));
    elements.push(descriptor);
  }

  // Clean up when done
  await session.send('Runtime.releaseObjectGroup', { objectGroup }); 
  return elements;
}

/** Helper - flat array of key/value pairs to object */
function parseAttributes (array) {
  const result = []; 
  for (let i = 0; i < array.length; i += 2) {
    result.push(array.slice(i, i + 2));
  }
  return Object.fromEntries(result);
}



module.exports = function (browserObj, url) {

    return new Promise(async (resolve, reject) => {
        try {
            console.log('-- urlTaskGetSiteEvents for ' + url);
            const t0 = new Date().getTime();
            const page = await browserObj.newPage();
            // await page.setUserAgent(ManualUA);
            await page.setBypassCSP(true);
            //await sleep(500);
            await page.goto(url);
            let events = [];
            let returned = {};
            const session = await page.target().createCDPSession();
            const result = await evalCDPresults(session);

            let eventsCount = 0;
            let ariaAttrsCount = 0;
            
            for (const { node: { localName, attributes }, listeners } of result) {
                if (listeners.length === 0) { continue; }
                //console.log(attributes)
                //role, aria, lang, 
                const { id, class: _class, ...rest } = parseAttributes(attributes);
                let ariaAttrs = [];
                //console.log(rest)
                for (const key in rest){
                    //console.log(key)
                    a11y_relevant_tags.forEach( (a11yTag) => {
                        if(key.includes(a11yTag)){
                            ariaAttrs.push(key);
                        }
                    })
                }
            
                let descriptor = localName;
                if (id !== undefined) { descriptor += `#${id}`; }
                if (_class !== undefined) { descriptor += `.${_class}`; }
            
                // console.log(`${descriptor}:`);
                for (const { type, handler: { description } } of listeners) {
                    // console.log(`${descriptor} (${type}): ${description}`);
                    events.push({
                        el: descriptor,
                        ariaAttrs,
                        type
                    });
                    eventsCount++;

                    ariaAttrsCount += ariaAttrs.length;
                }
                
            }
            returned.events = events;
            returned.timeEvents = new Date().getTime() - t0;
            returned.ariaAttrsCount = ariaAttrsCount;
            returned.eventsCount = eventsCount;
            //await sleep(250);
            await page.close();
            resolve(returned);

        } catch (e) {
            console.error("-- urlTaskGetSiteEvents errored: ", e)
            reject(e);
        }
    })
}