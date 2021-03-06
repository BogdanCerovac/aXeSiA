'use strict';

// external links
function addNoOpener(link) {
    let linkTypes = (link.getAttribute('rel') || '').split(' ');
    if (!linkTypes.includes('noopener')) {
      linkTypes.push('noopener');
    }
    link.setAttribute('rel', linkTypes.join(' ').trim());
}
  
function addNewTabMessage(link) {
    if (!link.querySelector('.screen-reader-only')) {
      link.insertAdjacentHTML('beforeend', '<span class="screen-reader-only">(opens in a new tab)</span>');
    }
}
  
document.querySelectorAll('a[target="_blank"]').forEach(link => {
    addNoOpener(link);
    addNewTabMessage(link);
});

function trimDecimals(decimal){
    if(decimal.toString().includes('.')){
        const tmp = decimal.toString().split('.')
        return parseFloat(tmp[0] + '.' + tmp[1].substring(0, 2));
    }else{
        return decimal;
    }

}

//url as id has to be cleaned
function cleanUrl(url){
    return url.replace(/[^a-z\_\-A-Z0-9]/g, '_');
}

function makeUid(length = 5) {
    let result           = '';
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
 
// can be used for all accessibility reports, as long as they respect same data structure and naming
function renderDetailsForA11y(details, type){
    let violationsHTML = ``;
    if(details.violationsImpacts.length > 0){
        const uid = makeUid();
        violationsHTML += `<p id="${uid}">${typeToTitleString(type)} - violation impacts:</p><ul aria-labelledby="${uid}">`;
        let violationImpacts = '';
        details.violationsImpacts.map(impact => violationImpacts += `<li>${impact}</li>`);
        violationsHTML += `${violationImpacts}</ul>`;
    }

    if(details.violationsTags.length > 0){
        const uid = makeUid();
        violationsHTML += `<p id="${uid}">${typeToTitleString(type)} - violation tags:</p><ul aria-labelledby="${uid}">`;
        let violationTags = '';
        details.violationsTags.map(tag => violationTags += `<li>${tag}</li>`);
        violationsHTML += `${violationTags}</ul>`;
    }

    const total = [details.passes, details.incomplete, details.inapplicable, details.violations].map( num => !isNaN(num) && num >= 0 ? num : 0  ).reduce(function(a, b) { return a + b; }, 0);
    return `<div class="table-wrapper"><table class="audit-details-table ${type}-details-table">
    <caption>${typeToTitleString(type)} - audit details </caption>
    <tr>
        <th scope="col">Time <span class="sr-only">for ${typeToTitleString(type)}</span></th>
        <th scope="col">Passes  <span class="sr-only">for ${typeToTitleString(type)}</span></th>
        <th scope="col">Violations  <span class="sr-only">for ${typeToTitleString(type)}</span></th>
        <th scope="col">Incompletes  <span class="sr-only">for ${typeToTitleString(type)}</span></th>
        <th scope="col">Inapplicable  <span class="sr-only">for ${typeToTitleString(type)}</span></th>
        <th scope="col">Total  <span class="sr-only">for ${typeToTitleString(type)}</span></th>
    </tr>
    <tr>
        <td>${details.time} ms</td>
        <td>${details.passes}</td>
        <td>${details.violations}</td>
        <td>${details.incomplete}</td>
        <td>${details.inapplicable}</td>
        <td>${total}</td>
    </tr>
  </table></div>

  <div class="violations-summary">${violationsHTML}</div>
`;
}

function typeToTitleString(type){
    switch (type) {
        case 'axe':
            return 'aXe summary';
        case 'si':
            return 'Siteimprove summary';
        case 'lh':
            return 'Lighthouse summary';
        case 'cpx':
            return 'Complexity summary';
        default:
            console.error(`typeToTitleString ${type} not supported yet`);
            return  `${type} not supported yet`; 
    }
}

//render details for all types together
function renderDetailsForAllTypes(details){

    const keys = Object.keys(details).filter( item => item !== "id" && item !== "ts");
    let toRender = '';
    keys.map( key => {
        if(details.hasOwnProperty(key)){
            toRender += `<h4>${typeToTitleString(key)}</h4>`;
            toRender += renderDetailsPerType(details[key], key);
        }else{
            console.error(key + " not found in ", details)
        }
        return;
    });
    return toRender;
}

function cpxRenderEvents(events){
    let returned =  `<div class="table-wrapper"><table class="cpxRenderEvents"><caption>Events:</caption><thead><th scope="col">Element</th><th scope="col">ARIAs</th><th scope="col">Event</th></thead><tbody>`;
    events.map(ev => {
        returned += `<tr><td>${ev.el}</td><td>${ev.ariaAttrs.join(",")}</td><td>${ev.type}</td></tr>`
    });
    returned += `</tbody></table></div>`;
    return returned;
}

function cpxRenderTagsSummary(tags){
    let returned =  `<div class="table-wrapper"><table class="cpxRenderEvents"><caption>Tags summary:</caption><thead><th scope="col">Element</th><th scope="col">Number</th><th scope="col">Weight</th></thead><tbody>`;
    tags.map(tag => {
        returned += `<tr><td>${tag.el}</td><td>${tag.num}</td><td>${tag.weight}</td></tr>`
    });
    returned += `</tbody></table></div>`;
    return returned;
}

//render details based on one type
function renderDetailsPerType(details, type){
    switch (type) {
        case 'axe': 
            return renderDetailsForA11y(details, type);
        case 'si':
            return renderDetailsForA11y(details, type);
        case 'lh':
            return `
            <div class="details ${type}-details">
                <p>Time: ${details.time} ms</p>
                <p>Accessibility: ${details.A11y}</p>
                <p>SEO: ${details.SEO}</p>
                <p>Performance: ${details.Performance}</p>
                <p>BestPractices: ${details.BestPractices}</p>
            </div>
          `;
        case 'cpx':
            return `
            <div class="details ${type}-details">
                <p>Time: ${details.timeSum} ms</p>
                <p>allTagsCount: ${details.allTagsCount}</p>
                <p>allWeigtsSum: ${details.allWeigtsSum}</p>
                <p>ariaAttrsCount: ${details.ariaAttrsCount}</p>
                <p>avgWeights: ${details.avgWeights}</p>
                ${cpxRenderTagsSummary(details.tagsSummary)}

                <p>eventsCount: ${details.eventsCount}</p>
                ${cpxRenderEvents(details.events)}

            </div>
          `;
       
        default:
          console.warn(`Sorry, ${type} not supported yet.`);
          return `<p style="color:red">Sorry, ${type} not supported yet.</p>`;
      }
}

// generate details based on class and id
function generateDetails(title, type, data){
    let out = `<details class="details-first-level"><summary><span>${title}</span></summary><div class="details-content details-sub">`;
    for(const url in data){
        const meta = data[url];
        let details = '';
        const metaSorted = meta.sort((a, b) => (new Date(a.ts).getTime() < new Date(b.ts).getTime()) ? 1 : -1)
        metaSorted.map( detail => {
            let subDetails = '';
            if(type === "all"){
                subDetails = renderDetailsForAllTypes(detail, type);
            }else{
                subDetails = renderDetailsPerType(detail[type], type);
            }
            details += `<details class="details-sub-trigger">
            <summary><span>${detail.ts}</span></summary>
                <div class="details-content details-sub">
                    <p>Audited link: <a href="${url}" target="_blank" rel="noopener noopener">${url} <span class="sr-only">(opens in a new tab)</span></a></p>
                    ${subDetails}
                </div>
            </details>`;
        })
        out += `
        <details class="details-main-trigger" id="${type}---${cleanUrl(url)}">
            <summary><span>${url}</span></summary>
            <div class="details-content">${details}</div>
        </details>
        `;
        
    }
    return out +  `</div>
    </details>`;
}


document.querySelectorAll('.js_generate_details').forEach( details => {
    details.innerHTML = "";
    const type = details.id.split("_")[1];
    const title = details.dataset.title;
    details.innerHTML = generateDetails(title, type, dataCleaned);
})

function histogramDataByType(type, flattened){
    let returned = [];
    switch(type){
        case 'urls':
            let urlControl = {};
            flattened.forEach( audit => {
                if(!urlControl[audit.date]){
                    urlControl[audit.date] = new Set();
                }
                urlControl[audit.date].add(audit.url)
            });
            for(let date in urlControl){
                if(urlControl.hasOwnProperty(date)){
                    const setSize = urlControl[date].size;
                    returned.push({
                        date: date,
                        urls: setSize
                    })
                }
            }
            break;
        case 'a11y':

            let a11yControl = {};
            flattened.forEach( audit => {
                if(!a11yControl[audit.date]){
                    a11yControl[audit.date] = {
                        passes : [],
                        violations : [],
                        incompletes : []
                    };
                }
                
                a11yControl[audit.date].passes.push(audit.aXePasses + audit.siPasses);
                a11yControl[audit.date].violations.push(audit.aXeViolations + audit.siViolations);
                a11yControl[audit.date].incompletes.push(audit.aXeIncomplete + audit.siIncomplete);
                
            });

            for(let date in a11yControl){
                if(a11yControl.hasOwnProperty(date)){
                    const audits = a11yControl[date];
                    const passes_len = audits.passes.length;
                    const passesAvg = audits.passes.reduce((a, b) => a + b, 0) / passes_len;
                    const violations_len = audits.violations.length;
                    const violationsAvg = audits.violations.reduce((a, b) => a + b, 0) / violations_len;
                    const incompletes_len = audits.incompletes.length;
                    const incompletesAvg = audits.incompletes.reduce((a, b) => a + b, 0) / incompletes_len;
                    returned.push({
                        date: date,
                        a11yPassesAvg: passesAvg.toFixed(0),
                        a11yViolationsAvg: violationsAvg.toFixed(0),
                        a11yIncompletesAvg: incompletesAvg.toFixed(0),
                    })
                }
            }
            break;
        case 'seo' :

            let seoControl = {};
            flattened.forEach( audit => {
                if(!seoControl[audit.date]){
                    seoControl[audit.date] = [];
                }
                seoControl[audit.date].push(audit.lhSEO);
            });

            for(let date in seoControl){
                if(seoControl.hasOwnProperty(date)){
                    
                    const seos = seoControl[date];
                    const seos_len = seos.length;
                    const seoAvg = seos.reduce((a, b) => a + b, 0) / seos_len;
                    const seoAvgShort = () => {
                        if(seoAvg.toString().includes('.')){
                            return trimDecimals(seoAvg)
                        }else{
                            return seoAvg;
                        }
                    }
                    returned.push({
                        date: date,
                        seoAvg: seoAvg,
                        seoAvgShort: seoAvgShort()
                    })
                }
            }
            break;
        case 'cpx':
            let cpxControl = {};
            flattened.forEach( audit => {
                if(!cpxControl[audit.date]){
                    cpxControl[audit.date] = {
                        cpxElWeights : [],
                        cpxEvents : [],
                    };
                }
                
                cpxControl[audit.date].cpxElWeights.push(audit.cpxElWeights);
                cpxControl[audit.date].cpxEvents.push(audit.cpxEvents);
                
            });

            for(let date in cpxControl){
                if(cpxControl.hasOwnProperty(date)){
                    const audits = cpxControl[date];
                    const cpxElWeights_len = audits.cpxElWeights.length;
                    const cpxElWeightsAvg = audits.cpxElWeights.reduce((a, b) => a + b, 0) / cpxElWeights_len;
                    const cpxEvents_len = audits.cpxEvents.length;
                    const cpxEventsAvg = audits.cpxEvents.reduce((a, b) => a + b, 0) / cpxEvents_len;
                    
                    returned.push({
                        date: date,
                        cpxElWeightsAvg: cpxElWeightsAvg.toFixed(0),
                        cpxEventsAvg: cpxEventsAvg.toFixed(0)
                    })
                }
            }
            break;
        default:
            throw new Error('"' + type + '" is not defined as type for histogramDataByType');
    }
    return returned;
}

function flattenHistogramData(dataAll){
    let flattened = [];
    for(let url in dataAll){
        if(dataAll.hasOwnProperty(url)){
            let urlData = dataAll[url];
            urlData.forEach( urlDataSingl => {
                urlDataSingl.url = url;
                urlDataSingl.date = urlDataSingl.ts.split(" ")[0];
                flattened.push(urlDataSingl);
            })
        }
    }
    return flattened;
}

function generateHistogramTable(details, dataProp, dataPerType){
    let node = document.createElement("div");
    node.setAttribute("class", "histogram-table-holder table-wrapper")
    let returnedHtml = `<table class="histogram-table ${dataProp}-histogram-table">
    <caption>${dataProp} - histogram table</caption>
    <tr>
    <th scope="col">Date:</th>
    <th scope="col">${dataProp}:</th>
    </tr>
    <tbody>`;

    let dataPerTypeDesc = dataPerType.sort( (a,b) => new Date(b.date).getTime() -  new Date(a.date).getTime());

    dataPerTypeDesc.forEach( item => {
        returnedHtml += `<tr>
        <td>${item.date}</td>
        <td>${item[dataProp] !== "NaN" ? item[dataProp] : "Unknown"}</td>
        <tr>`;
    });

    returnedHtml += `</table>`;

    node.innerHTML = returnedHtml;

    details.appendChild(node);
  
}

document.querySelectorAll('.js_histogram').forEach( details => {
    details.innerHTML = "";
    const type = details.dataset.set.split("_")[1];
    const dataProp = details.dataset.prop;
    const flattened = flattenHistogramData(historicalCleaned);
    const dataPerType = histogramDataByType(type, flattened);
    generateHistogram(details, dataProp, dataPerType);
    generateHistogramTable(details, dataProp, dataPerType, 5);
})