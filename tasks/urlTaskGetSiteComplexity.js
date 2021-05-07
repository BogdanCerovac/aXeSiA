const {sleep} = require('../util/helpers');

module.exports = function (browserObj, url, ManualUA, timeout) {

    return new Promise(async (resolve, reject) => {
        try {
            console.log('-- urlTaskGetSiteComplexity for ' + url);
            const t0 = new Date().getTime();
            const page = await browserObj.newPage();
            await page.setDefaultNavigationTimeout(timeout);
            await page.setUserAgent(ManualUA);
            await page.setBypassCSP(true);
            //await sleep(500);
            await page.goto(url);

            let returned = {};
            let tagsStats = await page.evaluate(() => {

                const unknownElementWeight = 1;

                    /*

                    Weights to be used to calculate page complexity by using mean with weigths;

                    Manually added weights based on the importance I assume different HTML elements have.
                    For exmaple: form has much more value than a paragraph and a div has no value by itself...
                    This will probably need tweaking but it's better than no weights...

                    https://developer.mozilla.org/en-US/docs/Web/HTML/Element

                    */ 
                    const weights = [
                        {el: "form", w: 10},
                        {el: "button", w: 10},
                        {el: "input", w: 10},
                        {el: "label", w: 10},
                        {el: "fieldset", w: 9},
                        {el: "legend", w: 9},
                        {el: "datalist", w: 9},
                        {el: "meter", w: 9},
                        {el: "select", w: 9},
                        {el: "textarea", w: 9},
                        {el: "progress", w: 9},
                        {el: "details", w: 9},
                        {el: "dialog", w: 9},
                    
                        {el: "iframe", w: 9},
                        {el: "portal", w: 9},
                        {el: "embed", w: 9},
                        {el: "object", w: 9},
                        {el: "video", w: 9},
                        {el: "audio", w: 9},
                        {el: "a", w: 9},
                        {el: "map", w: 9},
                        {el: "h1", w: 9},
                        {el: "h2", w: 9},
                        {el: "h3", w: 9},
                        {el: "h4", w: 9},
                        {el: "h5", w: 9},
                        
                        {el: "p", w: 8},
                        {el: "img", w: 8},
                        {el: "canvas", w: 8},
                        {el: "svg", w: 8},
                        {el: "math", w: 8},
                        {el: "path", w: 8},
                        {el: "rect", w: 8},
                        {el: "picture", w: 8},
                        {el: "figcaption", w: 8},
                        {el: "source", w: 8},
                        {el: "blockquote", w: 8},
                        {el: "q", w: 8},
                        {el: "symbol", w: 8},
                        {el: "li", w: 8},
                        {el: "dl", w: 8},
                        {el: "dd", w: 8},
                        {el: "dt", w: 8},
                        {el: "details", w: 8},
                        {el: "summary", w: 8},
                        {el: "table", w: 8},
                        {el: "caption", w: 8},
                        {el: "option", w: 8},
                        {el: "optgroup", w: 8},

                        {el: "pre", w: 8},
                        {el: "abbr", w: 8},
                        {el: "cite", w: 8},
                        {el: "dfn", w: 8},
                        {el: "kbd", w: 8},
                        {el: "mark", w: 8},
                        {el: "area", w: 8},
                        {el: "track", w: 8},

                        {el: "main", w: 7},
                        {el: "nav", w: 7},
                        {el: "section", w: 7},
                        {el: "article", w: 7},
                        {el: "footer", w: 7},
                        {el: "header", w: 7},
                        {el: "address", w: 7},
                        {el: "time", w: 7},
                        {el: "aside", w: 7},
                        {el: "ul", w: 7},
                        {el: "ol", w: 7},
                        {el: "tr", w: 7},
                        {el: "th", w: 7},
                        {el: "td", w: 7},
                        {el: "col", w: 7},
                        {el: "colgroup", w: 7},
                        {el: "tfoot", w: 7},
                        {el: "thead", w: 7},
                    
                        {el: "s", w: 5},
                        {el: "i", w: 5},
                        {el: "b", w: 5},
                        {el: "small", w: 5},
                        {el: "em", w: 5},
                        {el: "strong", w: 5},
                        {el: "sub", w: 5},
                        {el: "sup", w: 5},
                        {el: "u", w: 5},
                        {el: "del", w: 5},
                        {el: "ins", w: 5},

                        {el: "hr", w: 3},
                        {el: "use", w: 3},

                        {el: "br", w: 2},
                        {el: "wbr", w: 2},

                        {el: "template", w: 0},
                        {el: "slot", w: 0},
                        {el: "base", w: 0},
                        {el: "link", w: 0},
                        {el: "title", w: 0},
                        {el: "script", w: 0},
                        {el: "style", w: 0},
                        {el: "noscript", w: 0},
                        {el: "html", w: 0},
                        {el: "head", w: 0},
                        {el: "body", w: 0},
                        {el: "meta", w: 0},
                        {el: "span", w: 0},
                        {el: "div", w: 0},
                    ];



                function getWeightOfEl(el){
                    let weightForEl = weights.filter(weight => weight.el === el);
                    console.log(weightForEl)
                    return  weightForEl.length === 1 ? weightForEl[0].w :  unknownElementWeight;
                }


                let allTags = {};
                let allTagsCount = 0;
                const elems = document.querySelectorAll('*');
                for(i = 0; i < elems.length; i++){
                    const tagName = elems[i].tagName.toLowerCase()
                    if(allTags[ tagName ]){
                        allTags[ tagName ]++;
                    }else{
                        allTags[ tagName ] = 1;
                    }
                    allTagsCount++;
                }

                const tagsSummary = Object.entries(allTags).sort((a,b) => b[1]-a[1]).map(el=>{ 
                    return {"el": el[0], "num": el[1], "weight" : ( getWeightOfEl(el[0]) * el[1] )}
                });

                const allWeigtsSum = tagsSummary.reduce((a, b) => ({weight: a.weight + b.weight})).weight;

                avgWeights = allWeigtsSum / tagsSummary.length;

                return {
                    tagsSummary,
                    allTagsCount,
                    allWeigtsSum,
                    avgWeights
                }
            })

            returned.tagsSummary = tagsStats.tagsSummary;
            returned.allTagsCount = tagsStats.allTagsCount;
            returned.allWeigtsSum = tagsStats.allWeigtsSum;
            returned.avgWeights = tagsStats.avgWeights;
            returned.timeEls = new Date().getTime() - t0;
           
            //await sleep(250);
            await page.close();

            resolve(returned);

        } catch (e) {
            console.error("-- urlTaskGetSiteComplexity errored: ", e)
            reject(e);
        }
    })
}